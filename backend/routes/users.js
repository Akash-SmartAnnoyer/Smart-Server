const express = require('express');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');
const router = express.Router();

// All routes require super admin authentication
router.use(authenticate);
router.use(requireSuperAdmin);

// Reset user password
router.post('/:userId/reset-password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(userId).select('+password');
    
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

module.exports = router;

