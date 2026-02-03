const express = require("express");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

const wss = new WebSocket.Server({ server });

const players = {};

wss.on("connection", ws => {
  const id = Math.random().toString(36).slice(2);

  players[id] = {
    id,
    x: Math.random() * 500,
    y: Math.random() * 500,
    angle: 0,
    speed: 0
  };

  ws.send(JSON.stringify({ type: "init", id }));

  ws.on("message", msg => {
    const data = JSON.parse(msg);
    if (data.type === "state") {
      players[id] = { ...players[id], ...data.state };
    }
  });

  ws.on("close", () => {
    delete players[id];
  });
});

// broadcast loop
setInterval(() => {
  const snapshot = JSON.stringify({
    type: "players",
    players
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(snapshot);
    }
  });
}, 50);
    
