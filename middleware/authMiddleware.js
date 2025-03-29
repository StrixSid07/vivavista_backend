const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access forbidden: Admins only" });
  }
  next();
};

module.exports = { protect, isAdmin };
