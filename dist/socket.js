"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const ws_1 = require("ws");
const port = Number(process.env.WS_PORT ?? 8080);
const server = (0, http_1.createServer)((_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "websocket" }));
});
const wss = new ws_1.WebSocketServer({ server });
wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
    socket.on("message", (message) => {
        socket.send(JSON.stringify({
            type: "echo",
            payload: message.toString(),
            timestamp: Date.now(),
        }));
    });
});
server.listen(port, () => {
    console.log(`WebSocket server listening on :${port}`);
});
const shutdown = () => {
    wss.close(() => {
        server.close(() => {
            process.exit(0);
        });
    });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
