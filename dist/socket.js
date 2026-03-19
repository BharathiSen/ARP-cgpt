"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const ws_1 = require("ws");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const port = Number(process.env.WS_PORT ?? 8080);
const server = (0, http_1.createServer)((_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "websocket" }));
});
const wss = new ws_1.WebSocketServer({ server });
wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
    socket.on("message", async (data) => {
        try {
            const parsed = JSON.parse(data.toString());
            if (parsed.type === "simulate") {
                const { projectId, endpoint, failureRate = 0, latency = 0 } = parsed.payload || {};
                if (!projectId || !endpoint) {
                    socket.send(JSON.stringify({ type: "error", message: "Missing projectId or endpoint" }));
                    return;
                }
                const random = Math.random() * 100;
                const isFailed = random < failureRate;
                const status = isFailed ? 'FAILED' : 'SUCCESS';
                const actualLatency = isFailed
                    ? (Number(latency) + Math.random() * 500)
                    : (Number(latency) + Math.random() * 50);
                let insight = '';
                if (isFailed) {
                    insight = `Endpoint failed under ${failureRate}% error injection. Check if ${endpoint} handles graceful degradation.`;
                }
                else if (actualLatency > 500) {
                    insight = `Endpoint is slow (avg. ${actualLatency.toFixed(0)}ms). Consider optimization or better scaling.`;
                }
                else {
                    insight = `Endpoint performed well under simulation. System is resilient to current failure rates.`;
                }
                const simulation = await prisma.simulation.create({
                    data: {
                        projectId,
                        endpoint,
                        failureRate: parseFloat(failureRate.toString()),
                        latency: parseInt(latency.toString(), 10),
                        status,
                        avgLatency: actualLatency,
                        insight,
                    },
                });
                socket.send(JSON.stringify({
                    type: "simulation_result",
                    payload: simulation,
                    timestamp: Date.now(),
                }));
            }
            else {
                socket.send(JSON.stringify({
                    type: "echo",
                    payload: parsed,
                    timestamp: Date.now(),
                }));
            }
        }
        catch (e) {
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
