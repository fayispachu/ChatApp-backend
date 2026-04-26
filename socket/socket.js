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

    // Join group rooms
    socket.on("join_groups", (groups) => {
      groups.forEach(groupId => socket.join(groupId));
      console.log(`User ${socket.userId} joined groups:`, groups);
    });

    socket.on("send_message", async ({ receiver, groupId, text, fileUrl, fileType }) => {
      const msgData = {
        sender: socket.userId,
        text,
        fileUrl,
        fileType,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      if (groupId) {
        msgData.groupId = String(groupId);
        const msg = await Message.create(msgData);
        io.to(String(groupId)).emit("receive_message", msg);
      } else {
        msgData.receiver = String(receiver);
        const msg = await Message.create(msgData);
        io.to(String(receiver)).emit("receive_message", msg);
        socket.emit("receive_message", msg);
      }
    });

    // --- Signaling for Calling ---
    socket.on("call_user", ({ receiver, groupId, offer, isVideo }) => {
      if (groupId) {
        socket.to(String(groupId)).emit("incoming_call", { sender: socket.userId, offer, isVideo, groupId: String(groupId) });
      } else {
        io.to(String(receiver)).emit("incoming_call", { sender: socket.userId, offer, isVideo });
      }
    });

    socket.on("answer_call", ({ receiver, answer }) => {
      io.to(String(receiver)).emit("call_answered", { sender: socket.userId, answer });
    });

    socket.on("ice_candidate", ({ receiver, candidate }) => {
      io.to(String(receiver)).emit("ice_candidate", { sender: socket.userId, candidate });
    });

    socket.on("end_call", ({ receiver }) => {
      io.to(String(receiver)).emit("call_ended");
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
