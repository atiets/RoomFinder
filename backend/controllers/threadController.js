// controllers/threadController.js
const Thread = require('../models/Thread');
const Comment = require('../models/Comment');
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
 * Lấy tất cả threads với lọc và phân trang
 * @route GET /api/forum/threads
 * @access Public
 */


/**
 * Lấy tất cả threads với phân trang
 * @route GET /api/forum/threads
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

/**
 * Lấy chi tiết một thread
 * @route GET /api/forum/threads/:id
 * @access Public
 */
exports.getThreadById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm thread theo ID
    const thread = await Thread.findById(id)
      .populate('author', 'name avatar')
      .lean();
    
    // Nếu không tìm thấy thread
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thread'
      });
    }
    
    // Kiểm tra nếu thread chưa được duyệt và người dùng không phải author hoặc admin
    if (thread.status !== 'approved') {
      // Lấy user từ request (nếu đã đăng nhập)
      const userId = req.user ? req.user.id : null;
      const isAdmin = req.user ? req.user.role === 'admin' : false;
      
      if (!userId || (thread.author._id.toString() !== userId && !isAdmin)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem thread này'
        });
      }
    }
    
    // Tăng số lượt xem
    await Thread.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    thread.viewCount += 1;
    
    // Đếm số lượng comment
    const commentCount = await Comment.countDocuments({ thread: thread._id });
    thread.commentCount = commentCount;
    
    // Trả về thread
    res.json({
      success: true,
      data: thread
    });
  } catch (err) {
    console.error('Get thread error:', err);
    
    // Xử lý lỗi định dạng ID không hợp lệ
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'ID thread không hợp lệ'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết thread'
    });
  }
};