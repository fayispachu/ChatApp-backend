import jwt from "jsonwebtoken";
import Message from "../models/Message.js";

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: token missing"));

    try {
      const decoded = jwt.verify(token, "SECRET");
      socket.userId = decoded.id.toString();
      socket.join(decoded.id);
      next();
    } catch (err) {
      return next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    
    // Broadcast that a user is online
    io.emit("user_status", { userId: socket.userId, status: "online" });

    // Send current online users to the connected user
    socket.emit("online_users", Array.from(onlineUsers.keys()));

    socket.on("send_message", async ({ receiver, text, fileUrl, fileType }) => {
      const msg = await Message.create({
        sender: socket.userId,
        receiver: receiver.toString(),
        text,
        fileUrl,
        fileType,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      io.to(receiver).emit("receive_message", msg);
      socket.emit("receive_message", msg);
    });

    // --- Signaling for Calling ---
    socket.on("call_user", ({ receiver, offer, isVideo }) => {
      io.to(receiver).emit("incoming_call", { sender: socket.userId, offer, isVideo });
    });

    socket.on("answer_call", ({ receiver, answer }) => {
      io.to(receiver).emit("call_answered", { sender: socket.userId, answer });
    });

    socket.on("ice_candidate", ({ receiver, candidate }) => {
      io.to(receiver).emit("ice_candidate", { sender: socket.userId, candidate });
    });

    socket.on("end_call", ({ receiver }) => {
      io.to(receiver).emit("call_ended");
    });
    // ----------------------------

    socket.on("typing", ({ receiver }) => {
      io.to(receiver).emit("display_typing", { sender: socket.userId });
    });

    socket.on("stop_typing", ({ receiver }) => {
      io.to(receiver).emit("hide_typing", { sender: socket.userId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      io.emit("user_status", { userId: socket.userId, status: "offline" });
    });
  });
};

export default socketHandler;
