import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socketService";
import { useRoom } from "../context/useRoom";

export default function VideoPlayer() {
  const { room } = useRoom();

  const videoRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState(null);
  const [myVideo, setMyVideo] = useState(null);

  // Prevent rebroadcast loop
  const isRemoteUpdate = useRef(false);

  // ==========================
  // Cleanup Blob URL
  // ==========================

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // ==========================
  // Select Local Movie
  // ==========================

  function handleVideoSelect(e) {
    const file = e.target.files?.[0];

    if (!file || !room) return;

    const url = URL.createObjectURL(file);

    setVideoUrl(url);

    const meta = {
      fileName: file.name,
      fileSize: file.size,
    };

    setMyVideo(meta);

    socket.emit("video-meta", {
      roomCode: room.roomCode,
      meta,
    });
  }

  // ==========================
  // Broadcast current playback state
  // ==========================

  function broadcastVideoState() {
  if (!videoRef.current || !room) return;

  const payload = {
    roomCode: room.roomCode,
    senderId: socket.id,
    state: {
      currentTime: videoRef.current.currentTime,
      paused: videoRef.current.paused,
      playbackRate: videoRef.current.playbackRate,
    },
  };

  console.log("📤 EMITTING", payload);

  socket.emit("video-sync", payload);
}
  // ==========================
  // Listen to local playback changes
  // ==========================

  useEffect(() => {
    console.log("Video Ref =", videoRef.current);

    const video = videoRef.current;

    if (!video) {
        console.log("Video is NULL");
        return;
    }

    console.log("Attaching listeners");

    function handleLocalChange() {
  if (isRemoteUpdate.current) {
    console.log("Ignoring remote update");
    return;
  }

  console.log("EVENT FIRED");

  broadcastVideoState();
}

    video.addEventListener("play", handleLocalChange);
    video.addEventListener("pause", handleLocalChange);
    video.addEventListener("seeked", handleLocalChange);
    video.addEventListener("ratechange", handleLocalChange);

    return () => {
        video.removeEventListener("play", handleLocalChange);
        video.removeEventListener("pause", handleLocalChange);
        video.removeEventListener("seeked", handleLocalChange);
        video.removeEventListener("ratechange", handleLocalChange);
    };
}, [room]);

  // ==========================
  // Receive sync from another participant
  // ==========================

  useEffect(() => {
    function handleVideoSync({ senderId, state }) {

        console.log("📥 Received Sync", {
  senderId,
  myId: socket.id,
  state,
});
      if (!videoRef.current) return;

      if (senderId === socket.id) return;

      const video = videoRef.current;

      isRemoteUpdate.current = true;

      video.playbackRate = state.playbackRate;
      video.currentTime = state.currentTime;

      if (state.paused) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }

      setTimeout(() => {
    isRemoteUpdate.current = false;
}, 200);
    }

    socket.on("video-sync", handleVideoSync);

    return () => {
      socket.off("video-sync", handleVideoSync);
    };
  }, []);

  return (
        <div className="bg-slate-900 rounded-xl p-5">

      <h2 className="text-2xl font-bold mb-5">
        Local Movie
      </h2>

      <input
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        className="mb-5 block w-full"
      />

      {myVideo && (
        <div className="bg-slate-800 rounded-lg p-3 mb-5">
          <p>
            <strong>Your Movie:</strong> {myVideo.fileName}
          </p>

          <p>
            <strong>Size:</strong>{" "}
            {(myVideo.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

     <video
  ref={videoRef}
  src={videoUrl || undefined}
  controls
  className="w-full rounded-lg bg-black"
  onPlay={() => {
    console.log("PLAY EVENT");
    broadcastVideoState();
  }}
  onPause={() => {
    console.log("PAUSE EVENT");
    broadcastVideoState();
  }}
  onSeeked={() => {
    console.log("SEEK EVENT");
    broadcastVideoState();
  }}
  onRateChange={() => {
    console.log("RATE EVENT");
    broadcastVideoState();
  }}
/>
      <div className="mt-6 bg-slate-800 rounded-lg p-4">

        <h3 className="text-lg font-bold mb-3">
          Participants' Movies
        </h3>

        {room?.participants?.length ? (
          room.participants.map((participant) => {
            const sameMovie =
              myVideo &&
              participant.videoMeta &&
              participant.videoMeta.fileName === myVideo.fileName &&
              participant.videoMeta.fileSize === myVideo.fileSize;

            return (
              <div
                key={participant.socketId}
                className="flex justify-between items-center border-b border-slate-700 py-2"
              >
                <div>
                  <span className="font-medium">
                    {participant.name}
                    {participant.isHost && " 👑"}
                  </span>
                </div>

                <div className="text-right">
                  {participant.videoMeta ? (
                    <>
                      <p className="text-sm">
                        {participant.videoMeta.fileName}
                      </p>

                      <p
                        className={`text-xs ${
                          sameMovie
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {sameMovie
                          ? "✅ Same Movie"
                          : "⚠ Different Movie"}
                      </p>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Waiting for movie...
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400">
            No participants yet.
          </p>
        )}

      </div>

    </div>
  );
}