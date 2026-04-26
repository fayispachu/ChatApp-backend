import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String }, // Optional for group messages
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // For group messages
  text: { type: String },
  fileUrl: { type: String },
  fileType: { type: String }, // 'image', 'video', 'pdf', etc.
  time: { type: String }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
