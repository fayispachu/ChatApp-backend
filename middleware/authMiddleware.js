import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json("No token");

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "SECRET");
    req.userId = decoded.id; // this must match the token payload
    next();
  } catch (err) {
    return res.status(401).json("Token invalid");
  }
};
