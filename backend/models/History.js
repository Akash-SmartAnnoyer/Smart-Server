const mongoose = require('mongoose');

const historyItemSchema = new mongoose.Schema({
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

const historySchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
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
  tableNumber: { type: String },
  customerName: { type: String },
  items: [historyItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  charges: [{
    name: { type: String },
    type: { type: String },
    value: { type: Number },
    amount: { type: Number }
  }],
  total: { type: Number, required: true, default: 0 },
  status: { 
    type: String, 
    enum: ['completed', 'cancelled'],
    default: 'completed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'paid'
  },
  paymentMethod: { type: String },
  notes: { type: String },
  isWaiterMode: {
    type: Boolean,
    default: false,
    index: true
  },
  completedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for faster queries
historySchema.index({ orgId: 1, createdAt: -1 });
historySchema.index({ orderId: 1 });

module.exports = mongoose.model('History', historySchema);

