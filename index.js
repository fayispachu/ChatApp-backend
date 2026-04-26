import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import socketHandler from "./socket/socket.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// ✅ CORS (production + local)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://teambcz.netlify.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Middleware
app.use(express.json());

// ✅ Ensure uploads folder exists
const __dirname = path.resolve();
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// ✅ Static files
app.use("/uploads", express.static(uploadPath));

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

// ✅ Basic test route (important for debugging)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Error handler (prevents silent crashes)
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Server Error" });
});

// ✅ Server + Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io);

// ✅ PORT FIX (CRITICAL for Render)
const PORT = process.env.PORT || 5000;

// ✅ Start server AFTER DB connection
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup error:", error.message);
    process.exit(1);
  }
};

startServer();