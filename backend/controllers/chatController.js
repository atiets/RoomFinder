const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Lấy danh sách cuộc trò chuyện của một người dùng
exports.getConversationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await Conversation.find({ participants: userId })
            .populate({
                path: "participants",
                select: "_id username profile.picture profile.isOnline",
                options: { strictPopulate: false },
            })
            .populate({
                path: "lastMessage",
                options: { strictPopulate: false },
            })
            .populate({
                path: "postId",
                select: "images title rentalPrice typePrice",
                options: { strictPopulate: false },
            });

        const formattedConversations = conversations.map(chat => ({
            ...chat._doc,
            readBy: chat.readBy,
            firstPostImage: chat.postId?.images?.length ? chat.postId.images[0] : null
        }));

        res.status(200).json(formattedConversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//Lấy tin nhắn của cuộc trò chuyện bất kì
exports.getMessagesByConversation = async (req, res) => {

    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const messages = await Message.find({ conversationId })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.status(200).json({
            success: true,
            messages,
            currentPage: Number(page),
            hasNextPage: messages.length === Number(limit),
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

//đọc tin nhắn trong cuộc trò chuyện
exports.markConversationAsRead = async (conversationId, userId, socket) => {
    try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) return;

        // Nếu userId chưa có trong readBy thì thêm vào
        if (!conversation.readBy.includes(userId)) {
            conversation.readBy.push(userId);
            await conversation.save();

            socket.to(userId.toString()).emit("conversationRead", {
                conversationId,
                userId,
                readBy: conversation.readBy
            });
        }

        // Đếm lại số cuộc hội thoại chưa đọc
        const unreadCount = await countUnreadConversations(userId);

        // Emit lại số chưa đọc về cho người dùng
        socket.to(userId.toString()).emit("unreadConversationsCount", {
            userId,
            count: unreadCount
        });

    } catch (error) {
        console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
};


//Đêm số hội thoại chưa đọc
const countUnreadConversations = async (userId) => {
    const count = await Conversation.countDocuments({
        participants: userId,
        readBy: { $ne: userId }
    });
    return count;
};
