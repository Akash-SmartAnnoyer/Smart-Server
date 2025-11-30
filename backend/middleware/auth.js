const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    req.orgId = user.orgId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Super admin only
const requireSuperAdmin = authorize('super_admin');

// Organization admin or super admin
const requireOrgAdmin = authorize('super_admin', 'org_admin');

// Staff (captain, admin) or org admin or super admin
const requireStaff = authorize('super_admin', 'org_admin', 'captain', 'admin');

module.exports = {
  authenticate,
  authorize,
  requireSuperAdmin,
  requireOrgAdmin,
  requireStaff
};

