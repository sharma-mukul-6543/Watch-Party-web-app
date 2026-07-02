import rooms, { disconnectTimers } from "./roomStore.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";

export default function initializeSocket(io) {
  io.on("connection", (socket) => {
    console.log(`🟢 Client Connected: ${socket.id}`);

    socket.emit("connected", {
      socketId: socket.id,
    });

    // =========================
    // CREATE ROOM
    // =========================
    socket.on("create-room", (payload, callback) => {
      const { hostName, roomName } = payload || {};

      if (!hostName?.trim() || !roomName?.trim()) {
        return callback({
          success: false,
          message: "Host name and room name are required.",
        });
      }

      const roomCode = generateRoomCode(rooms);

      const room = {
        roomCode,
        roomName: roomName.trim(),
        hostSocketId: socket.id,
        hostName: hostName.trim(),
        participants: [
          {
            socketId: socket.id,
            name: hostName.trim(),
            isHost: true,
          },
        ],
        createdAt: Date.now(),

        // ✅ IMPORTANT: VIDEO STATE
        videoState: {
  currentTime: 0,
  paused: true,
  playbackRate: 1,
},
      };

      rooms.set(roomCode, room);
      socket.join(roomCode);

      callback({
        success: true,
        room,
      });
    });

    // =========================
    // JOIN ROOM
    // =========================
  socket.on("join-room", (payload, callback) => {
  const { roomCode, name } = payload || {};

  const room = rooms.get(roomCode);

  if (!room) {
    return callback({
      success: false,
      message: "Room not found.",
    });
  }

  const trimmedName = name.trim();

  // Cancel pending removal if this user refreshed
  const timerKey = `${roomCode}:${trimmedName}`;

  if (disconnectTimers.has(timerKey)) {
    clearTimeout(disconnectTimers.get(timerKey));
    disconnectTimers.delete(timerKey);
  }

  // Find existing participant
  let participant = room.participants.find(
    (p) => p.name === trimmedName
  );

  if (participant) {
    participant.socketId = socket.id;
  } else {
    participant = {
      socketId: socket.id,
      name: trimmedName,
      isHost: room.hostName === trimmedName,
    };

    room.participants.push(participant);
  }

  // Restore host socket
  if (room.hostName === trimmedName) {
    room.hostSocketId = socket.id;
    participant.isHost = true;
  }

  rooms.set(roomCode, room);

  socket.join(roomCode);

  io.to(roomCode).emit("room-updated", room);

  callback({
    success: true,
    room,
  });
});

    // =========================
    // GET ROOM
    // =========================
    socket.on("get-room", ({ roomCode }, callback) => {
      const room = rooms.get(roomCode);

      if (!room) {
        return callback({
          success: false,
          message: "Room not found",
        });
      }

      callback({
        success: true,
        room,
      });
    });

// =========================
// VIDEO META
// =========================
socket.on("video-meta", ({ roomCode, meta }) => {
  const room = rooms.get(roomCode);

  if (!room) return;

  const participant = room.participants.find(
    (p) => p.socketId === socket.id
  );

  if (!participant) return;

  participant.videoMeta = {
    fileName: meta.fileName,
    fileSize: meta.fileSize,
  };

  console.log("========== ROOM STATE ==========");
  console.log(JSON.stringify(room, null, 2));
  console.log("================================");

  rooms.set(roomCode, room);

  io.to(roomCode).emit("room-updated", room);
});

// =========================
// VIDEO SYNC
// =========================
socket.on("video-sync", ({ roomCode, senderId, state }) => {

  console.log("✅ Backend received video-sync", {
  roomCode,
  senderId,
  state,
});
  const room = rooms.get(roomCode);

  if (!room) return;

  room.videoState = state;

  rooms.set(roomCode, room);

  console.log("VIDEO SYNC", {
    senderId,
    state,
  });

  socket.to(roomCode).emit("video-sync", {
    senderId,
    state,
  });
});

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {
  console.log(`🔴 Client Disconnected: ${socket.id}`);

  for (const [roomCode, room] of rooms.entries()) {
    const participant = room.participants.find(
      (p) => p.socketId === socket.id
    );

    if (!participant) continue;

    const timerKey = `${roomCode}:${participant.name}`;

    const timer = setTimeout(() => {
      const latestRoom = rooms.get(roomCode);

      if (!latestRoom) return;

      latestRoom.participants = latestRoom.participants.filter(
        (p) => p.name !== participant.name
      );

      if (latestRoom.participants.length === 0) {
        rooms.delete(roomCode);
        disconnectTimers.delete(timerKey);
        return;
      }

      // Host really left (after 15 sec)
      if (latestRoom.hostName === participant.name) {
        const newHost = latestRoom.participants[0];

        latestRoom.hostName = newHost.name;
        latestRoom.hostSocketId = newHost.socketId;
        newHost.isHost = true;
      }

      rooms.set(roomCode, latestRoom);

      io.to(roomCode).emit("room-updated", latestRoom);

      disconnectTimers.delete(timerKey);

      console.log(
        `❌ Removed ${participant.name} from room ${roomCode}`
      );
    }, 15000);

    disconnectTimers.set(timerKey, timer);
  }
});
  });

  console.log("✅ Socket.io initialized");
}