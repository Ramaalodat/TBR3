const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify token
module.exports = function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(403).json({ msg: "Authorization denied. No token found." });
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
      return res.status(403).json({ msg: "Authorization token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      console.error('Invalid token structure: userId not found');
      return res.status(401).json({ msg: "Invalid token structure" });
    }

req.user = {
  id: decoded.userId,
  isAdmin: decoded.isAdmin || false
};


    next();
  } catch (err) {
    console.error('Authorization Error:', err.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
