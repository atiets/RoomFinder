const { autoReplyQueue } = require('./bullmq');
const rules = require('../rules');
const { getReplyFromAI } = require('../aiProxy');
const {getRandomOnlineAdmin} = require("../randomAdmin");
const mongoose = require('mongoose');
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');

/**
 * Hàm xử lý mỗi tin nhắn đến từ client
 * @param {import('socket.io').Server} io      - socket‑server toàn cục
 * @param {string} socketId                    - id phiên client đang chat
 * @param {string} incomingMessage             - nội dung người dùng gửi
 */
botId = process.env.BOT_ID || null; // id bot, nếu có

async function handleIncomingMessage(io, socketId, { sender, content }, onlineUsers) {
    try {
        // 1. Tìm hoặc tạo conversation user + bot (hoặc user đơn giản)
        const participantIds = [mongoose.Types.ObjectId(sender)];
        if (botId) participantIds.push(mongoose.Types.ObjectId(botId));
        participantIds.sort();

        let conversation = await Conversation.findOne({
            participants: { $all: participantIds, $size: participantIds.length }
        });

        if (!conversation) {
            conversation = await Conversation.create({ participants: participantIds });
        }

        // 2. Thử trả lời theo rule
        let reply = matchRule(content);

        // 3. Nếu không có rule, gọi AI trả lời
        if (!reply) {
            reply = await getReplyFromAI(content);
        }

        // 4. Kiểm tra xem AI có trả lời được không
        const adminReplyMarker = "Hiện tại tôi chưa thể trả lời câu hỏi này, vui lòng đợi admin phản hồi.";
        const needsAdmin = !reply || reply.toLowerCase().includes(adminReplyMarker.toLowerCase());

        // 5. Lưu tin nhắn user gửi
        const userMessage = await Message.create({
            conversationId: conversation._id,
            sender,
            receiver: null, // chưa xác định admin
            content,
            timestamp: new Date(),
        });

        // 6. Nếu cần admin xử lý (AI không trả lời được)
        if (needsAdmin) {
            // Nếu conversation chưa có admin claim
            if (!conversation.claimedByAdmin) {
                const adminId = await getRandomOnlineAdmin(onlineUsers); // lấy admin có thể claim
                if (adminId) {
                    conversation.claimedByAdmin = adminId;
                    await conversation.save();

                    // Cập nhật message receiver là admin được claim
                    userMessage.receiver = adminId;
                    await userMessage.save();
                }
            }

            // Gửi notification, message cho admin được claim nếu có
            if (conversation.claimedByAdmin) {
                io.to(conversation.claimedByAdmin.toString()).emit("receiveMessage", userMessage);
            }

            // Gửi lại tin user cho user
            io.to(socketId).emit("receiveMessage", userMessage);

            // Bạn có thể gửi thêm thông báo "admin sẽ trả lời bạn sớm" cho user ở đây nếu muốn
        }

        // 7. Nếu AI trả lời được, lưu tin trả lời vào DB
        const replySenderId = botId || null; // bot gửi, hoặc null admin ảo
        const replyMessage = await Message.create({
            conversationId: conversation._id,
            sender: replySenderId,
            receiver: sender,
            content: reply,
            timestamp: new Date(),
        });

        // 8. Cập nhật conversation lastMessage và trạng thái đọc
        conversation.lastMessage = replyMessage._id;
        conversation.updatedAt = new Date();
        conversation.readBy = [sender];
        await conversation.save();

        // 9. Đưa reply vào queue gửi message
        await autoReplyQueue.add(
            'sendReply',
            { socketId, reply },
            { attempts: 3, backoff: 2000 }
        );

        // 10. Gửi realtime cho user
        io.to(socketId).emit("receiveMessage", userMessage);
        io.to(socketId).emit("receiveMessage", replyMessage);

    } catch (error) {
        console.error("Lỗi khi xử lý tin nhắn:", error);
    }
}

/* ----------------- Helpers ----------------- */
function matchRule(message) {
    for (const rule of rules) {
        if (rule.pattern.test(message)) return rule.response;
    }
    return null;
}

module.exports = { handleIncomingMessage };
