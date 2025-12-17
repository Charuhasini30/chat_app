const express = require("express");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ----- LOGIN (simple, demo only) -----
const users = {
  user1: "123",
  user2: "123"
};

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    return res.json({ ok: true, username });
  }
  return res.status(401).json({ ok: false });
});

// ----- DB -----
mongoose.connect("mongodb://localhost:27017/chatdb");

const Message = mongoose.model("Message", new mongoose.Schema({
  from: String,
  to: String,
  text: String,
  time: { type: Date, default: Date.now }
}));

// ----- SERVER -----
const server = app.listen(3001, () =>
  console.log("Server running on 3001")
);

const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on("connection", (ws) => {
  ws.on("message", async (data) => {
    const msg = JSON.parse(data);

    // identify user
    if (msg.type === "identify") {
      clients.set(msg.user, ws);
      return;
    }

    // chat message
    const saved = await Message.create(msg);

    // send to sender
    clients.get(msg.from)?.send(JSON.stringify(saved));

    // send to receiver
    clients.get(msg.to)?.send(JSON.stringify(saved));
  });

  ws.on("close", () => {
    for (let [u, s] of clients.entries()) {
      if (s === ws) clients.delete(u);
    }
  });
});
