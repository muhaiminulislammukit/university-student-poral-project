const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect route middleware - verify JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Try to get user from DB, fallback to token payload for mock mode
    try {
      req.user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {
      // If DB not available, use mock user from token
      req.user = { _id: decoded.id, role: decoded.role, id: decoded.id };
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Role authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' cannot access this resource.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
