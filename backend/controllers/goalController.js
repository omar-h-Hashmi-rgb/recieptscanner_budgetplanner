const Goal = require('../models/Goal');

// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single goal
// @route   GET /api/goals/:id
// @access  Private
const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount = 0, targetDate, description } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({ message: 'Name and target amount are required' });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({ message: 'Target amount must be greater than 0' });
    }

    const goal = new Goal({
      user: req.user.id,
      name,
      targetAmount,
      currentAmount,
      targetDate: targetDate ? new Date(targetDate) : null,
      description
    });

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, description } = req.body;

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Update fields if provided
    if (name !== undefined) goal.name = name;
    if (targetAmount !== undefined) {
      if (targetAmount <= 0) {
        return res.status(400).json({ message: 'Target amount must be greater than 0' });
      }
      goal.targetAmount = targetAmount;
    }
    if (currentAmount !== undefined) {
      if (currentAmount < 0) {
        return res.status(400).json({ message: 'Current amount cannot be negative' });
      }
      goal.currentAmount = currentAmount;
    }
    if (targetDate !== undefined) {
      goal.targetDate = targetDate ? new Date(targetDate) : null;
    }
    if (description !== undefined) goal.description = description;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update goal progress (add/subtract amount)
// @route   PATCH /api/goals/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const newAmount = goal.currentAmount + Number(amount);
    
    if (newAmount < 0) {
      return res.status(400).json({ message: 'Progress cannot be negative' });
    }

    goal.currentAmount = newAmount;
    const updatedGoal = await goal.save();
    
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get goal statistics
// @route   GET /api/goals/stats
// @access  Private
const getGoalStats = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });
    
    const stats = {
      totalGoals: goals.length,
      completedGoals: goals.filter(goal => goal.isCompleted).length,
      activeGoals: goals.filter(goal => !goal.isCompleted).length,
      totalTargetAmount: goals.reduce((sum, goal) => sum + goal.targetAmount, 0),
      totalCurrentAmount: goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
      averageProgress: goals.length > 0 
        ? Math.round((goals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount * 100), 0) / goals.length) * 100) / 100
        : 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  updateProgress,
  getGoalStats
};