import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("🟢 Socket Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Socket Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("Socket Error:", err.message);
});