import { createServer } from "http";
import { WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const port = Number(process.env.WS_PORT ?? 8080);

const server = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", service: "websocket" }));
});

const wss = new WebSocketServer({ server });

async function executeRealWS(projectId: string, endpoint: string) {
  const startTime = Date.now();
  let isFailed = false;
  let actualLatency = 0;
  let statusCode = 0;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/json,text/plain',
      },
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined
    });
    
    actualLatency = Date.now() - startTime;
    statusCode = response.status;
    isFailed = !response.ok;
  } catch (err: any) {
    actualLatency = Date.now() - startTime;
    isFailed = true;
    statusCode = (err.name === 'TimeoutError' || err.name === 'AbortError') ? 408 : 500;
  }

  const status = isFailed ? 'FAILED' : 'SUCCESS';

  let insight = '';
  if (isFailed) {
    if (statusCode === 408) {
      insight = `Endpoint timed out (>${actualLatency}ms). Suggest increasing API timeouts or vertically scaling.`;
    } else if (statusCode === 401 || statusCode === 403) {
      insight = `Endpoint returned HTTP ${statusCode} (Unauthorized/Forbidden). Ensure your testing agent passes required Authentication headers or tokens.`;
    } else if (statusCode === 429) {
      insight = `Endpoint returned HTTP 429 (Too Many Requests). A Rate Limit or WAF (like Cloudflare) is blocking the test.`;
    } else {
      insight = `Endpoint returned HTTP ${statusCode}. Suggest implementing retry with exponential backoff.`;
    }
  } else {
    if (actualLatency > 800) {
      insight = `Endpoint is slow (latency: ${actualLatency}ms). Consider caching or DB optimization.`;
    } else {
      insight = `Endpoint performed securely with ${actualLatency}ms latency and status ${statusCode}.`;
    }
  }

  const simulation = await prisma.simulation.create({
    data: { projectId, endpoint, failureRate: isFailed ? 100 : 0, latency: Math.round(actualLatency), status, avgLatency: actualLatency, insight },
  });

  return simulation;
}

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));

  socket.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.type === "simulate") {
        const { projectId, endpoint } = parsed.payload || {};

        if (!projectId || !endpoint) {
          socket.send(JSON.stringify({ type: "error", message: "Missing projectId or endpoint" }));
          return;
        }

        const simulation = await executeRealWS(projectId, endpoint);

        socket.send(JSON.stringify({
          type: "simulation_result",
          payload: simulation,
          timestamp: Date.now(),
        }));
      } else {
        socket.send(
          JSON.stringify({
            type: "echo",
            payload: parsed,
            timestamp: Date.now(),
          })
        );
      }
    } catch (e) {
      console.error("Error processing websocket message:", e);
      socket.send(JSON.stringify({ type: "error", message: "Invalid message format or server error" }));
    }
  });
});

server.listen(port, () => {
  console.log(`WebSocket server listening on :${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
