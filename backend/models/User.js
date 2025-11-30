const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Username must be unique across all organizations
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['super_admin', 'org_admin', 'captain', 'admin', 'customer'],
    required: true,
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true,
    // Required for all roles except super_admin
    required: function() {
      return this.role !== 'super_admin';
    }
  },
  orgId: {
    type: String,
    index: true,
    // Required for all roles except super_admin
    required: function() {
      return this.role !== 'super_admin';
    }
  },
  // For customer role
  tableNumber: {
    type: String,
    sparse: true,
    index: true
  },
  customerId: {
    type: String,
    sparse: true,
    index: true
  },
  // Profile information
  name: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ username: 1, role: 1 });
userSchema.index({ orgId: 1, role: 1 });
userSchema.index({ organizationId: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);

