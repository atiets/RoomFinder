// controllers/threadController.js
const Thread = require('../models/Thread');
const Comment = require('../models/Comment');
const User = require('../models/User'); 
const { validationResult } = require('express-validator');

/**
 * Tạo thread mới
 * @route POST /v1/forum/threads
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
    
    // Kiểm tra thông tin user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin người dùng không hợp lệ'
      });
    }
    
    // Kiểm tra username
    if (!req.user.username) {
      return res.status(400).json({
        success: false,
        message: 'Username không tồn tại. Vui lòng cập nhật thông tin tài khoản.'
      });
    }
    
    // Tạo thread mới với username và avatar
    const newThread = new Thread({
      title,
      content,
      tags: tags || [],
      author: req.user.id,
      username: req.user.username, // Lưu trực tiếp username
      avatar: req.user.profile?.picture || null, // Lưu trực tiếp avatar URL
      status: 'pending' // Hoặc 'approved' nếu không cần duyệt
    });
    
    const savedThread = await newThread.save();
    
    // Trả về thread đã được lưu
    res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công! Đang chờ phê duyệt.',
      data: {
        id: savedThread._id,
        title: savedThread.title,
        content: savedThread.content,
        username: savedThread.username,
        avatar: savedThread.avatar,
        tags: savedThread.tags,
        status: savedThread.status,
        created_at: savedThread.created_at
      }
    });
  } catch (err) {
    console.error('Create thread error:', err.message);
    
    // Handle các lỗi cụ thể
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo bài viết'
    });
  }
};

/**
 * Lấy tất cả threads với lọc và phân trang
 * @route GET /v1/forum/threads
 * @access Public
 */


/**
 * Lấy tất cả threads với phân trang
 * @route GET /v1/forum/threads
 * @access Public
 */
exports.getAllThreads = async (req, res) => {
  try {
    // Lấy các tham số từ query string
    const { page = 1, limit = 10 } = req.query;
    
    // Tạo query object
    const query = { status: 'approved' };
    
    // Tính toán skip cho phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Thực hiện query để lấy threads
    let threads = await Thread.find(query)
      .populate('author', 'name avatar')
      .sort({ created_at: -1 }) // Mặc định sắp xếp theo thời gian tạo giảm dần
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Đếm tổng số threads thỏa mãn điều kiện
    const total = await Thread.countDocuments(query);
    
    // Lấy threadIds để đếm comments
    const threadIds = threads.map(thread => thread._id);
    
    // Đếm số comments cho tất cả threads trong một lần gọi (Tối ưu bằng aggregation)
    const commentCounts = await Comment.aggregate([
      { $match: { thread: { $in: threadIds } } },
      { $group: { _id: '$thread', count: { $sum: 1 } } }
    ]);
    
    // Tạo map từ kết quả aggregate
    const commentCountMap = commentCounts.reduce((map, item) => {
      map[item._id.toString()] = item.count;
      return map;
    }, {});
    
    // Thêm commentCount vào mỗi thread
    threads = threads.map(thread => ({
      ...thread,
      commentCount: commentCountMap[thread._id.toString()] || 0
    }));
    
    // Trả về kết quả với thông tin phân trang
    res.json({
      success: true,
      data: threads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get threads error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách threads'
    });
  }
};