import { createServer } from "http";
import { WebSocketServer } from "ws";

const port = Number(process.env.WS_PORT ?? 8080);

const server = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", service: "websocket" }));
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));

  socket.on("message", (message) => {
    socket.send(
      JSON.stringify({
        type: "echo",
        payload: message.toString(),
        timestamp: Date.now(),
      })
    );
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
