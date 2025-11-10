const express = require('express');
const router = express.Router();
const { chatWithReceipt, budgetPlannerChat, generateBudgetSuggestions } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Chat with AI about receipt OCR text
// @route   POST /api/ai/chat-with-receipt
// @access  Private
router.post('/chat-with-receipt', protect, chatWithReceipt);

// @desc    Chat with AI budget planner for comprehensive financial advice
// @route   POST /api/ai/budget-planner-chat
// @access  Private
router.post('/budget-planner-chat', protect, budgetPlannerChat);

// @desc    Generate budget suggestions based on spending data
// @route   POST /api/ai/budget-suggestions
// @access  Private
router.post('/budget-suggestions', protect, generateBudgetSuggestions);

module.exports = router;