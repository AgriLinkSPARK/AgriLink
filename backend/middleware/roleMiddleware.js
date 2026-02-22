const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists on req and if their role is in the allowed list
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: Insufficient permissions",
        debug: {
          receivedRole: req.user ? req.user.role : "No user object",
          requiredRoles: allowedRoles
        }
      });
    }
    next();
  };
};

export default authorize;