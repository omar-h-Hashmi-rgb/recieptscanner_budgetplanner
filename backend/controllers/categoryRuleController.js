const CategoryRule = require('../models/CategoryRule');

// @desc    Get all category rules for a user
// @route   GET /api/category-rules
// @access  Private
const getCategoryRules = async (req, res) => {
  try {
    const rules = await CategoryRule.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new category rule
// @route   POST /api/category-rules
// @access  Private
const createCategoryRule = async (req, res) => {
  try {
    const { keyword, category } = req.body;

    if (!keyword || !category) {
      return res.status(400).json({ message: 'Keyword and category are required' });
    }

    // Check if rule already exists for this user and keyword
    const existingRule = await CategoryRule.findOne({ 
      user: req.user.id, 
      keyword: keyword.toLowerCase() 
    });

    if (existingRule) {
      return res.status(400).json({ message: 'Rule with this keyword already exists' });
    }

    const rule = new CategoryRule({
      user: req.user.id,
      keyword: keyword.toLowerCase(),
      category
    });

    const savedRule = await rule.save();
    res.status(201).json(savedRule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category rule
// @route   PUT /api/category-rules/:id
// @access  Private
const updateCategoryRule = async (req, res) => {
  try {
    const { keyword, category } = req.body;

    const rule = await CategoryRule.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    rule.keyword = keyword.toLowerCase();
    rule.category = category;

    const updatedRule = await rule.save();
    res.json(updatedRule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category rule
// @route   DELETE /api/category-rules/:id
// @access  Private
const deleteCategoryRule = async (req, res) => {
  try {
    const rule = await CategoryRule.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    await CategoryRule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategoryRules,
  createCategoryRule,
  updateCategoryRule,
  deleteCategoryRule
};