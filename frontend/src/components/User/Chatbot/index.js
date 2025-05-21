import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useSocket from "../../../hooks/useSocket"; // <-- hook của bạn

const ChatTest = () => {
    // tạm tạo ra 1 userId ngẫu nhiên; thực tế bạn lấy từ auth
    const currentUser = useSelector((state) => state.auth.login.currentUser);
    const userId = currentUser?._id;

    /* hook trả về socket + hàm tiện để gửi */
    const socket = useSocket(userId);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    /* lắng nghe tin nhắn realtime từ server */
    useEffect(() => {
        if (!socket) return;

        const onReceive = (msg) => setMessages((prev) => [...prev, msg]);
        socket.on("receiveMessage", onReceive);

        return () => socket.off("receiveMessage", onReceive);
    }, [socket]);

    console.log("tin nhắn nhận được", messages);

    const handleSend = () => {
        if (!input.trim() || !socket) return;

        const myMsg = { sender: userId, content: input.trim() };
        setMessages((prev) => [...prev, myMsg]);

        // Gửi tin nhắn qua socket
        socket.emit("clientMessage", { sender: userId, content: input.trim() });

        setInput("");
    };

    return (
        <div style={{ maxWidth: 400, margin: "0 auto", padding: 16 }}>
            <h3>Chat test – userId: {userId.slice(0, 8)}...</h3>

            {/* khung chat */}
            <div
                style={{
                    height: 300,
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    padding: 8,
                    marginBottom: 12,
                }}
            >
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: m.sender === userId ? "#cde7ff" : "#eee",
                            borderRadius: 8,
                            padding: "4px 8px",
                            marginBottom: 4,
                            alignSelf: m.sender === userId ? "flex-end" : "flex-start",
                            maxWidth: "80%",
                        }}
                    >
                        {m.content}
                    </div>
                ))}
            </div>

            {/* input + nút gửi */}
            <div style={{ display: "flex", gap: 8 }}>
                <input
                    style={{ flex: 1, padding: 6 }}
                    placeholder="Nhập tin nhắn…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>Gửi</button>
            </div>
        </div>
    );
};

export default ChatTest;
