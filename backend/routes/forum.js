// routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const threadController = require('../controllers/threadController');
const { protect } = require('../middleware/auth');
const { validateThread } = require('../middleware/threadValidation');

// Tạo thread mới - cần đăng nhập và validate dữ liệu
router.post('/threads', protect, validateThread, threadController.createThread);

// Lấy danh sách threads - không cần đăng nhập
router.get('/threads', threadController.getAllThreads);

// Export router
module.exports = router;
