import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../socket/socketService";
import { useRoom } from "../context/useRoom";

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const { setRoom } = useRoom();

  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoinRoom() {
    if (!name || !roomCode) return;

    setLoading(true);
    setError("");

    try {
      const room = await joinRoom({
        name,
        roomCode: roomCode.trim().toUpperCase(),
      });

      setRoom(room);

      navigate(`/lobby/${room.roomCode}`);
    } catch (err) {
      setError(err.message || "Failed to join room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-6 space-y-4">

        <h1 className="text-2xl font-bold text-white">
          Join Watch Room
        </h1>

        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded bg-slate-800 text-white"
        />

        <input
          placeholder="Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="w-full p-3 rounded bg-slate-800 text-white uppercase"
        />

        <button
          onClick={handleJoinRoom}
          disabled={loading}
          className="w-full p-3 rounded bg-green-600 text-white font-semibold"
        >
          {loading ? "Joining..." : "Join Room"}
        </button>

        {error && (
          <p className="text-red-400 text-sm">
            {error}
          </p>
        )}

      </div>
    </div>
  );
}