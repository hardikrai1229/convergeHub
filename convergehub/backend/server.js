require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const Document = require("./models/Document");
const Task = require("./models/Task");
const frontendURL = process.env.frontendURL;
// Load environment variables
const app = express();

// Enhanced CORS configuration
app.use(express.json());
app.use(
  cors({
    origin: `${frontendURL}`,
    credentials: true,
  })
);

// Enhanced MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

// Add MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// Routes
app.get("/", (req, res) => res.send("Server is running"));

// Enhanced Task Routes
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).lean();
    if (!tasks.length) {
      console.log("No tasks found in database");
    }
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = new Task({
      title: req.body.title,
      description: req.body.description || "",
      status: req.body.status || "todo",
    });

    const newTask = await task.save();
    console.log("New task created:", newTask); // Log created task
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(400).json({
      message: "Failed to create task",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const updates = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      updatedAt: Date.now(),
    };

    // Remove undefined fields
    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key]
    );

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(400).json({
      message: "Failed to update task",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    console.log("Task deleted:", task._id); // Log deletion
    res.json({
      message: "Task deleted successfully",
      deletedId: task._id,
    });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({
      message: "Failed to delete task",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// WebSocket Server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let documentContent = "";
let clients = new Set();

wss.on("connection", async (ws) => {
  console.log("Client connected");
  clients.add(ws);

  try {
    let document = await Document.findOne();
    if (!document) {
      document = new Document({ content: "", operations: [] });
      await document.save();
    }
    documentContent = document.content;

    ws.send(JSON.stringify({ type: "init", content: documentContent }));
  } catch (err) {
    console.error("Error initializing WebSocket connection:", err);
    ws.close();
  }

  ws.on("message", async (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === "operation") {
        const { operation } = parsedMessage;
        documentContent = applyOperation(documentContent, operation);

        await Document.findOneAndUpdate(
          {},
          {
            content: documentContent,
            $push: { operations: operation },
          },
          { upsert: true, new: true }
        );

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

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });
});

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

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
