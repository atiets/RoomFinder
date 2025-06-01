// controllers/threadController.js
const Thread = require('../models/Thread');
const Comment = require('../models/Comment');
const User = require('../models/User'); 
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

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
    
    // Thực hiện query để lấy threads với author field
    let threads = await Thread.find(query)
      .select('title content username avatar tags likes dislikes viewCount created_at status author')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Đếm tổng số threads thỏa mãn điều kiện
    const total = await Thread.countDocuments(query);
    
    // Lấy threadIds để đếm comments
    const threadIds = threads.map(thread => thread._id);
    
    // Đếm số comments cho tất cả threads
    const commentCounts = await Comment.aggregate([
      { $match: { thread: { $in: threadIds } } },
      { $group: { _id: '$thread', count: { $sum: 1 } } }
    ]);
    
    // Tạo map từ kết quả aggregate
    const commentCountMap = commentCounts.reduce((map, item) => {
      map[item._id.toString()] = item.count;
      return map;
    }, {});
    
    // Format threads với like/dislike counts và author info
    threads = threads.map(thread => ({
      _id: thread._id,
      title: thread.title,
      content: thread.content,
      username: thread.username,
      avatar: thread.avatar,
      tags: thread.tags,
      likesCount: thread.likes.length,
      dislikesCount: thread.dislikes.length,
      commentCount: commentCountMap[thread._id.toString()] || 0,
      viewCount: thread.viewCount,
      created_at: thread.created_at,
      status: thread.status,
      author: thread.author // Include author ID for ownership checking
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
 * Cập nhật thread
 * @route PUT /v1/forum/threads/:id
 * @access Private
 */
exports.updateThread = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    console.log('✏️ Update thread request:', { id, userId, username });

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề không được để trống'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung không được để trống'
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề không được vượt quá 200 ký tự'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID bài viết không hợp lệ'
      });
    }

    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Kiểm tra quyền sửa: chỉ cho phép chủ thread
    const canEdit = (
      thread.username === username || 
      thread.author.toString() === userId
    );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa bài viết này'
      });
    }

    // Kiểm tra thời gian: chỉ cho phép sửa trong 24h
    const createdAt = new Date(thread.created_at);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ có thể sửa bài viết trong vòng 24 giờ sau khi đăng'
      });
    }

    console.log('✅ User authorized to edit thread');

    // Cập nhật thread
    const updatedThread = await Thread.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        content: content.trim(),
        tags: tags || thread.tags,
        updated_at: new Date()
      },
      { new: true }
    ).select('title content username avatar tags likes dislikes viewCount created_at updated_at author');

    console.log('✅ Thread updated successfully');

    res.json({
      success: true,
      message: 'Đã cập nhật bài viết thành công',
      data: {
        ...updatedThread.toObject(),
        likesCount: updatedThread.likes.length,
        dislikesCount: updatedThread.dislikes.length,
        edited: true
      }
    });
  } catch (err) {
    console.error('❌ Update thread error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bài viết'
    });
  }
};

/**
 * Xóa thread
 * @route DELETE /v1/forum/threads/:id
 * @access Private
 */
exports.deleteThread = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const username = req.user.username;

    console.log('🗑️ Delete thread request:', { id, userId, username });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID bài viết không hợp lệ'
      });
    }

    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Kiểm tra quyền xóa: chỉ cho phép chủ thread
    const canDelete = (
      thread.username === username || 
      thread.author.toString() === userId
    );

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài viết này'
      });
    }

    console.log('✅ User authorized to delete thread');

    // Xóa tất cả comments của thread trước
    await Comment.deleteMany({ thread: id });
    console.log('✅ Deleted all comments for thread');

    // Xóa thread
    await Thread.findByIdAndDelete(id);
    console.log('✅ Thread deleted successfully');

    res.json({
      success: true,
      message: 'Đã xóa bài viết thành công'
    });
  } catch (err) {
    console.error('❌ Delete thread error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bài viết'
    });
  }
};

/**
 * Like một thread
 * @route POST /v1/forum/threads/:id/like
 * @access Private
 */
exports.likeThread = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Tìm thread
    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Check thread status
    if (thread.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Bài viết chưa được phê duyệt'
      });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    // Kiểm tra user đã like chưa
    const hasLiked = thread.likes.includes(userIdObj);
    const hasDisliked = thread.dislikes.includes(userIdObj);

    if (hasLiked) {
      // Nếu đã like thì remove like (toggle off)
      thread.likes.pull(userIdObj);
    } else {
      // Nếu chưa like
      if (hasDisliked) {
        // Remove dislike nếu có
        thread.dislikes.pull(userIdObj);
      }
      // Add like
      thread.likes.push(userIdObj);
    }

    await thread.save();

    res.json({
      success: true,
      message: hasLiked ? 'Đã bỏ thích' : 'Đã thích bài viết',
      data: {
        liked: !hasLiked,
        disliked: false,
        likesCount: thread.likes.length,
        dislikesCount: thread.dislikes.length
      }
    });
  } catch (err) {
    console.error('Like thread error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID bài viết không hợp lệ'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thích bài viết'
    });
  }
};

/**
 * Dislike một thread
 * @route POST /v1/forum/threads/:id/dislike
 * @access Private
 */
exports.dislikeThread = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Tìm thread
    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Check thread status
    if (thread.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Bài viết chưa được phê duyệt'
      });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    // Kiểm tra user đã dislike chưa
    const hasLiked = thread.likes.includes(userIdObj);
    const hasDisliked = thread.dislikes.includes(userIdObj);

    if (hasDisliked) {
      // Nếu đã dislike thì remove dislike (toggle off)
      thread.dislikes.pull(userIdObj);
    } else {
      // Nếu chưa dislike
      if (hasLiked) {
        // Remove like nếu có
        thread.likes.pull(userIdObj);
      }
      // Add dislike
      thread.dislikes.push(userIdObj);
    }

    await thread.save();

    res.json({
      success: true,
      message: hasDisliked ? 'Đã bỏ không thích' : 'Đã không thích bài viết',
      data: {
        liked: false,
        disliked: !hasDisliked,
        likesCount: thread.likes.length,
        dislikesCount: thread.dislikes.length
      }
    });
  } catch (err) {
    console.error('Dislike thread error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID bài viết không hợp lệ'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi không thích bài viết'
    });
  }
};

/**
 * Lấy trạng thái like/dislike của user cho một thread
 * @route GET /v1/forum/threads/:id/like-status
 * @access Private
 */
exports.getThreadLikeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Tìm thread
    const thread = await Thread.findById(id).select('likes dislikes');
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const hasLiked = thread.likes.includes(userIdObj);
    const hasDisliked = thread.dislikes.includes(userIdObj);

    res.json({
      success: true,
      data: {
        liked: hasLiked,
        disliked: hasDisliked,
        likesCount: thread.likes.length,
        dislikesCount: thread.dislikes.length
      }
    });
  } catch (err) {
    console.error('Get like status error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID bài viết không hợp lệ'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy trạng thái thích'
    });
  }
};

/**
 * Lấy thread theo ID với like/dislike counts
 * @route GET /v1/forum/threads/:id
 * @access Public
 */
exports.getThreadById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm thread và tăng view count
    const thread = await Thread.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
    .select('title content username avatar tags likes dislikes viewCount created_at status')
    .lean();
    
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }
    
    // Check if thread is approved
    if (thread.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Bài viết chưa được phê duyệt'
      });
    }
    
    // Count comments
    const commentCount = await Comment.countDocuments({ thread: id });
    
    // Format response
    const formattedThread = {
      _id: thread._id,
      title: thread.title,
      content: thread.content,
      username: thread.username,
      avatar: thread.avatar,
      tags: thread.tags,
      likesCount: thread.likes.length,
      dislikesCount: thread.dislikes.length,
      commentCount,
      viewCount: thread.viewCount,
      created_at: thread.created_at,
      status: thread.status
    };
    
    res.json({
      success: true,
      data: formattedThread
    });
  } catch (err) {
    console.error('Get thread by ID error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID bài viết không hợp lệ'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bài viết'
    });
  }
};