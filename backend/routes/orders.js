const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const History = require('../models/History');
const Organization = require('../models/Organization');

// Get all orders for an org
router.get('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { status, customerName, customerId, tableNumber } = req.query;
    
    console.log('Orders API: Fetching orders for orgId:', orgId);
    console.log('Orders API: Query filters:', { status, customerName, customerId, tableNumber });
    
    const query = { orgId };
    if (status) query.status = status;
    if (customerName) query.customerName = customerName;
    if (customerId) query.customerId = customerId;
    if (tableNumber) query.tableNumber = tableNumber;
    
    // Exclude waiter mode orders from admin view (only show if customer is querying their own orders)
    // If customerId or customerName is provided, show all their orders (including waiter mode)
    // If no customerId/customerName (admin query), exclude waiter mode orders
    if (!customerId && !customerName) {
      query.isWaiterMode = { $ne: true }; // Exclude waiter mode orders for admin
    }
    
    console.log('Orders API: MongoDB query:', JSON.stringify(query));
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    console.log('Orders API: Found', orders.length, 'orders for orgId:', orgId);
    if (orders.length > 0) {
      console.log('Orders API: Sample order orgIds:', orders.slice(0, 3).map(o => o.orgId));
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order
router.get('/:orgId/order/:orderId', async (req, res) => {
  try {
    const { orgId, orderId } = req.params;
    const order = await Order.findOne({ orderId, orgId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order
router.post('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const orderData = { ...req.body, orgId };
    
    // Generate orderId if not provided
    if (!orderData.orderId) {
      orderData.orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Fetch organizationId if not provided
    if (!orderData.organizationId) {
      const organization = await Organization.findOne({ orgId });
      if (organization) {
        orderData.organizationId = organization._id;
      } else {
        return res.status(404).json({ error: 'Organization not found' });
      }
    }
    
    const order = new Order(orderData);
    await order.save();
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message, details: error.errors });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update order
router.put('/:orgId/order/:orderId', async (req, res) => {
  try {
    const { orgId, orderId } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const order = await Order.findOneAndUpdate(
      { orderId, orgId },
      updateData,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status
router.patch('/:orgId/order/:orderId/status', async (req, res) => {
  try {
    const { orgId, orderId } = req.params;
    const { status } = req.body;
    
    const order = await Order.findOneAndUpdate(
      { orderId, orgId },
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // If order is completed, move to history (but skip waiter mode orders)
    if (status === 'completed' && !order.isWaiterMode) {
      const historyData = order.toObject();
      delete historyData._id;
      delete historyData.__v;
      historyData.completedAt = new Date();
      
      await History.findOneAndUpdate(
        { orderId },
        historyData,
        { upsert: true, new: true }
      );
      
      // Delete from orders collection
      await Order.findOneAndDelete({ orderId, orgId });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete order
router.delete('/:orgId/order/:orderId', async (req, res) => {
  try {
    const { orgId, orderId } = req.params;
    
    const order = await Order.findOneAndDelete({ orderId, orgId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

