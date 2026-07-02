/* eslint-disable no-undef */
import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socketService";
import { useRoom } from "../context/useRoom";

export default function VideoPlayer() {
  const { room } = useRoom();

  const videoRef = useRef(null);

  const [videoUrl, setVideoUrl] = useState(null);
  const [myVideo, setMyVideo] = useState(null);

  // Prevent rebroadcast loop
  const isRemoteAction = useRef(false);

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

// ======================================
// PLAY
// ======================================

function handlePlay() {
  if (!room || !videoRef.current) return;

  if (isRemoteAction.current) {
    isRemoteAction.current = false;
    return;
  }

  socket.emit("video-play", {
    roomCode: room.roomCode,
    currentTime: videoRef.current.currentTime,
  });
}

// ======================================
// PAUSE
// ======================================

function handlePause() {
  if (!room || !videoRef.current) return;

  if (isRemoteAction.current) {
    isRemoteAction.current = false;
    return;
  }

  socket.emit("video-pause", {
    roomCode: room.roomCode,
    currentTime: videoRef.current.currentTime,
  });
}

// ======================================
// SEEK
// ======================================

function handleSeeked() {
  if (!room || !videoRef.current) return;

  if (isRemoteAction.current) {
    isRemoteAction.current = false;
    return;
  }

  socket.emit("video-seek", {
    roomCode: room.roomCode,
    currentTime: videoRef.current.currentTime,
  });
}

// ======================================
// SPEED CHANGE
// ======================================

function handleRateChange() {
  if (!room || !videoRef.current) return;

  if (isRemoteAction.current) {
    isRemoteAction.current = false;
    return;
  }

  socket.emit("video-rate", {
    roomCode: room.roomCode,
    playbackRate: videoRef.current.playbackRate,
  });
}

// ======================================
// RECEIVE PLAY
// ======================================

useEffect(() => {
  function onPlay({ currentTime }) {
    if (!videoRef.current) return;

    isRemoteAction.current = true;

    videoRef.current.currentTime = currentTime;

    videoRef.current.play().catch(() => {});
  }

  socket.on("video-play", onPlay);

  return () => socket.off("video-play", onPlay);
}, []);

// ======================================
// RECEIVE PAUSE
// ======================================

useEffect(() => {
  function onPause({ currentTime }) {
    if (!videoRef.current) return;

    isRemoteAction.current = true;

    videoRef.current.currentTime = currentTime;

    videoRef.current.pause();
  }

  socket.on("video-pause", onPause);

  return () => socket.off("video-pause", onPause);
}, []);

// ======================================
// RECEIVE SEEK
// ======================================

useEffect(() => {
  function onSeek({ currentTime }) {
    if (!videoRef.current) return;

    isRemoteAction.current = true;

    videoRef.current.currentTime = currentTime;

    setTimeout(() => {
      isRemoteAction.current = false;
    }, 100);
  }

  socket.on("video-seek", onSeek);

  return () => socket.off("video-seek", onSeek);
}, []);

// ======================================
// RECEIVE SPEED
// ======================================

useEffect(() => {
  function onRate({ playbackRate }) {
    if (!videoRef.current) return;

    isRemoteAction.current = true;

    videoRef.current.playbackRate = playbackRate;

    setTimeout(() => {
      isRemoteAction.current = false;
    }, 100);
  }

  socket.on("video-rate", onRate);

  return () => socket.off("video-rate", onRate);
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

      onPlay={handlePlay}
      onPause={handlePause}
      onSeeked={handleSeeked}
      onRateChange={handleRateChange}
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