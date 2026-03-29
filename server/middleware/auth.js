const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Access denied.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Role-based access control
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Requires role: ${roles.join(' or ')}` });
  }
  next();
};

// Tutor must be approved
const requireApproved = (req, res, next) => {
  if (req.user.role === 'tutor' && !req.user.approved) {
    return res.status(403).json({ message: 'Your tutor account is pending admin approval.' });
  }
  next();
};

module.exports = { protect, authorize, requireApproved };
