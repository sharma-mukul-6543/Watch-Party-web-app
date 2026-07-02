import rooms from "./roomStore.js";
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
          isPlaying: false,
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

      const participant = {
        socketId: socket.id,
        name: name.trim(),
        isHost: false,
      };

      room.participants.push(participant);

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
    // VIDEO SYNC + STATE STORAGE
    // =========================

    socket.on("video-play", ({ roomCode, currentTime }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.videoState = {
        currentTime,
        isPlaying: true,
      };

      rooms.set(roomCode, room);

      socket.to(roomCode).emit("video-play", {
        currentTime,
        timestamp: Date.now(),
      });
    });

    socket.on("video-pause", ({ roomCode, currentTime }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.videoState = {
        currentTime,
        isPlaying: false,
      };

      rooms.set(roomCode, room);

      socket.to(roomCode).emit("video-pause", {
        currentTime,
        timestamp: Date.now(),
      });
    });

    socket.on("video-seek", ({ roomCode, currentTime }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.videoState.currentTime = currentTime;

      rooms.set(roomCode, room);

      socket.to(roomCode).emit("video-seek", {
        currentTime,
        timestamp: Date.now(),
      });
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {
      console.log(`🔴 Client Disconnected: ${socket.id}`);

      for (const [roomCode, room] of rooms.entries()) {
        const updated = room.participants.filter(
          (p) => p.socketId !== socket.id
        );

        if (updated.length === 0) {
          rooms.delete(roomCode);
          continue;
        }

        room.participants = updated;

        if (room.hostSocketId === socket.id && room.participants.length) {
          const newHost = room.participants[0];
          room.hostSocketId = newHost.socketId;
          room.hostName = newHost.name;
          newHost.isHost = true;
        }

        rooms.set(roomCode, room);

        io.to(roomCode).emit("room-updated", room);
      }
    });
  });

  console.log("✅ Socket.io initialized");
}