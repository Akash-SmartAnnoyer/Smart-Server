const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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

const orderSchema = new mongoose.Schema({
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
  customerId: { type: String, index: true }, // Add customerId for filtering
  items: [orderItemSchema],
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
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: { type: String },
  notes: { type: String },
  isWaiterMode: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for faster queries
orderSchema.index({ orgId: 1, status: 1 });
orderSchema.index({ orgId: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });

module.exports = mongoose.model('Order', orderSchema);

