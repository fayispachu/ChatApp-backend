import Message from "../models/Message.js";

export const getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: otherUserId },
        { sender: otherUserId, receiver: req.userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(
      messages.map((m) => ({
        ...m.toObject(),
        sender: String(m.sender),
        receiver: String(m.receiver),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
