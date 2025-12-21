import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },    // store user._id as string
  receiver: { type: String, required: true },  // store user._id as string
  text: { type: String, required: true },
  time: { type: String }                       // e.g., "10:35 AM"
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
