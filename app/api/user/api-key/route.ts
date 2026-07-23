import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { formatMaskedApiKey } from "@/lib/apiKey";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { apiKey: true, apiKeyPrefix: true, id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Never return the hash or plaintext — only a masked prefix.
    const masked = user.apiKey
      ? formatMaskedApiKey(
          user.apiKeyPrefix ??
            (user.apiKey.startsWith("arp_") ? user.apiKey.slice(0, 12) : "arp_********"),
        )
      : null;

    return NextResponse.json({
      apiKey: masked,
      hasApiKey: Boolean(user.apiKey),
    });
  } catch (error) {
    console.error("Error fetching API key:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
