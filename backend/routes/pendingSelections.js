const express = require('express');
const PendingSelection = require('../models/PendingSelection');
const Organization = require('../models/Organization');
const Order = require('../models/Order');
const { authenticate, requireStaff } = require('../middleware/auth');
const router = express.Router();

// Create a pending selection (customer submits cart for waiter confirmation)
router.post('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { items, tableNumber, customerId, customerName, subtotal, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (!tableNumber || !customerId) {
      return res.status(400).json({ error: 'Table number and customer ID are required' });
    }

    // Get organization to verify orgId
    const organization = await Organization.findOne({ orgId });
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if organization allows direct ordering
    if (organization.settings?.allowDirectOrdering) {
      return res.status(400).json({ 
        error: 'This organization allows direct ordering. Use the order endpoint instead.' 
      });
    }

    const pendingSelection = new PendingSelection({
      organizationId: organization._id,
      orgId,
      tableNumber,
      customerId,
      customerName: customerName || customerId,
      items,
      subtotal: subtotal || items.reduce((sum, item) => sum + item.subtotal, 0),
      notes: notes || '',
      status: 'pending'
    });

    await pendingSelection.save();

    res.status(201).json(pendingSelection);
  } catch (error) {
    console.error('Error creating pending selection:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all pending selections for an organization (for waiters/captains)
router.get('/:orgId', authenticate, requireStaff, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { status, tableNumber } = req.query;

    const query = { orgId };
    if (status) {
      query.status = status;
    } else {
      // Default to pending if no status specified
      query.status = 'pending';
    }
    if (tableNumber) {
      query.tableNumber = tableNumber;
    }

    const selections = await PendingSelection.find(query)
      .sort({ createdAt: -1 })
      .populate('confirmedBy', 'name username')
      .select('-__v');

    res.json(selections);
  } catch (error) {
    console.error('Error fetching pending selections:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending selections for a specific customer
router.get('/:orgId/customer/:customerId', async (req, res) => {
  try {
    const { orgId, customerId } = req.params;

    const selections = await PendingSelection.find({
      orgId,
      customerId,
      status: { $in: ['pending', 'confirmed'] }
    })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(selections);
  } catch (error) {
    console.error('Error fetching customer selections:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Confirm a pending selection (waiter/captain confirms - NO order created in DB for waiter mode)
router.post('/:orgId/:selectionId/confirm', authenticate, requireStaff, async (req, res) => {
  try {
    const { orgId, selectionId } = req.params;
    const { notes } = req.body;

    const selection = await PendingSelection.findOne({
      _id: selectionId,
      orgId
    });

    if (!selection) {
      return res.status(404).json({ error: 'Pending selection not found' });
    }

    if (selection.status !== 'pending') {
      return res.status(400).json({ error: 'Selection is not pending' });
    }

    // Update selection status to confirmed (NO order created in DB for waiter mode)
    selection.status = 'confirmed';
    selection.confirmedBy = req.user._id;
    selection.confirmedAt = new Date();
    if (notes) {
      selection.notes = (selection.notes || '') + ` [Waiter Notes: ${notes}]`;
    }
    await selection.save();

    res.json({
      message: 'Selection confirmed successfully',
      selection
    });
  } catch (error) {
    console.error('Error confirming selection:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject a pending selection
router.post('/:orgId/:selectionId/reject', authenticate, requireStaff, async (req, res) => {
  try {
    const { orgId, selectionId } = req.params;
    const { reason } = req.body;

    const selection = await PendingSelection.findOne({
      _id: selectionId,
      orgId
    });

    if (!selection) {
      return res.status(404).json({ error: 'Pending selection not found' });
    }

    if (selection.status !== 'pending') {
      return res.status(400).json({ error: 'Selection is not pending' });
    }

    selection.status = 'rejected';
    if (reason) {
      selection.notes = (selection.notes || '') + ` [Rejected: ${reason}]`;
    }
    await selection.save();

    res.json(selection);
  } catch (error) {
    console.error('Error rejecting selection:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete/cancel a pending selection (by customer)
router.delete('/:orgId/:selectionId', async (req, res) => {
  try {
    const { orgId, selectionId } = req.params;
    const { customerId } = req.body;

    const selection = await PendingSelection.findOne({
      _id: selectionId,
      orgId
    });

    if (!selection) {
      return res.status(404).json({ error: 'Pending selection not found' });
    }

    // Only allow customer to cancel their own pending selections
    if (selection.customerId !== customerId) {
      return res.status(403).json({ error: 'Not authorized to cancel this selection' });
    }

    if (selection.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending selections can be cancelled' });
    }

    selection.status = 'cancelled';
    await selection.save();

    res.json({ message: 'Selection cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling selection:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

