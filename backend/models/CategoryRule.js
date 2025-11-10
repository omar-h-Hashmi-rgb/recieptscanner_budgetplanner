const mongoose = require('mongoose');

const CategoryRuleSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  keyword: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
CategoryRuleSchema.index({ user: 1, keyword: 1 });

module.exports = mongoose.model('CategoryRule', CategoryRuleSchema);