const express = require("express");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());

mongoose.connect("mongodb://localhost:27017/chatdb");

const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  time: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

const server = app.listen(3001, () => {
  console.log("Server running on port 3001");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (data) => {
    const msg = JSON.parse(data);

    const savedMessage = await Message.create(msg);

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(savedMessage));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
