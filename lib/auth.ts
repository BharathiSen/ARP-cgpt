import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import type { Adapter } from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        const isAdmin = user.email === 'bharathisenthilkumar28@gmail.com' || user.isAdmin;

        if (isAdmin && !user.isAdmin) {
            await prisma.user.update({
                where: { id: user.id },
                data: { isAdmin: true }
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
      if (trigger === 'update' && session?.isPaid) {
        token.isPaid = session.isPaid;
      }
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
        token.isPaid = (user as any).isPaid;
      } else if (trigger === 'update') {
        const u = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (u) {
          token.isAdmin = u.isAdmin;
          token.isPaid = u.isPaid;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).isAdmin = (token as any).isAdmin;
        (session.user as any).isPaid = (token as any).isPaid;
      }
      return session;
    },
  },
};
