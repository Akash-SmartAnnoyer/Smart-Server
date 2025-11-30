const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get all menu items for an org
router.get('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { categoryId, subcategoryId } = req.query;
    
    const query = { orgId };
    if (categoryId) {
      query.categoryId = String(categoryId);
    }
    if (subcategoryId) {
      query.subcategoryId = String(subcategoryId);
    }
    
    console.log('Fetching menu items with query:', {
      orgId,
      categoryId: query.categoryId,
      subcategoryId: query.subcategoryId
    });
    
    const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });
    
    console.log(`Found ${menuItems.length} menu items`, {
      categoryId: query.categoryId,
      subcategoryId: query.subcategoryId,
      itemsWithSubcategoryId: menuItems.filter(item => item.subcategoryId).length,
      sampleItems: menuItems.slice(0, 3).map(item => ({
        name: item.name,
        categoryId: item.categoryId,
        subcategoryId: item.subcategoryId
      }))
    });
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single menu item
router.get('/:orgId/item/:itemId', async (req, res) => {
  try {
    const { orgId, itemId } = req.params;
    const menuItem = await MenuItem.findOne({ _id: itemId, orgId });
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create menu item
router.post('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const menuItemData = { ...req.body, orgId };
    
    // Ensure organizationId is set if not provided
    if (!menuItemData.organizationId) {
      // Try to get it from the restaurant or set a default
      const Restaurant = require('../models/Restaurant');
      const restaurant = await Restaurant.findOne({ orgId });
      if (restaurant && restaurant.organizationId) {
        menuItemData.organizationId = restaurant.organizationId;
      } else {
        // If still not found, try to get from Organization
        const Organization = require('../models/Organization');
        const org = await Organization.findOne({ orgId });
        if (org && org._id) {
          menuItemData.organizationId = org._id;
        } else {
          return res.status(400).json({ error: 'Organization ID is required' });
        }
      }
    }
    
    // Ensure subcategoryId is a string if provided
    if (menuItemData.subcategoryId) {
      menuItemData.subcategoryId = String(menuItemData.subcategoryId);
    }
    
    // Ensure categoryId is a string if provided
    if (menuItemData.categoryId) {
      menuItemData.categoryId = String(menuItemData.categoryId);
    }
    
    console.log('Creating menu item:', {
      name: menuItemData.name,
      categoryId: menuItemData.categoryId,
      subcategoryId: menuItemData.subcategoryId,
      orgId: menuItemData.orgId
    });
    
    const menuItem = new MenuItem(menuItemData);
    await menuItem.save();
    
    console.log('Menu item created successfully:', {
      _id: menuItem._id,
      name: menuItem.name,
      categoryId: menuItem.categoryId,
      subcategoryId: menuItem.subcategoryId
    });
    
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    console.error('Error details:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message, details: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update menu item
router.put('/:orgId/item/:itemId', async (req, res) => {
  try {
    const { orgId, itemId } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: itemId, orgId },
      updateData,
      { new: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete menu item
router.delete('/:orgId/item/:itemId', async (req, res) => {
  try {
    const { orgId, itemId } = req.params;
    
    const menuItem = await MenuItem.findOneAndDelete({ _id: itemId, orgId });
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk operations
router.post('/:orgId/bulk', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { items } = req.body; // Array of menu items
    
    const menuItems = await MenuItem.insertMany(
      items.map(item => ({ ...item, orgId }))
    );
    
    res.status(201).json(menuItems);
  } catch (error) {
    console.error('Error bulk creating menu items:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

