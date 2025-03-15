require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const Document = require("./models/Document"); // MongoDB Model

// Load environment variables
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => res.send("Server is running"));

// ✅ Create HTTP + WebSocket Server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let documentContent = "";
let clients = new Set();

// ✅ Handle WebSocket Connection
wss.on("connection", async (ws) => {
  console.log("Client connected");
  clients.add(ws);

  // ✅ Fetch document from MongoDB
  let document = await Document.findOne();
  if (!document) {
    document = new Document({ content: "", operations: [] });
    await document.save();
  }
  documentContent = document.content;

  // ✅ Send Initial Content
  ws.send(JSON.stringify({ type: "init", content: documentContent }));

  // ✅ Handle Incoming Messages
  ws.on("message", async (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === "operation") {
        const { operation } = parsedMessage;

        // ✅ Apply OT operation
        documentContent = applyOperation(documentContent, operation);
        document.content = documentContent;
        document.operations.push(operation);
        await document.save();

        // ✅ Broadcast to all clients
        clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "operation", operation }));
          }
        });
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  // ✅ Handle Disconnect
  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });
});

// ✅ Operational Transformation Function
function applyOperation(doc, operation) {
  const { type, index, value } = operation;
  if (type === "insert") {
    return doc.slice(0, index) + value + doc.slice(index);
  }
  if (type === "delete") {
    return doc.slice(0, index) + doc.slice(index + value.length);
  }
  return doc;
}

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
