import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AgentService } from "./services/agentService";
import { AgentMessage } from "./types";

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialize agent service
const agentService = new AgentService();

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Main agent endpoint
app.post("/agent/message", async (req, res) => {
  try {
    const { message, session_id } = req.body as AgentMessage;

    if (!message || !session_id) {
      return res.status(400).json({
        error: "Missing required fields: message and session_id",
      });
    }

    const response = await agentService.processMessage({ message, session_id });
    res.json(response);
  } catch (error) {
    console.error("Agent endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Error handling middleware
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
);

// Start server
async function startServer() {
  try {
    await agentService.initialize();

    app.listen(port, () => {
      console.log(`🚀 AI Agent Server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
      console.log(
        `Agent endpoint: POST http://localhost:${port}/agent/message`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
