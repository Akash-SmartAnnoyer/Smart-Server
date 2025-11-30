const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  orgId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  settings: {
    allowCustomerRegistration: {
      type: Boolean,
      default: true
    },
    requireTableNumber: {
      type: Boolean,
      default: true
    },
    allowDirectOrdering: {
      type: Boolean,
      default: true  // Default to true (current behavior - customers can place orders directly)
    },
    // Price and charge display settings
    showPricesInOrderReview: {
      type: Boolean,
      default: true  // Show prices in confirm order page (review order)
    },
    showChargesIndividually: {
      type: Boolean,
      default: true  // If prices shown, show charges individually or in brackets (true = individually, false = in brackets)
    },
    showTaxesSeparately: {
      type: Boolean,
      default: true  // Show taxes separately or as "incl. charges" in summary and bill (true = separately, false = incl. charges)
    }
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

// Generate slug from name
organizationSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes
organizationSchema.index({ orgId: 1 });
organizationSchema.index({ slug: 1 });
organizationSchema.index({ email: 1 });

module.exports = mongoose.model('Organization', organizationSchema);

