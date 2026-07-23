import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runRealSimulation } from "@/lib/simulator";
import { checkRateLimit } from "@/lib/rateLimiter";
import prisma from "@/lib/prisma";
import { assertSafeHttpUrl, UnsafeUrlError } from "@/lib/urlSafety";
import { findOwnedProject } from "@/lib/projectAccess";
import { parseProbeOptions } from "@/lib/probeOptions";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userEmail = session.user.email;
  if (!userEmail) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, isPaid: true },
  });

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const endpoint = searchParams.get("endpoint");
  const method = searchParams.get("method") ?? undefined;
  const concurrency = searchParams.get("concurrency") ?? undefined;
  const headers = searchParams.get("headers") ?? undefined;
  const body = searchParams.get("body") ?? undefined;

  if (!projectId || !endpoint) {
    return new Response("Missing parameters", { status: 400 });
  }

  const project = await findOwnedProject(projectId, user.id);
  if (!project) {
    return new Response(
      JSON.stringify({ message: "Project not found or access denied" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const probeParsed = parseProbeOptions({
    method,
    concurrency,
    headers,
    body,
  });
  if (!probeParsed.ok) {
    return new Response(JSON.stringify({ message: probeParsed.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let safeEndpoint: string;
  try {
    safeEndpoint = await assertSafeHttpUrl(endpoint);
  } catch (err) {
    const message =
      err instanceof UnsafeUrlError
        ? err.message
        : "Invalid or unsafe endpoint URL";
    return new Response(JSON.stringify({ message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rateLimit = await checkRateLimit(user.id, user.isPaid);
  if (!rateLimit.success) {
    return new Response(
      JSON.stringify({ message: "Rate limit exceeded", retryAfter: 60 }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.reset?.toString() || "",
        },
      },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(
          `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
        );
      };

      try {
        const { concurrency: n, method: m } = probeParsed.options;
        sendEvent("status", {
          message:
            n > 1
              ? `Running ${n} concurrent ${m} probes...`
              : `Sending ${m} request...`,
        });
        sendEvent("progress", { progressPercent: 15 });

        const simulation = await runRealSimulation(project.id, safeEndpoint, {
          method: probeParsed.options.method,
          concurrency: probeParsed.options.concurrency,
          headers: probeParsed.options.headers,
          body: probeParsed.options.body,
        });

        sendEvent("latency", {
          value: Math.round(simulation.loadMetrics.p50Ms || simulation.avgLatency),
          p50: simulation.loadMetrics.p50Ms,
          p95: simulation.loadMetrics.p95Ms,
          errorRatePercent: simulation.loadMetrics.errorRatePercent,
          concurrency: simulation.loadMetrics.concurrency,
        });
        sendEvent("progress", { progressPercent: 70 });
        sendEvent("status", { message: "Analyzing with AI..." });
        sendEvent("progress", { progressPercent: 90 });
        sendEvent("complete", { simulation });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Simulation failed to stream";
        sendEvent("error", { message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
