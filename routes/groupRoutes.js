import express from "express";
import Group from "../models/Group.js";
import Message from "../models/Message.js";

const router = express.Router();

// Create a group
router.post("/", async (req, res) => {
  try {
    const { name, members, admin } = req.body;
    const group = await Group.create({ name, members, admin });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all groups for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const groups = await Group.find({ members: req.params.userId });
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add member to group
router.put("/:groupId/add", async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.groupId,
      { $addToSet: { members: req.body.userId } },
      { new: true }
    );
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Leave group
router.put("/:groupId/leave", async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.groupId,
      { $pull: { members: req.body.userId } },
      { new: true }
    );
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get group messages
router.get("/:groupId/messages", async (req, res) => {
  try {
    const messages = await Message.find({ groupId: req.params.groupId });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
