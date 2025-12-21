import jwt from "jsonwebtoken";
import Message from "../models/Message.js";

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
    // console.log("User connected:", socket.userId);

    socket.on("send_message", async ({ receiver, text }) => {
      const msg = await Message.create({
        sender: socket.userId,
        receiver: receiver.toString(),
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      io.to(receiver).emit("receive_message", msg); // receiver
      socket.emit("receive_message", msg);          // sender
    });
  });
};

export default socketHandler;
