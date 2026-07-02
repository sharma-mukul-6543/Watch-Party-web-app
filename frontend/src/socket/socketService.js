import { socket } from "./socket";

function ensureConnection() {
  if (!socket.connected) socket.connect();
}

// =========================
// CREATE ROOM
// =========================
export function createRoom(data) {
  ensureConnection();

  return new Promise((resolve, reject) => {
    socket.emit("create-room", data, (res) => {
      if (!res?.success) return reject(new Error(res.message));
      resolve(res.room);
    });
  });
}

// =========================
// JOIN ROOM
// =========================
export function joinRoom(data) {
  ensureConnection();

  return new Promise((resolve, reject) => {
    socket.emit("join-room", data, (res) => {
      if (!res?.success) return reject(new Error(res.message));
      resolve(res.room);
    });
  });
}

export { socket };