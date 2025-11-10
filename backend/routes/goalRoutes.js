const express = require('express');
const router = express.Router();
const { 
  getGoals, 
  getGoal, 
  createGoal, 
  updateGoal, 
  deleteGoal, 
  updateProgress,
  getGoalStats
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getGoals)
  .post(protect, createGoal);

router.get('/stats', protect, getGoalStats);

router.route('/:id')
  .get(protect, getGoal)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

router.patch('/:id/progress', protect, updateProgress);

module.exports = router;