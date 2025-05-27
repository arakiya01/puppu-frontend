"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function SocketTester() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket = io({
      path: "/api/socketio",
    });

    socket.on("connect", () => {
      console.log("✅ Connected to server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
      <p className="text-sm">SocketTester: {isConnected ? "✅ 接続中" : "❌ 未接続"}</p>
    </div>
  );
}
