import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../socket/socketService";
import { useRoom } from "../context/useRoom";

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const { setRoom } = useRoom();

  const [hostName, setHostName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateRoom() {
    if (!hostName || !roomName) return;

    setLoading(true);
    setError("");

    try {
      const room = await createRoom({
        hostName,
        roomName,
      });

      setRoom(room);

      navigate(`/lobby/${room.roomCode}`);
    } catch (err) {
      setError(err.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-6 space-y-4">

        <h1 className="text-2xl font-bold text-white">
          Create Watch Room
        </h1>

        <input
          placeholder="Your Name"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          className="w-full p-3 rounded bg-slate-800 text-white"
        />

        <input
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full p-3 rounded bg-slate-800 text-white"
        />

        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="w-full p-3 rounded bg-indigo-600 text-white font-semibold"
        >
          {loading ? "Creating Room..." : "Create Room"}
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