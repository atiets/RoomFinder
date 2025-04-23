const { Server } = require("socket.io");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const mongoose = require("mongoose");
const { markConversationAsRead } = require("../controllers/chatController");

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000"],
            methods: ["GET", "POST"]
        }
    });

    const onlineUsers = {};

    io.on("connection", (socket) => {
        // console.log("User connected:", socket.id);
        const getOnlineUserIds = () => Object.keys(onlineUsers);

        socket.on("join", (userId) => {
            onlineUsers[userId] = socket.id;
            socket.join(userId);
            // console.log(`User ${userId} joined their personal room`);
            io.emit("onlineUsers", getOnlineUserIds());
        });


        socket.on("sendMessage", async ({ sender, receiver, content, postId, images, location }) => {
            try {
                const senderId = new mongoose.Types.ObjectId(sender);
                const receiverId = new mongoose.Types.ObjectId(receiver);
                const participantsSorted = [senderId, receiverId].sort();

                let conversation = await Conversation.findOne({
                    participants: { $all: participantsSorted, $size: 2 },
                });

                if (conversation) {
                    if (postId && !conversation.postId) {
                        conversation.postId = postId;
                        await conversation.save();
                    }
                } else {
                    if (postId) {
                        conversation = new Conversation({
                            participants: participantsSorted,
                            postId: postId,
                        });
                        await conversation.save();
                    }
                }

                const newMessage = new Message({
                    conversationId: conversation._id,
                    sender,
                    receiver,
                    content,
                    content: content || '',
                    images,
                    location: location || null,
                });
                await newMessage.save();

                conversation.lastMessage = newMessage._id;
                conversation.readBy = [sender];
                conversation.updatedAt = Date.now();
                await conversation.save();

                const unreadCount = await Conversation.countDocuments({
                    participants: receiverId,
                    readBy: { $ne: receiverId },
                });

                io.to(receiverId.toString()).emit("unreadConversationsCount", {
                    userId: receiverId,
                    count: unreadCount,
                });

                io.emit("receiveMessage", newMessage);
                const updatedConversation = await Conversation.findById(conversation._id)
                    .populate({
                        path: "participants",
                        select: "username profile.picture profile.isOnline",
                    })
                    .populate({
                        path: "lastMessage",
                    })
                    .populate({
                        path: "postId",
                        select: "images title rentalPrice typePrice",
                    });

                io.emit("updateConversations", {
                    userIds: [sender, receiver],
                    updatedConversation,
                });
            } catch (error) {
                console.error("Lỗi khi gửi tin nhắn:", error);
            }
        });

        socket.on("readConversation", async ({ conversationId, userId }) => {
            await markConversationAsRead(conversationId, userId, socket);
        });


        socket.on("disconnect", () => {
            for (let userId in onlineUsers) {
                if (onlineUsers[userId] === socket.id) {
                    delete onlineUsers[userId];
                    break;
                }
            }
            io.emit("onlineUsers", getOnlineUserIds());
        });
    });

    return io;
}

module.exports = initializeSocket;
