const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  orgId: { 
    type: String, 
    required: true,
    index: true 
  },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String }, // URL or base64
  categoryId: { type: String, required: true },
  subcategoryId: { type: String },
  isAvailable: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: false },
  tags: [String],
  customizations: [{
    name: { type: String },
    options: [{
      name: { type: String },
      price: { type: Number, default: 0 }
    }]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for faster queries
menuItemSchema.index({ orgId: 1, categoryId: 1 });
menuItemSchema.index({ orgId: 1, subcategoryId: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);

