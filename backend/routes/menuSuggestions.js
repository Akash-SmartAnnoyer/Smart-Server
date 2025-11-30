const express = require('express');
const router = express.Router();
const MenuSuggestion = require('../models/MenuSuggestion');

// Get menu suggestions for an org
router.get('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const suggestion = await MenuSuggestion.findOne({ orgId });
    
    if (!suggestion) {
      return res.json({ suggestions: [] });
    }
    
    res.json(suggestion);
  } catch (error) {
    console.error('Error fetching menu suggestions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update menu suggestions
router.put('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { suggestions } = req.body;
    
    const suggestion = await MenuSuggestion.findOneAndUpdate(
      { orgId },
      { suggestions, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.json(suggestion);
  } catch (error) {
    console.error('Error updating menu suggestions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

