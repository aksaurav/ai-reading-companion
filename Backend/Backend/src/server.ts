// backend/src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import ingestRoutes from "./routes/ingestRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Establish Database connection
connectDB();

// Mount API routes
app.use("/api/items", itemRoutes);
app.use("/api/ai", aiRoutes);

// FIX: Explicitly specify /ingest and /query so they resolve cleanly
app.use("/api/ingest", ingestRoutes); // Resolves to: /api/ingest
app.use("/api/query", chatRoutes); // Resolves to: /api/query (matches ChatPanel.tsx)

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running smoothly" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
