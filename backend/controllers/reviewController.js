const Review = require('../models/Review');
const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const userController = require('./userControllers');

// Tạo đánh giá mới
exports.createReview = async (req, res) => {
    const { rating, comments, review_checks, media } = req.body;
    const { postId } = req.params;
    try {
        // Tìm bài đăng
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài đăng không tồn tại' });
        }

        // Lấy user ID
        const userId = req.user.id;

        // Kiểm tra hành vi spam review
        let isSpam = false;

        // 1. 5 review trong vòng 1 giờ
        const reviewsInOneHour = await Review.find({
            user_id: userId,
            createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
        });
        if (reviewsInOneHour.length >= 5) {
            isSpam = true;
        }

        // 2. 2 review liên tiếp trong vòng 10 phút
        const lastTwo = await Review.find({ user_id: userId }).sort({ createdAt: -1 }).limit(2);
        if (lastTwo.length === 2) {
            const timeDiff = (lastTwo[0].createdAt - lastTwo[1].createdAt) / (1000 * 60); // phút
            if (timeDiff <= 10) {
                isSpam = true;
            }
        }

        if (isSpam) {
            await userController.detectSuspiciousActivity(userId, "Spam review");
        }

        const imageUrls = Array.isArray(media?.images) ? media.images.slice(0, 5) : [];
        const videoUrl = media?.video ? [media.video] : [];

        // Tạo review mới
        const review = new Review({
            post_id: postId,
            user_id: userId,
            rating,
            comments,
            review_checks,
            media: {
                images: imageUrls,
                videos: videoUrl
            }
        });

        await review.save();

        // Gửi thông báo cho chủ bài viết
        const owner = await User.findById(post.contactInfo.user);
        if (owner) {
            const notification = {
                message: `Bài viết "${post.title}" của bạn nhận được một đánh giá mới.`,
                type: 'review',
                post_id: postId,
                review_id: review._id,
                status: 'unread',
            };

            owner.notifications.push(notification);
            await owner.save();
        }

        res.status(201).json({ review });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};


// Lấy đánh giá theo bài đăng
exports.getReviewsByPost = async (req, res) => {
    const { postId } = req.params;

    try {   
        const reviews = await Review.find({ post_id: postId }).populate('user_id', 'username');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Xóa đánh giá
exports.deleteReview = async (req, res) => {
    const { reviewId } = req.params;

    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Đánh giá không tồn tại' });
        }

        // Kiểm tra quyền xóa
        if (review.user_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' });
        }

        await review.deleteOne();
        res.status(200).json({ message: 'Đánh giá đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Chỉnh sửa đánh giá
exports.updateReview = async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Đánh giá không tồn tại' });
        }

        // Kiểm tra quyền chỉnh sửa
        if (review.user_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa đánh giá này' });
        }

        // Cập nhật thông tin đánh giá
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();
        res.status(200).json({ message: 'Đánh giá đã được cập nhật', review });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
