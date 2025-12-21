import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import socketHandler from "./socket/socket.js";
import connectDB from "./config/db.js";

const app = express();
app.use(cors({
  origin: "https://teambcz.netlify.app",
}));app.use(express.json());

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

socketHandler(io);

server.listen(5000, () => console.log("Server running"));
