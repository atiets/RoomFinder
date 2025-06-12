import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import useSocket from "../../../hooks/useSocket";
import { getMessagesWithBot } from "../../../redux/chatApi";

const SupportChatModal = ({ open, onClose }) => {
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const userId = currentUser?._id;
    const token = currentUser?.accessToken;
    const socket = useSocket(userId);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);


    const botID = process.env.REACT_APP_BOT_ID;
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        const onReceive = (msg) => {
            console.log("📩 Message received from socket:", msg); // ✅ Log message
            setMessages((prev) => [...prev, msg]);
        };

        socket.on("receiveMessage", onReceive);
        console.log("✅ Listening for 'receiveMessage' events...");

        return () => {
            socket.off("receiveMessage", onReceive);
            console.log("🛑 Stopped listening to 'receiveMessage'");
        };
    }, [socket]);

    const handleSend = () => {
        if (!input.trim() || !socket) return;

        const myMsg = { sender: userId, content: input.trim() };
        socket.emit("clientMessage", myMsg);
        setMessages((prev) => [...prev, myMsg]);
        setInput("");
    };

    const handleImageClick = (imgUrl) => {
        setSelectedImage(imgUrl);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    useEffect(() => {
        if (open && userId && token) {
            getMessagesWithBot(userId, token)
                .then((res) => {
                    if (res.data.messages) {
                        setMessages(res.data.messages);
                    }
                })
                .catch((err) => console.error(err));
        }
    }, [open, userId, token]);

    return (
        <Box
            sx={{
                display: open ? "flex" : "none",
                position: "fixed",
                bottom: 20,
                right: 20,
                width: 360,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 6,
                overflow: "hidden",
                flexDirection: "column",
                height: "450px",
                width: "350px",
                zIndex: 1300, // để nổi trên cùng
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: "#63ab45",
                    color: "#fff",
                    p: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography fontWeight="bold">Hỗ trợ trực tuyến</Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Chat Area */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    px: 1.5,
                    py: 1,
                    bgcolor: "#f9f9f9",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                }}
            >
                {messages.map((m, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            alignSelf: (m.sender?._id === userId || m.sender === userId) ? "flex-end" : "flex-start",
                            bgcolor: (m.sender?._id === userId || m.sender === userId) ? "#e0f4d7" : "#ececec",
                            color: "#333",
                            px: 1.2,
                            py: 0.8,
                            borderRadius: 2,
                            maxWidth: "75%",
                            fontSize: "0.875rem",
                            boxShadow: 1,
                        }}
                    >
                        {m.content}
                        {m.images && m.images.length > 0 && (
                            <div className="message-images">
                                {m.images.map((imgUrl, index) => (
                                    <img
                                        key={index}
                                        src={imgUrl}
                                        alt={`Ảnh ${index + 1}`}
                                        className="message-image"
                                        onClick={() => handleImageClick(imgUrl)} // Mở ảnh lớn khi click
                                    />
                                ))}
                            </div>
                        )}
                    </Box>
                ))}
                <div ref={bottomRef} />
                {selectedImage && (
                    <div className="modal open" onClick={closeModal}>
                        <img src={selectedImage} alt="Ảnh lớn" />
                    </div>
                )}
            </Box>

            {/* Input */}
            <Box
                sx={{
                    borderTop: "1px solid #ddd",
                    p: 1.5,
                    display: "flex",
                    gap: 1,
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Nhập tin nhắn…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                    variant="contained"
                    onClick={handleSend}
                    sx={{
                        bgcolor: "#63ab45",
                        "&:hover": { bgcolor: "#558e3b" },
                        textTransform: "none",
                    }}
                >
                    Gửi
                </Button>
            </Box>
        </Box>
    );
};

export default SupportChatModal;
