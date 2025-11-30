const express = require('express');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { authenticate, requireSuperAdmin, requireOrgAdmin } = require('../middleware/auth');
const router = express.Router();

// Route for org admins to update their own organization settings (before super admin middleware)
router.put('/settings/:orgId', authenticate, async (req, res) => {
  try {
    const { settings } = req.body;
    const { orgId } = req.params;

    // Verify user has access to this organization
    if (req.user.role !== 'super_admin' && req.user.orgId !== orgId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const organization = await Organization.findOne({ orgId });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Only allow updating settings (not other fields like name, email, etc.)
    if (settings) {
      organization.settings = {
        ...organization.settings,
        ...settings
      };
    }

    await organization.save();

    res.json({
      orgId: organization.orgId,
      settings: organization.settings
    });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// All routes below require super admin authentication
router.use(authenticate);
router.use(requireSuperAdmin);

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single organization with restaurant details
router.get('/:id', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get restaurant details
    const restaurant = await Restaurant.findOne({ orgId: organization.orgId });
    
    // Get admin user
    const adminUser = await User.findOne({ 
      organizationId: organization._id, 
      role: 'org_admin' 
    }).select('-password');

    res.json({
      organization,
      restaurant: restaurant || null,
      admin: adminUser || null
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create organization with admin user and restaurant
router.post('/', async (req, res) => {
  try {
    const { 
      // Organization details
      name, 
      email, 
      phone, 
      address,
      // Admin user details
      adminUsername,
      adminPassword,
      adminName,
      // Restaurant details
      restaurantName,
      restaurantPhone,
      restaurantEmail,
      restaurantAddress,
      restaurantPosition, // [latitude, longitude]
      restaurantLogo
    } = req.body;

    // Validate required fields
    if (!name || !email || !adminUsername || !adminPassword) {
      return res.status(400).json({ 
        error: 'Name, email, adminUsername, and adminPassword are required' 
      });
    }

    // Check if email already exists
    const existingOrg = await Organization.findOne({ email: email.toLowerCase() });
    if (existingOrg) {
      return res.status(400).json({ error: 'Organization with this email already exists' });
    }

    // Check if admin username already exists (globally unique)
    const existingUser = await User.findOne({ username: adminUsername });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists. Please choose a different username.' });
    }

    // Generate unique orgId
    let orgId;
    let isUnique = false;
    while (!isUnique) {
      orgId = `ORG${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const exists = await Organization.findOne({ orgId });
      if (!exists) isUnique = true;
    }

    // Create organization
    const organization = new Organization({
      name,
      email: email.toLowerCase(),
      phone: phone || restaurantPhone,
      address: address || restaurantAddress,
      orgId,
      isActive: true
    });

    await organization.save();

    // Create organization admin user
    const adminUser = new User({
      username: adminUsername,
      email: email.toLowerCase(),
      password: adminPassword,
      role: 'org_admin',
      organizationId: organization._id,
      orgId: organization.orgId,
      name: adminName || name,
      isActive: true
    });

    await adminUser.save();

    // Create restaurant record with all details
    const restaurant = new Restaurant({
      organizationId: organization._id,
      orgId: organization.orgId,
      name: restaurantName || name,
      email: restaurantEmail || email.toLowerCase(),
      phone: restaurantPhone || phone,
      address: restaurantAddress || address,
      position: restaurantPosition || [0, 0],
      logo: restaurantLogo || null,
      lastUpdated: new Date()
    });

    await restaurant.save();

    res.status(201).json({
      organization: {
        id: organization._id,
        name: organization.name,
        orgId: organization.orgId,
        email: organization.email,
        slug: organization.slug,
        phone: organization.phone,
        address: organization.address
      },
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        position: restaurant.position
      },
      admin: {
        username: adminUser.username,
        role: adminUser.role,
        name: adminUser.name
      },
      credentials: {
        orgId: organization.orgId,
        username: adminUser.username,
        password: adminPassword, // Return password only on creation
        loginUrl: '/api/auth/org-admin/login'
      },
      message: 'Organization, restaurant, and admin user created successfully'
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update organization
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, isActive, subscription, settings } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (name) organization.name = name;
    if (email) organization.email = email.toLowerCase();
    if (phone !== undefined) organization.phone = phone;
    if (address !== undefined) organization.address = address;
    if (isActive !== undefined) organization.isActive = isActive;
    if (subscription) organization.subscription = { ...organization.subscription, ...subscription };
    
    // Update settings (including allowDirectOrdering)
    if (settings) {
      organization.settings = {
        ...organization.settings,
        ...settings
      };
    }

    await organization.save();

    res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete organization (soft delete - set isActive to false)
router.delete('/:id', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    organization.isActive = false;
    await organization.save();

    // Deactivate all users in this organization
    await User.updateMany(
      { organizationId: organization._id },
      { isActive: false }
    );

    res.json({ message: 'Organization deactivated successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get organization users
router.get('/:id/users', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const users = await User.find({ organizationId: organization._id })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching organization users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password for organization user
router.post('/:id/users/:userId/reset-password', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const user = await User.findOne({ 
      _id: userId, 
      organizationId: organization._id 
    }).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ 
      message: 'Password reset successfully',
      username: user.username
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Create user for organization
router.post('/:id/users', async (req, res) => {
  try {
    const { username, password, role, name, email, phone, tableNumber } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    // Validate role
    const validRoles = ['org_admin', 'captain', 'admin', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if username already exists (globally unique)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists. Please choose a different username.' });
    }

    const user = new User({
      username,
      password,
      role,
      organizationId: organization._id,
      orgId: organization.orgId,
      name,
      email,
      phone,
      tableNumber: role === 'customer' ? tableNumber : undefined,
      isActive: true
    });

    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;
