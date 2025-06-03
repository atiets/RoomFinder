import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.REACT_APP_BASE_URL_API; // Địa chỉ backend của bạn

const useSocket = (userId) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Kết nối đến server WebSocket
    const newSocket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket:", newSocket.id);

      // Gửi userId để join vào server
      newSocket.emit("join", userId);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  return socket;
};

export default useSocket;