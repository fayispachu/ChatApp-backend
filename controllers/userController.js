import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
