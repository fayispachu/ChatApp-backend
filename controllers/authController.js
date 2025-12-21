import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  await User.create({ username, password: hashed });

  res.json("Registered");
};

export const login = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).json("Invalid");

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.status(400).json("Invalid");

  const token = jwt.sign({ id: user._id }, "SECRET");
  res.json({ token, userId: user._id });
};
