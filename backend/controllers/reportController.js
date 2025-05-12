const Report = require("../models/Report");
const Post = require("../models/Post");
const User = require("../models/User");

const reportPost = async (req, res) => {
    try {
        const { postId, reporter, reason, note } = req.body;

        // 1. Kiểm tra đã từng báo cáo chưa
        const existingReport = await Report.findOne({
            post: postId,
            "reporter.id": reporter.id
        });

        if (existingReport) {
            return res.status(400).json({ message: "Bạn đã báo cáo bài viết này trước đó." });
        }

        // 2. Tạo báo cáo
        const report = new Report({
            post: postId,
            reporter,
            reason,
            note
        });
        await report.save();

        // 3. Cập nhật bài viết
        const post = await Post.findById(postId);
        post.report_count += 1;

        // 4. Gắn cờ nếu ≥ 5 báo cáo
        if (post.report_count >= 5) {
            post.is_flagged = true;
        }

        // 5. Tạm ẩn nếu ≥ 10 báo cáo trong 1 giờ
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const reportsLastHour = await Report.countDocuments({
            post: postId,
            createdAt: { $gte: oneHourAgo }
        });

        if (reportsLastHour >= 10) {
            post.visibility = "hidden";
        }

        // 6. Nếu là lừa đảo => đánh dấu ưu tiên
        if (reason === "Lừa đảo") {
            post.is_priority = true;
        }

        await post.save();

        // 7. Khóa người dùng nếu ≥ 3 bài viết bị flag
        const flaggedPosts = await Post.countDocuments({
            user: post.user,
            is_flagged: true
        });

        if (flaggedPosts >= 3) {
            await User.findByIdAndUpdate(post.user, { is_blocked: true });
        }

        return res.status(201).json({ message: "Báo cáo đã được ghi nhận." });

    } catch (error) {
        console.error("Lỗi báo cáo:", error);
        return res.status(500).json({ message: "Lỗi server." });
    }
};

module.exports = {
    reportPost,
};
