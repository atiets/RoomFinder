const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Tạo đơn thanh toán
router.post('/create', protect, paymentController.createPayment);

// Lấy lịch sử thanh toán
router.get('/history', protect, paymentController.getPaymentHistory);

// Webhook từ MoMo (không cần auth)
router.post('/webhook/momo', paymentController.handleMoMoCallback);

module.exports = router;
