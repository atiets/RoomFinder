// routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const threadController = require('../controllers/threadController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateThread } = require('../middleware/threadValidation');
const middlewareControllers = require("../controllers/middlewareControllers");

// Tạo thread mới
router.post('/threads', middlewareControllers.verifyToken, validateThread, threadController.createThread);

// Route lấy danh sách threads
router.get('/threads', threadController.getAllThreads);

// Export router
module.exports = router;
