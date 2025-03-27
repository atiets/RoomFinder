const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Gửi tin nhắn
exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, content, postId } = req.body;

        // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
        let conversation = await Conversation.findOne({
            participants: { $all: [sender, receiver] },
            postId: postId
        });

        // Nếu chưa có, tạo mới cuộc trò chuyện
        if (!conversation) {
            conversation = new Conversation({
                participants: [sender, receiver],
                postId: postId
            });
            await conversation.save();
        }
        const newMessage = new Message({
            conversationId: conversation._id,
            sender,
            receiver,
            content
        });
        await newMessage.save();
        conversation.lastMessage = newMessage._id;
        conversation.updatedAt = Date.now();
        await conversation.save();
        res.status(200).json({ message: "Message sent", conversationId: conversation._id, newMessage });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi gửi tin nhắn", details: error.message });
    }
};

// Lấy danh sách cuộc trò chuyện của một người dùng
exports.getConversationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await Conversation.find({ participants: userId })
            .populate({
                path: "participants",
                select: "username profile.picture profile.isOnline",
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
        const { page = 1, limit = 20 } = req.query; // Mặc định lấy 20 tin nhắn trên mỗi trang

        const messages = await Message.find({ conversationId })
            .sort({ timestamp: -1 }) // Sắp xếp giảm dần theo thời gian
            .skip((page - 1) * limit) // Bỏ qua số lượng tin đã lấy trước đó
            .limit(Number(limit)); // Giới hạn số tin nhắn mỗi lần lấy

        res.status(200).json({
            success: true,
            messages,
            currentPage: Number(page),
            hasNextPage: messages.length === Number(limit), // Kiểm tra có trang tiếp theo không
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
