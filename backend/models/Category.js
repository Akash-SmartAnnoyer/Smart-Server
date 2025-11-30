const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
  image: { type: String }, // URL or base64
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  subcategories: [{
    id: { type: String },
    name: { type: String },
    description: { type: String },
    image: { type: String }, // URL or base64
    displayOrder: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries
categorySchema.index({ orgId: 1 });

module.exports = mongoose.model('Category', categorySchema);

