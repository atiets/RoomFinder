// src/hooks/useSocket.js
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.REACT_APP_BASE_URL_API;

const useSocket = (userId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Cleanup previous connection
    if (socketRef.current) {
      console.log("🧹 Cleaning up previous socket connection");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (!userId) {
      console.log("⚠️ No userId provided, skipping socket connection");
      setSocket(null);
      setIsConnected(false);
      return;
    }

    console.log("🔌 Initializing socket connection for user:", userId);

    try {
      // Create new socket connection
      const newSocket = io(SOCKET_SERVER_URL, { 
        transports: ["websocket", "polling"],
        autoConnect: true,
        forceNew: true
      });

      socketRef.current = newSocket;

      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        setIsConnected(true);
        
        // Join user room
        newSocket.emit("join", userId);
        console.log("🏠 Joined user room:", userId);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("🔥 Socket connection error:", error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        console.log("🧹 useSocket cleanup for user:", userId);
        if (newSocket && newSocket.connected) {
          newSocket.disconnect();
        }
        setSocket(null);
        setIsConnected(false);
        socketRef.current = null;
      };
    } catch (error) {
      console.error("🔥 Error creating socket:", error);
      setSocket(null);
      setIsConnected(false);
    }
  }, [userId]);

  return {
    socket,
    isConnected,
    userId
  };
};

export default useSocket;
