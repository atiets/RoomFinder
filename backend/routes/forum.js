// routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const threadController = require('../controllers/threadController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateThread } = require('../middleware/threadValidation');
const middlewareControllers = require("../controllers/middlewareControllers");

// Tạo thread mới - cần đăng nhập và validate dữ liệu
router.post('/threads', middlewareControllers.verifyToken, validateThread, threadController.createThread);

// Route lấy danh sách threads
router.get('/threads', threadController.getAllThreads);

// Route lấy chi tiết thread - Public với xử lý quyền xem
router.get('/threads/:id', threadController.getThreadById);

// Export router
module.exports = router;
