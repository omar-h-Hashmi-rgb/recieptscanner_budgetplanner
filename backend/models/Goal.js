const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  targetAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  currentAmount: { 
    type: Number, 
    required: true, 
    default: 0,
    min: 0
  },
  targetDate: { 
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
GoalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-mark as completed if current amount >= target amount
  if (this.currentAmount >= this.targetAmount) {
    this.isCompleted = true;
  }
  
  next();
});

// Index for efficient queries
GoalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Goal', GoalSchema);