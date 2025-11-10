const express = require('express');
const router = express.Router();
const { 
  getCategoryRules, 
  createCategoryRule, 
  updateCategoryRule, 
  deleteCategoryRule 
} = require('../controllers/categoryRuleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCategoryRules)
  .post(protect, createCategoryRule);

router.route('/:id')
  .put(protect, updateCategoryRule)
  .delete(protect, deleteCategoryRule);

module.exports = router;