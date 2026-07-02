import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../context/useRoom";
import { joinRoom, socket } from "../socket/socketService";
import VideoPlayer from "../components/VideoPlayer";

export default function LobbyPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const { room, setRoom } = useRoom();

  // Restore room after refresh
  useEffect(() => {
    async function restoreSession() {
      const saved = localStorage.getItem("watchPartySession");

      if (!saved) {
        navigate("/");
        return;
      }

      const session = JSON.parse(saved);

      if (session.roomCode !== roomCode) {
        navigate("/");
        return;
      }

      try {
        const restoredRoom = await joinRoom({
          roomCode: session.roomCode,
          name: session.name,
        });

        setRoom(restoredRoom);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("watchPartySession");
        navigate("/");
      }
    }

    restoreSession();
  }, [navigate, roomCode, setRoom]);

  // Live room updates
  useEffect(() => {
  function handleRoomUpdate(updatedRoom) {
    setRoom(updatedRoom);
  }

  async function handleReconnect() {
    const saved = localStorage.getItem("watchPartySession");

    if (!saved) return;

    const session = JSON.parse(saved);

    try {
      const restoredRoom = await joinRoom({
        roomCode: session.roomCode,
        name: session.name,
      });

      setRoom(restoredRoom);

      console.log("✅ Rejoined socket room after reconnect");
    } catch (err) {
      console.error("Reconnect join failed:", err);
    }
  }

  socket.on("room-updated", handleRoomUpdate);
  socket.on("connect", handleReconnect);

  return () => {
    socket.off("room-updated", handleRoomUpdate);
    socket.off("connect", handleReconnect);
  };
}, [setRoom]);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Restoring room...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-slate-900 rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold">{room.roomName}</h1>

          <p className="text-slate-400 mt-2">
            Room Code: <span className="font-semibold">{room.roomCode}</span>
          </p>

          <p className="text-slate-400">
            Host:{" "}
            <span className="text-green-400 font-semibold">
              {room.hostName}
            </span>
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">

          {/* Video */}
          <div className="lg:col-span-3">
            <VideoPlayer />
          </div>

          {/* Participants */}
          <div className="bg-slate-900 rounded-xl p-5 h-fit">
            <h2 className="text-xl font-bold mb-4">
              Participants ({room.participants.length})
            </h2>

            <div className="space-y-3">
              {room.participants.map((participant) => (
                <div
                  key={participant.socketId}
                  className="bg-slate-800 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {participant.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {participant.isHost ? "Host" : "Participant"}
                    </p>
                  </div>

                  {participant.isHost && (
                    <span className="px-2 py-1 rounded bg-yellow-500 text-black text-xs font-bold">
                      HOST
                    </span>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}