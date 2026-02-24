// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

// Protect middleware (JWT verification)
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // contains id + role
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  };
};