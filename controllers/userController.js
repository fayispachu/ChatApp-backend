import User from "../models/User.js";

export const getUsers = async (req, res) => {
  const users = await User.find(
    { _id: { $ne: req.userId } },
    { password: 0 }
  );

  res.json(users);
};
