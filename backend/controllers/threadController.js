// controllers/threadController.js
const Thread = require('../models/thread');
const User = require('../models/User'); // Giả sử bạn đã có model User
const { validationResult } = require('express-validator');

/**
 * Tạo thread mới
 * @route POST /api/forum/threads
 * @access Private
 */
exports.createThread = async (req, res) => {
  try {
    // Kiểm tra lỗi validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, tags } = req.body;
    
    // Tạo thread mới
    const newThread = new Thread({
      title,
      content,
      tags: tags || [],
      author: req.user.id,
      status: 'pending' // Hoặc 'approved' nếu không cần duyệt
    });
    
    const savedThread = await newThread.save();
    
    // Populate author để trả về thông tin người tạo
    const populatedThread = await Thread.findById(savedThread._id)
      .populate('author', 'name avatar');
    
    res.status(201).json({
      success: true,
      data: populatedThread
    });
  } catch (err) {
    console.error('Create thread error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

/**
 * Lấy tất cả threads
 * @route GET /api/forum/threads
 * @access Public
 */
exports.getAllThreads = async (req, res) => {
  try {
    const { sort = 'newest', limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    // Tùy chọn sắp xếp
    let sortOption = {};
    if (sort === 'newest') sortOption = { created_at: -1 };
    else if (sort === 'oldest') sortOption = { created_at: 1 };
    else if (sort === 'popular') sortOption = { viewCount: -1 };
    
    // Chỉ lấy những thread được approve
    const threads = await Thread.find({ status: 'approved' })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name avatar');
    
    // Đếm tổng số threads
    const total = await Thread.countDocuments({ status: 'approved' });
    
    res.json({
      success: true,
      data: threads,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get threads error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Các controller khác như getThreadById, updateThread, deleteThread, etc.