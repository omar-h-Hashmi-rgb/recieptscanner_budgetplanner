const express = require('express');
const router = express.Router();

const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  getTransactionSummary,
  getChartData,
  getExpenseCategories,
  getIncomeCategories,
  getAllCategories,
  deleteCategory, 
  exportTransactions,
  getAllTags
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');
// Route for getting all and adding a new transaction
router.route('/')
  .get(protect, getTransactions)
  .post(protect, addTransaction);

router.route('/summary').get(protect, getTransactionSummary);
router.route('/charts').get(protect, getChartData);
router.route('/categories').get(protect, getAllCategories);
router.route('/categories/expense').get(protect, getExpenseCategories);
router.route('/categories/income').get(protect,getIncomeCategories);
router.route('/category').delete(protect, deleteCategory); 
router.route('/export').get(protect, exportTransactions);
router.route('/bulk').delete(protect, bulkDeleteTransactions);
router.route('/tags').get(protect, getAllTags);


// Route for updating and deleting a specific transaction
router.route('/:id')
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

module.exports = router;