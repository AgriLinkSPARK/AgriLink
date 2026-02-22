import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  // Extract token from 'Bearer <token>'
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    // This is the message you saw; it triggers if the token is missing
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds { id, role } to the request
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};