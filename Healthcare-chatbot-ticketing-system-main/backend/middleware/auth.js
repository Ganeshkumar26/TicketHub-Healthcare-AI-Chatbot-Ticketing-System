const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token (required auth)
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ msg: 'No authentication token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to verify JWT token (optional auth)
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      // Set user to null but allow the request to continue for public routes
      req.user = null;
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = await User.findById(decoded.id).select('-password');
    
    next();
  } catch (err) {
    // For optional auth, just set user to null and continue if token is invalid
    req.user = null;
    next();
  }
};

// Middleware to check if user is a healthcare provider
const isHealthcareProvider = (req, res, next) => {
  if (req.user && (req.user.role === 'healthcare_provider' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Not authorized as healthcare provider' });
  }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Not authorized as admin' });
  }
};

module.exports = { auth, optionalAuth, isHealthcareProvider, isAdmin };