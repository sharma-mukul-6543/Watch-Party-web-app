import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket/socketService";
import { useRoom } from "../context/useRoom";
import VideoPlayer from "../components/VideoPlayer";

export default function LobbyPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const { room, setRoom } = useRoom();

  // =========================
  // BLOCK ACCESS WITHOUT ROOM
  // =========================
  useEffect(() => {
    if (!roomCode) {
      navigate("/");
      return;
    }
  }, [roomCode, navigate]);

  // =========================
  // ROOM RECOVERY ON REFRESH
  // =========================
  useEffect(() => {
    if (!roomCode) return;

    socket.emit("get-room", { roomCode }, (res) => {
      if (res?.success) {
        setRoom(res.room);
      } else {
        navigate("/");
      }
    });
  }, [roomCode, setRoom, navigate]);

  // =========================
  // LIVE ROOM UPDATES
  // =========================
  useEffect(() => {
    function handleRoomUpdate(updatedRoom) {
      setRoom(updatedRoom);
    }

    socket.on("room-updated", handleRoomUpdate);

    return () => {
      socket.off("room-updated", handleRoomUpdate);
    };
  }, [setRoom]);

  // =========================
  // SAFETY GUARD
  // =========================
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading room...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* ROOM HEADER */}
      <div className="max-w-5xl mx-auto rounded-xl bg-slate-900 p-6">
        <h1 className="text-3xl font-bold">
          🎬 {room.roomName}
        </h1>

        <p className="mt-2 text-slate-400">
          Room Code: {room.roomCode}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-4 rounded-lg">
            Host: {room.hostName}
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            Participants: {room.participants.length}
          </div>
        </div>
      </div>

      {/* VIDEO PLAYER */}
      <div className="max-w-5xl mx-auto mt-6">
        <VideoPlayer />
      </div>

    </div>
  );
}