const express = require('express');
const router = express.Router();
const History = require('../models/History');

// Get all order history for an org
router.get('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { startDate, endDate, limit } = req.query;
    
    const query = { orgId };
    
    // Exclude waiter mode orders from history (admin view)
    query.isWaiterMode = { $ne: true };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    let historyQuery = History.find(query).sort({ createdAt: -1 });
    
    if (limit) {
      historyQuery = historyQuery.limit(parseInt(limit));
    }
    
    const history = await historyQuery;
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single history entry
router.get('/:orgId/order/:orderId', async (req, res) => {
  try {
    const { orgId, orderId } = req.params;
    const history = await History.findOne({ orderId, orgId });
    
    if (!history) {
      return res.status(404).json({ error: 'History not found' });
    }
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete history entry
router.delete('/:orgId/order/:orderId', async (req, res) => {
  try {
    const { orgId, orderId } = req.params;
    
    const history = await History.findOneAndDelete({ orderId, orgId });
    
    if (!history) {
      return res.status(404).json({ error: 'History not found' });
    }
    
    res.json({ message: 'History deleted successfully' });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

