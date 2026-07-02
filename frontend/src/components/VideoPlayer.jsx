import { useEffect, useRef, useState } from "react";
import { useRoom } from "../context/useRoom";
import { socket } from "../socket/socketService";

export default function VideoPlayer() {
  const { room } = useRoom();

  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState("");

  const isHost = room?.hostSocketId === socket.id;
  const isRemoteUpdate = useRef(false);

  // =========================
  // LOCAL FILE (HOST ONLY)
  // =========================
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  }

  // =========================
  // EMIT SYNC EVENTS (HOST ONLY)
  // =========================
  function emitPlay() {
    if (!isHost || !room || isRemoteUpdate.current) return;

    socket.emit("video-play", {
      roomCode: room.roomCode,
      currentTime: videoRef.current.currentTime,
    });
  }

  function emitPause() {
    if (!isHost || !room || isRemoteUpdate.current) return;

    socket.emit("video-pause", {
      roomCode: room.roomCode,
      currentTime: videoRef.current.currentTime,
    });
  }

  function emitSeek() {
    if (!isHost || !room || isRemoteUpdate.current) return;

    socket.emit("video-seek", {
      roomCode: room.roomCode,
      currentTime: videoRef.current.currentTime,
    });
  }

  // =========================
  // RECEIVE SYNC EVENTS
  // =========================
  useEffect(() => {
    function onPlay({ currentTime }) {
      if (!videoRef.current) return;

      isRemoteUpdate.current = true;

      videoRef.current.currentTime = currentTime;
      videoRef.current.play().catch(() => {});

      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 300);
    }

    function onPause({ currentTime }) {
      if (!videoRef.current) return;

      isRemoteUpdate.current = true;

      videoRef.current.currentTime = currentTime;
      videoRef.current.pause();

      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 300);
    }

    function onSeek({ currentTime }) {
      if (!videoRef.current) return;

      isRemoteUpdate.current = true;

      videoRef.current.currentTime = currentTime;

      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 300);
    }

    socket.on("video-play", onPlay);
    socket.on("video-pause", onPause);
    socket.on("video-seek", onSeek);

    return () => {
      socket.off("video-play", onPlay);
      socket.off("video-pause", onPause);
      socket.off("video-seek", onSeek);
    };
  }, []);

  // =========================
  // AUTO SYNC ON JOIN (IMPORTANT)
  // =========================
  useEffect(() => {
    if (!room || !videoRef.current) return;

    socket.emit("get-room", { roomCode: room.roomCode }, (res) => {
      if (!res?.success) return;

      const r = res.room;

      // If host is playing video, sync joiner
      if (r.videoState?.currentTime) {
        videoRef.current.currentTime = r.videoState.currentTime;
      }

      if (r.videoState?.isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    });
  }, [room]);

  return (
    <div className="rounded-xl bg-slate-900 p-6">

      <h2 className="mb-4 text-xl font-bold">
        Video Player
      </h2>

      {/* HOST FILE INPUT */}
      {isHost ? (
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="mb-4 w-full rounded bg-slate-800 p-2"
        />
      ) : (
        <div className="mb-4 text-slate-400">
          Waiting for host to load video...
        </div>
      )}

      {/* VIDEO */}
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full rounded-lg bg-black"
        onPlay={emitPlay}
        onPause={emitPause}
        onSeeked={emitSeek}
      />
    </div>
  );
}