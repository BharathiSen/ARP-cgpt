import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protect dashboard + private APIs.
 * - Browser routes → redirect to /login
 * - API routes → JSON 401 (no redirect, so clients/tests see auth failure clearly)
 * - POST /api/simulate with Bearer key → allowed (API key auth happens in the route)
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const bearerOk =
    pathname === "/api/simulate" &&
    req.method === "POST" &&
    Boolean(req.headers.get("authorization")?.toLowerCase().startsWith("bearer "));

  if (bearerOk) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/projects/:path*",
    "/api/simulate/:path*",
    "/api/simulations/:path*",
    "/api/user/:path*",
    "/api/metrics/:path*",
    "/api/razorpay/:path*",
    "/api/upgrade",
  ],
};
