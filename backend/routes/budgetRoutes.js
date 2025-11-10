const express = require('express');
const router = express.Router();
const { createBudget, getBudgets, deleteBudget, getBudgetVsActual, getSpendingInsights } = require('../controllers/budgetController.js');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBudget);
router.get('/', protect, getBudgets);
router.get('/status', protect, getBudgetVsActual);
router.get('/insights', protect, getSpendingInsights);
router.delete('/:id', protect, deleteBudget);

module.exports = router;
