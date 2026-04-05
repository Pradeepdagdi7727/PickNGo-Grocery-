const { json } = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }

  // Extract token from "Bearer token_value"
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    if(user.role !== "customer"){
        return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.user = user; // store user info
    next();          // go to next route
  });
};
