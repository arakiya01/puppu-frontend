import { io } from "socket.io-client";

const ROOM_ID = "default";

const socket = io({ path: "/api/socketio", autoConnect: true });

socket.on("connect", () => {
  console.log("✅ connected");
  socket.emit("join-room", ROOM_ID);
});

socket.on("all-users", (users) => {
  console.log("既存参加者:", users);
  // Offerを送る処理へ
});

socket.on("user-joined", (userId) => {
  console.log("新規参加者:", userId);
  // 新規にOffer送信
});

socket.on("signal", ({ from, signal }) => {
  console.log(`Signal from ${from}`, signal);
  // シグナリング処理
});

socket.on("user-left", (userId) => {
  console.log("参加者退出:", userId);
  // クリーンアップ処理
});

export default socket;
