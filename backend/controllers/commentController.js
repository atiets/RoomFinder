// controllers/commentController.js
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Thread = require('../models/Thread');
const { validationResult } = require('express-validator');

/**
 * Tạo comment mới
 * @route POST /v1/forum/threads/:threadId/comments
 * @access Private
 */
exports.createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { threadId } = req.params;
    const { content, parentCommentId } = req.body;

    // Validate thread exists
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    if (thread.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Bài viết chưa được phê duyệt'
      });
    }

    // Validate parent comment if replying
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.thread.toString() !== threadId) {
        return res.status(400).json({
          success: false,
          message: 'Bình luận gốc không hợp lệ'
        });
      }
    }

    console.log('Creating comment:', {
      userId: req.user.id,
      username: req.user.username,
      threadId,
      content: content.substring(0, 50) + '...',
      parentCommentId
    });

    // Tạo comment mới
    const newComment = new Comment({
      content,
      thread: threadId,
      author: req.user.id,
      username: req.user.username,
      avatar: req.user.profile?.picture || null,
      parentComment: parentCommentId || null
    });

    const savedComment = await newComment.save();

    // Nếu là reply, thêm vào replies array của parent comment
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(
        parentCommentId,
        { $push: { replies: savedComment._id } }
      );
    }

    // Populate thông tin cần thiết
    const populatedComment = await Comment.findById(savedComment._id)
      .select('content username avatar likes created_at parentComment')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Bình luận đã được tạo thành công',
      data: {
        ...populatedComment,
        likesCount: populatedComment.likes.length,
        repliesCount: 0
      }
    });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo bình luận'
    });
  }
};

/**
 * Lấy comments của thread với phân trang
 * @route GET /v1/forum/threads/:threadId/comments
 * @access Public
 */
exports.getThreadComments = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate thread exists
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy comments gốc (không phải reply)
    const comments = await Comment.find({
      thread: threadId,
      parentComment: null,
      status: 'approved'
    })
    .select('content username avatar likes replies created_at')
    .sort({ created_at: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

    // Lấy replies cho mỗi comment
    const commentIds = comments.map(comment => comment._id);
    const replies = await Comment.find({
      parentComment: { $in: commentIds },
      status: 'approved'
    })
    .select('content username avatar likes created_at parentComment')
    .sort({ created_at: 1 })
    .lean();

    // Group replies by parent comment
    const repliesMap = replies.reduce((map, reply) => {
      const parentId = reply.parentComment.toString();
      if (!map[parentId]) map[parentId] = [];
      map[parentId].push({
        ...reply,
        likesCount: reply.likes.length
      });
      return map;
    }, {});

    // Format comments with replies
    const formattedComments = comments.map(comment => ({
      ...comment,
      likesCount: comment.likes.length,
      repliesCount: comment.replies.length,
      replies: repliesMap[comment._id.toString()] || []
    }));

    // Count total comments
    const totalComments = await Comment.countDocuments({
      thread: threadId,
      parentComment: null,
      status: 'approved'
    });

    res.json({
      success: true,
      data: {
        comments: formattedComments,
        pagination: {
          total: totalComments,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalComments / parseInt(limit))
        }
      }
    });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bình luận'
    });
  }
};

/**
 * Like comment
 * @route POST /v1/forum/comments/:commentId/like
 * @access Private
 */

// controllers/commentController.js
exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    console.log('🔍 Like comment request:', { commentId, userId });

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID bình luận không hợp lệ'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // SỬA: Clean duplicates trước khi check
    const userIdStr = userId.toString();
    const uniqueLikes = [...new Set(comment.likes.map(id => id.toString()))];
    const hasLiked = uniqueLikes.includes(userIdStr);

    console.log('📊 Before update:', { 
      hasLiked, 
      originalLikes: comment.likes.length,
      uniqueLikes: uniqueLikes.length,
      duplicatesFound: comment.likes.length - uniqueLikes.length
    });

    // SỬA: Dùng MongoDB operators thay vì array manipulation
    let updateQuery;
    
    if (hasLiked) {
      // Remove ALL instances of user ID (including duplicates)
      updateQuery = { $pull: { likes: userId } };
      console.log('👎 Removing like (including duplicates)');
    } else {
      // Add like only if not exists (prevent duplicates)
      updateQuery = { $addToSet: { likes: userId } }; // $addToSet prevents duplicates
      console.log('👍 Adding like');
    }

    // Use findByIdAndUpdate with atomic operation
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      updateQuery,
      { new: true }
    );

    const result = {
      liked: !hasLiked,
      likesCount: updatedComment.likes.length
    };

    console.log('✅ After update:', result);

    res.json({
      success: true,
      message: hasLiked ? 'Đã bỏ thích bình luận' : 'Đã thích bình luận',
      data: result
    });
  } catch (err) {
    console.error('❌ Like comment error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thích bình luận'
    });
  }
};

/**
 * Cập nhật/sửa comment
 * @route PUT /v1/forum/comments/:commentId
 * @access Private
 */
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    console.log('✏️ Update comment request:', { commentId, userId, username });

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được vượt quá 1000 ký tự'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID bình luận không hợp lệ'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Kiểm tra quyền sửa: chỉ cho phép chủ comment
    const canEdit = (
      comment.username === username || 
      comment.author.toString() === userId
    );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa bình luận này'
      });
    }

    // Kiểm tra thời gian: chỉ cho phép sửa trong 24h
    const createdAt = new Date(comment.created_at);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ có thể sửa bình luận trong vòng 24 giờ sau khi đăng'
      });
    }

    console.log('✅ User authorized to edit comment');

    // Cập nhật comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content: content.trim(),
        updated_at: new Date()
      },
      { new: true }
    ).select('content username avatar likes created_at updated_at parentComment');

    console.log('✅ Comment updated successfully');

    res.json({
      success: true,
      message: 'Đã cập nhật bình luận thành công',
      data: {
        ...updatedComment.toObject(),
        likesCount: updatedComment.likes.length,
        edited: true
      }
    });
  } catch (err) {
    console.error('❌ Update comment error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bình luận'
    });
  }
};

/**
 * Xóa comment
 * @route DELETE /v1/forum/comments/:commentId
 * @access Private
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const username = req.user.username;

    console.log('🗑️ Delete comment request:', { commentId, userId, username });

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID bình luận không hợp lệ'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Kiểm tra quyền xóa: chỉ cho phép chủ comment
    const canDelete = (
      comment.username === username || 
      comment.author.toString() === userId
    );

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này'
      });
    }

    console.log('✅ User authorized to delete comment');

    // Nếu là comment gốc, xóa tất cả replies
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: commentId });
      console.log('✅ Deleted all replies for parent comment');
    }

    // Xóa comment
    await Comment.findByIdAndDelete(commentId);
    
    // Cập nhật comment count của thread
    const threadId = comment.thread;
    await Thread.findByIdAndUpdate(threadId, {
      $inc: { commentsCount: -1 }
    });

    console.log('✅ Comment deleted successfully');

    res.json({
      success: true,
      message: 'Đã xóa bình luận thành công'
    });
  } catch (err) {
    console.error('❌ Delete comment error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bình luận'
    });
  }
};
