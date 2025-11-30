const mongoose = require('mongoose');

const chargeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  isEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const restaurantSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  orgId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  position: {
    type: [Number], // [latitude, longitude]
    default: [0, 0]
  },
  logo: { type: String }, // Base64 or URL
  charges: [chargeSchema],
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries
restaurantSchema.index({ orgId: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);

