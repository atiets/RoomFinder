const { Server } = require("socket.io");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000"],
            methods: ["GET", "POST"]
        }
    });

    const onlineUsers = {};

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join", (userId) => {
            onlineUsers[userId] = socket.id;
        });

        socket.on("sendMessage", async ({ sender, receiver, content, postId }) => {
            try {
                let conversation = await Conversation.findOne({
                    participants: { $all: [sender, receiver] },
                    postId
                });

                if (!conversation) {
                    conversation = new Conversation({ participants: [sender, receiver], postId });
                    await conversation.save();
                }

                const newMessage = new Message({ conversationId: conversation._id, sender, receiver, content });
                await newMessage.save();

                conversation.lastMessage = newMessage._id;
                conversation.updatedAt = Date.now();
                await conversation.save();

                const receiverSocketId = onlineUsers[receiver];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receiveMessage", newMessage);
                }
            } catch (error) {
                console.error("Lỗi khi gửi tin nhắn:", error);
            }
        });

        socket.on("disconnect", () => {
            for (let userId in onlineUsers) {
                if (onlineUsers[userId] === socket.id) {
                    delete onlineUsers[userId];
                    break;
                }
            }
        });
    });

    return io;
}

module.exports = initializeSocket;
