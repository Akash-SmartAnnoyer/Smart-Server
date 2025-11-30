const mongoose = require('mongoose');

const selectionItemSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  customizations: [{
    name: { type: String },
    option: { type: String },
    price: { type: Number }
  }],
  subtotal: { type: Number, required: true }
}, { _id: false });

const pendingSelectionSchema = new mongoose.Schema({
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
  tableNumber: { type: String, required: true },
  customerId: { type: String, required: true, index: true },
  customerName: { type: String },
  items: [selectionItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  notes: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for faster queries
pendingSelectionSchema.index({ orgId: 1, status: 1 });
pendingSelectionSchema.index({ orgId: 1, createdAt: -1 });
pendingSelectionSchema.index({ customerId: 1 });
pendingSelectionSchema.index({ tableNumber: 1 });

module.exports = mongoose.model('PendingSelection', pendingSelectionSchema);

