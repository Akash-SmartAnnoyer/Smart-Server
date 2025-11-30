const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    { expiresIn: '7d' }
  );
};

// Super Admin Login
router.post('/super-admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await User.findOne({ username, role: 'super_admin' }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Super admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Organization Admin Login
router.post('/org-admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user by username with org_admin role
    const user = await User.findOne({ 
      username, 
      role: 'org_admin' 
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Check if organization is active
    const org = await Organization.findOne({ orgId: user.orgId, isActive: true });
    if (!org) {
      return res.status(401).json({ error: 'Organization is inactive' });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        orgId: user.orgId,
        organizationId: user.organizationId,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Org admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Staff Login (Captain/Admin)
router.post('/staff/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user by username with staff role
    const user = await User.findOne({ 
      username, 
      role: { $in: ['captain', 'admin'] }
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Check if organization is active
    const org = await Organization.findOne({ orgId: user.orgId, isActive: true });
    if (!org) {
      return res.status(401).json({ error: 'Organization is inactive' });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        orgId: user.orgId,
        organizationId: user.organizationId,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Customer Access (via QR/Table Link) - No login required, just get orgId
router.get('/customer/access/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;

    const org = await Organization.findOne({ orgId, isActive: true });
    
    if (!org) {
      return res.status(404).json({ error: 'Organization not found or inactive' });
    }

    res.json({
      orgId: org.orgId,
      organizationId: org._id,
      name: org.name,
      access: 'granted'
    });
  } catch (error) {
    console.error('Customer access error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('organizationId', 'name orgId email')
      .select('-password');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        orgId: user.orgId,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

