const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Organization = require('../models/Organization');
const { authenticate, requireStaff } = require('../middleware/auth');

// Public endpoint for customer access (no authentication required)
router.get('/public/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    
    // Verify organization exists and is active
    const org = await Organization.findOne({ orgId, isActive: true });
    if (!org) {
      return res.status(404).json({ error: 'Organization not found or inactive' });
    }
    
    const restaurant = await Restaurant.findOne({ orgId });
    
    if (!restaurant) {
      // Auto-create restaurant if it doesn't exist
      const newRestaurant = new Restaurant({
        organizationId: org._id,
        orgId: org.orgId,
        name: org.name,
        email: org.email,
        phone: org.phone,
        address: org.address
      });
      
      await newRestaurant.save();
      // Include organization settings in response
      return res.json({
        ...newRestaurant.toObject(),
        organizationSettings: org.settings || {}
      });
    }
    
    // Include organization settings in response
    res.json({
      ...restaurant.toObject(),
      organizationSettings: org.settings || {}
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public endpoint for charges (no authentication required)
router.get('/public/:orgId/charges', async (req, res) => {
  try {
    const { orgId } = req.params;
    
    // Verify organization exists and is active
    const org = await Organization.findOne({ orgId, isActive: true });
    if (!org) {
      return res.status(404).json({ error: 'Organization not found or inactive' });
    }
    
    const restaurant = await Restaurant.findOne({ orgId });
    
    if (!restaurant) {
      return res.json([]); // Return empty array if restaurant doesn't exist
    }
    
    res.json(restaurant.charges || []);
  } catch (error) {
    console.error('Error fetching charges:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// All routes below require authentication
router.use(authenticate);
router.use(requireStaff);

// Get restaurant by orgId (authenticated)
router.get('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    
    // Verify user has access to this org
    if (req.user.role !== 'super_admin' && req.user.orgId !== orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const restaurant = await Restaurant.findOne({ orgId });
    
    // Get organization to include settings
    const org = await Organization.findOne({ orgId });
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    if (!restaurant) {
      // Auto-create restaurant if it doesn't exist
      const newRestaurant = new Restaurant({
        organizationId: org._id,
        orgId: org.orgId,
        name: org.name,
        email: org.email,
        phone: org.phone,
        address: org.address
      });
      
      await newRestaurant.save();
      // Include organization settings in response
      return res.json({
        ...newRestaurant.toObject(),
        organizationSettings: org.settings || {}
      });
    }
    
    // Include organization settings in response
    res.json({
      ...restaurant.toObject(),
      organizationSettings: org.settings || {}
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update restaurant
router.post('/', async (req, res) => {
  try {
    const restaurantData = req.body;
    const { orgId } = restaurantData;
    
    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }
    
    const restaurant = await Restaurant.findOneAndUpdate(
      { orgId },
      { ...restaurantData, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error creating/updating restaurant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update restaurant
router.put('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const updateData = { ...req.body, lastUpdated: new Date() };
    
    const restaurant = await Restaurant.findOneAndUpdate(
      { orgId },
      updateData,
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update restaurant logo
router.patch('/:orgId/logo', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { logo } = req.body;
    
    const restaurant = await Restaurant.findOneAndUpdate(
      { orgId },
      { logo, lastUpdated: new Date() },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update restaurant location
router.patch('/:orgId/location', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { position, address } = req.body;
    
    const updateData = { lastUpdated: new Date() };
    if (position) updateData.position = position;
    if (address) updateData.address = address;
    
    const restaurant = await Restaurant.findOneAndUpdate(
      { orgId },
      updateData,
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get or update charges
router.get('/:orgId/charges', async (req, res) => {
  try {
    const { orgId } = req.params;
    const restaurant = await Restaurant.findOne({ orgId });
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant.charges || []);
  } catch (error) {
    console.error('Error fetching charges:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add charge
router.post('/:orgId/charges', async (req, res) => {
  try {
    const { orgId } = req.params;
    const chargeData = req.body;
    
    const restaurant = await Restaurant.findOneAndUpdate(
      { orgId },
      { $push: { charges: chargeData }, lastUpdated: new Date() },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant.charges);
  } catch (error) {
    console.error('Error adding charge:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update charge
router.put('/:orgId/charges/:chargeId', async (req, res) => {
  try {
    const { orgId, chargeId } = req.params;
    const updateData = req.body;
    
    const restaurant = await Restaurant.findOne({ orgId });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const charge = restaurant.charges.id(chargeId);
    if (!charge) {
      return res.status(404).json({ error: 'Charge not found' });
    }
    
    Object.assign(charge, updateData);
    charge.updatedAt = new Date();
    restaurant.lastUpdated = new Date();
    await restaurant.save();
    
    res.json(restaurant.charges);
  } catch (error) {
    console.error('Error updating charge:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete charge
router.delete('/:orgId/charges/:chargeId', async (req, res) => {
  try {
    const { orgId, chargeId } = req.params;
    
    const restaurant = await Restaurant.findOneAndUpdate(
      { orgId },
      { $pull: { charges: { _id: chargeId } }, lastUpdated: new Date() },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant.charges);
  } catch (error) {
    console.error('Error deleting charge:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle charge enabled status
router.patch('/:orgId/charges/:chargeId/toggle', async (req, res) => {
  try {
    const { orgId, chargeId } = req.params;
    
    const restaurant = await Restaurant.findOne({ orgId });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    const charge = restaurant.charges.id(chargeId);
    if (!charge) {
      return res.status(404).json({ error: 'Charge not found' });
    }
    
    charge.isEnabled = !charge.isEnabled;
    charge.updatedAt = new Date();
    restaurant.lastUpdated = new Date();
    await restaurant.save();
    
    res.json(restaurant.charges);
  } catch (error) {
    console.error('Error toggling charge:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

