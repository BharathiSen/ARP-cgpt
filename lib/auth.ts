import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

import type { Adapter } from "next-auth/adapters";

type AppUserClaims = {
  id: string;
  isAdmin?: boolean;
  isPaid?: boolean;
};

type AppSessionUser = {
  id?: string;
  isAdmin?: boolean;
  isPaid?: boolean;
};

/** Admin emails from ADMIN_EMAILS / ADMIN_EMAIL (comma-separated). No hardcoded addresses. */
function isConfiguredAdminEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  const allowed = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const providedPassword = credentials.password;

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          providedPassword,
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        // Admin = DB flag OR email listed in ADMIN_EMAIL / ADMIN_EMAILS env.
        // Never hardcode personal emails in source code.
        const isAdmin =
          user.isAdmin || isConfiguredAdminEmail(user.email);

        // If they match the env allowlist, persist isAdmin in the database
        // so later logins work even if env changes temporarily.
        if (isAdmin && !user.isAdmin) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isAdmin: true },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin,
          isPaid: user.isPaid,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (trigger === "update" && session?.isPaid) {
        token.isPaid = session.isPaid;
      }
      if (user) {
        const appUser = user as typeof user & AppUserClaims;
        token.id = appUser.id;
        token.isAdmin = Boolean(appUser.isAdmin);
        token.isPaid = Boolean(appUser.isPaid);
      } else if (trigger === "update") {
        const u = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (u) {
          token.isAdmin = u.isAdmin;
          token.isPaid = u.isPaid;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        const sessionUser = session.user as typeof session.user &
          AppSessionUser;
        const tokenClaims = token as typeof token & {
          isAdmin?: boolean;
          isPaid?: boolean;
        };
        sessionUser.id = token.id as string;
        sessionUser.isAdmin = Boolean(tokenClaims.isAdmin);
        sessionUser.isPaid = Boolean(tokenClaims.isPaid);
      }
      return session;
    },
  },
};
