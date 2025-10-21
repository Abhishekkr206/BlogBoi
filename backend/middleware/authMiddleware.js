const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Main auth middleware - verifies access token
const Auth = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  
  if (!accessToken) {
    return res.status(401).json({ 
      message: "Access token not found",
      requiresRefresh: true // Signal frontend to refresh token
    });
  }
  
  try {
    const user = jwt.verify(accessToken, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Access token expired",
        requiresRefresh: true // Signal frontend to call /refresh endpoint
      });
    }
    
    return res.status(401).json({ 
      message: "Invalid access token",
      requiresRefresh: false // Invalid token, need to login again
    });
  }
};

// Optional authentication - for guest users
const optionalAuth = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  
  if (accessToken) {
    try {
      const user = jwt.verify(accessToken, JWT_SECRET);
      req.user = user; // User is logged in
    } catch (err) {
      req.user = null; // Invalid token, treat as guest
    }
  } else {
    req.user = null; // No token, treat as guest
  }
  
  next(); // Always continue
};

module.exports = { Auth, optionalAuth };