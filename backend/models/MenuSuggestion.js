const mongoose = require('mongoose');

const menuSuggestionSchema = new mongoose.Schema({
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
  suggestions: [{
    type: String
  }],
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

menuSuggestionSchema.index({ orgId: 1 });

module.exports = mongoose.model('MenuSuggestion', menuSuggestionSchema);

