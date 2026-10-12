import http from 'http';
import fs from 'fs';
import WebSocket, { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });

  res.end("./public/index.html");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket, req) => {
  const username = new URL(req.url, "http://localhost").searchParams.get("username");

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "system", text: `${username} joined`}));
    }
  });

  socket.on("message", function message(data) {
    let username = "";
    let text = "";

    try {
      const parsedData = JSON.parse(data);
      username = parsedData.username;
      text = parsedData.text;
    } catch (err) {
      console.error(err);
    }

    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "chat", username, text}));
      }
    });
  });

  socket.on("close", function close() {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "system", text: `${username} left`}));
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost: ${PORT}`);
});

