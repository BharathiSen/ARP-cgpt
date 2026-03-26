import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimiter";
import { createApiKey } from "@/lib/apiKey";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isPaid: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Rate Limiting Check
    const rateLimit = await checkRateLimit(user.id, user.isPaid);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: 60 },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.reset?.toString() || "",
          },
        },
      );
    }

    // Parse optionally provided key name
    let keyName = "Default Key";
    try {
      const body = await req.json();
      if (body?.name) keyName = body.name;
    } catch (e) {}

    const newApiKeyObj = await createApiKey(user.id, keyName);

    return NextResponse.json({ apiKey: newApiKeyObj.key });
  } catch (error) {
    console.error("[API Key Generation] Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
