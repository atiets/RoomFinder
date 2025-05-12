const express = require("express");
const router = express.Router();
const { reportPost } = require("../controllers/reportController");
const middlewareControllers = require("../controllers/middlewareControllers");

// Route nhận báo cáo bài viết
router.post("/", middlewareControllers.verifyToken, reportPost);

module.exports = router;
