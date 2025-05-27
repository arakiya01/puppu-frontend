import { Server as NetServer } from "http";
import { Server as IOServer } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponseWithSocket } from "@/types/next";

export const config = {
  api: {
    bodyParser: false,
  },
};

type RoomMap = Map<string, Set<string>>;

// シンプルに1ルームだけ運用例（複数ルーム対応も容易）
const ROOM_ID = "default";

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("🔌 Socket.IO Server initializing...");

    const io = new IOServer(res.socket.server as NetServer, {
      path: "/api/socketio",
      cors: {
        origin: "*", // 必要に応じて制限を
      },
    });

    // ルーム管理マップ
    const rooms: RoomMap = new Map();

    io.on("connection", (socket) => {
      console.log(`✅ Socket connected: ${socket.id}`);

      // --- ルーム参加処理 ---
      socket.on("join-room", () => {
        console.log(`User ${socket.id} joining room: ${ROOM_ID}`);
        if (!rooms.has(ROOM_ID)) {
          rooms.set(ROOM_ID, new Set());
        }
        rooms.get(ROOM_ID)!.add(socket.id);
        socket.join(ROOM_ID);

        // 既存ユーザーID一覧（自分除く）を送信
        const otherUsers = Array.from(rooms.get(ROOM_ID)!).filter((id) => id !== socket.id);
        socket.emit("all-users", otherUsers);

        // 他の参加者に「ユーザー参加」通知
        socket.to(ROOM_ID).emit("user-joined", socket.id);

        console.log(`User ${socket.id} joined room ${ROOM_ID}`);
      });

      // --- シグナリングイベントを中継 ---

      socket.on("offer", ({ to, sdp }) => {
        console.log(`Offer from ${socket.id} to ${to}`);
        io.to(to).emit("offer", { from: socket.id, sdp });
      });

      socket.on("answer", ({ to, sdp }) => {
        console.log(`Answer from ${socket.id} to ${to}`);
        io.to(to).emit("answer", { from: socket.id, sdp });
      });

      socket.on("ice-candidate", ({ to, candidate }) => {
        console.log(`ICE candidate from ${socket.id} to ${to}`);
        io.to(to).emit("ice-candidate", { from: socket.id, candidate });
      });

      // --- 切断処理 ---
      socket.on("disconnect", () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);

        if (rooms.has(ROOM_ID)) {
          rooms.get(ROOM_ID)!.delete(socket.id);
          // 部屋が空になったらMapから削除しても良い
          if (rooms.get(ROOM_ID)!.size === 0) {
            rooms.delete(ROOM_ID);
          }
        }
        socket.to(ROOM_ID).emit("user-disconnected", socket.id);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("🌀 Socket.IO Server already running");
  }
  res.end();
}
