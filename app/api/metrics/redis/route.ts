import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTelemetrySnapshot } from "@/lib/telemetry";
import { redisClient } from "@/lib/redis";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const telemetry = await getTelemetrySnapshot();
  const provider =
    redisClient.provider === "none"
      ? "none"
      : redisClient.provider === "upstash"
        ? "upstash"
        : "local";

  let connected = false;
  let latency = -1;

  if (redisClient.isAvailable) {
    const startedAt = Date.now();
    try {
      await redisClient.get("__redis_health_probe__");
      connected = true;
      latency = Date.now() - startedAt;
    } catch {
      connected = false;
      latency = -1;
    }
  }

  return NextResponse.json({
    ...telemetry,
    redis: {
      connected,
      provider,
      latency,
    },
  });
}
