import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { logApiRequest } from "@/lib/logger";
import { redisClient } from "@/lib/redis";
import { createHash } from "crypto";
import { assertSafeHttpUrl, UnsafeUrlError } from "@/lib/urlSafety";
import { findOwnedProject } from "@/lib/projectAccess";
import { runRealSimulation } from "@/lib/simulator";
import { parseProbeOptions } from "@/lib/probeOptions";

function simulationCacheKey(
  userId: string,
  projectId: string,
  endpoint: string,
  method: string,
  concurrency: number,
) {
  const endpointHash = createHash("sha256")
    .update(`${method}:${concurrency}:${endpoint}`)
    .digest("hex")
    .slice(0, 20);
  return `simulation:v2:user:${userId}:project:${projectId}:endpoint:${endpointHash}`;
}

export async function POST(req: Request) {
  try {
    let user = null;

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const apiKeyValue = authHeader.substring(7);
      const { findUserByApiKey } = await import("@/lib/apiKey");
      user = await findUserByApiKey(apiKeyValue);
    }

    if (!user) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          status: 401,
          errorType: "auth_error",
          message: "Unauthorized: Invalid API Key or Session",
        },
        { status: 401 },
      );
    }

    const rateLimit = await checkRateLimit(user.id, user.isPaid);
    if (!rateLimit.success) {
      await logApiRequest({
        userId: user.id,
        endpoint: "simulate",
        status: 429,
        latency: 0,
      });
      return NextResponse.json(
        {
          status: 429,
          errorType: "rate_limit",
          message: "Rate limit exceeded",
          retryAfter: 60,
        },
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

    const body = await req.json();
    const { projectId, endpoint, method, concurrency, headers, body: requestBody } =
      body;

    if (!projectId || !endpoint) {
      await logApiRequest({
        userId: user.id,
        endpoint: "simulate",
        status: 400,
        latency: 0,
      });
      return NextResponse.json(
        {
          status: 400,
          errorType: "validation_error",
          message: "Missing required parameters: projectId and endpoint",
        },
        { status: 400 },
      );
    }

    const project = await findOwnedProject(projectId, user.id);
    if (!project) {
      await logApiRequest({
        userId: user.id,
        endpoint: "simulate",
        status: 404,
        latency: 0,
      });
      return NextResponse.json(
        {
          status: 404,
          errorType: "not_found",
          message: "Project not found or access denied",
        },
        { status: 404 },
      );
    }

    const probeParsed = parseProbeOptions({
      method,
      concurrency,
      headers,
      body: requestBody,
    });
    if (!probeParsed.ok) {
      return NextResponse.json(
        {
          status: 400,
          errorType: "validation_error",
          message: probeParsed.error,
        },
        { status: 400 },
      );
    }

    let safeEndpoint: string;
    try {
      safeEndpoint = await assertSafeHttpUrl(endpoint);
    } catch (err) {
      const message =
        err instanceof UnsafeUrlError
          ? err.message
          : "Invalid or unsafe endpoint URL";
      return NextResponse.json(
        {
          status: 400,
          errorType: "validation_error",
          message,
        },
        { status: 400 },
      );
    }

    const cacheKey = simulationCacheKey(
      user.id,
      project.id,
      safeEndpoint,
      probeParsed.options.method,
      probeParsed.options.concurrency,
    );

    // Skip cache for customized headers/body — results should reflect live config.
    const canUseCache =
      Object.keys(probeParsed.options.headers).length === 0 &&
      !probeParsed.options.body;

    if (canUseCache && redisClient.isAvailable) {
      const cached = await redisClient.get<{
        latency: number;
        status: string;
        ai: unknown;
        loadMetrics: unknown;
      }>(cacheKey);

      if (cached) {
        const simulation = await prisma.simulation.create({
          data: {
            projectId: project.id,
            endpoint: safeEndpoint,
            failureRate: cached.status === "FAILED" ? 100 : 0,
            latency: Math.round(cached.latency),
            status: cached.status,
            avgLatency: cached.latency,
            insight: JSON.stringify(cached.ai ?? {}),
          },
          select: {
            id: true,
            projectId: true,
            endpoint: true,
            failureRate: true,
            latency: true,
            status: true,
            avgLatency: true,
            insight: true,
            createdAt: true,
          },
        });

        await redisClient.del(`user_projects:${user.id}`);

        return NextResponse.json({
          ...simulation,
          ai: cached.ai,
          loadMetrics: cached.loadMetrics,
          cached: true,
        });
      }
    }

    // Run the probe now (no background Job queue).
    const simulation = await runRealSimulation(project.id, safeEndpoint, {
      method: probeParsed.options.method,
      concurrency: probeParsed.options.concurrency,
      headers: probeParsed.options.headers,
      body: probeParsed.options.body,
    });

    if (canUseCache && redisClient.isAvailable) {
      await redisClient.set(
        cacheKey,
        {
          latency: simulation.avgLatency,
          status: simulation.status,
          ai: simulation.ai,
          loadMetrics: simulation.loadMetrics,
        },
        60,
      );
      await redisClient.del(`user_projects:${user.id}`);
    } else if (redisClient.isAvailable) {
      await redisClient.del(`user_projects:${user.id}`);
    }

    await logApiRequest({
      userId: user.id,
      endpoint: "simulate",
      status: 200,
      latency: simulation.latency,
    });

    return NextResponse.json(simulation);
  } catch (error) {
    console.error("Simulation error:", error);
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status: 500,
        errorType: "internal_error",
        message: "Failed to process simulation request.",
        ...(process.env.NODE_ENV !== "production" ? { detail } : {}),
      },
      { status: 500 },
    );
  }
}
