const express = require('express');
const router = express.Router();
const { uploadReceipt, scanReceipt } = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload, uploadReceipt);
router.post('/scan', protect, upload, scanReceipt);

module.exports = router;