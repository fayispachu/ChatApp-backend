import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json("No token");

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id.toString();
    next();
  } catch (err) {
    return res.status(401).json("Token invalid");
  }
};
