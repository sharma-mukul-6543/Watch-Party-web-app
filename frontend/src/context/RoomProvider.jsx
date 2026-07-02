import { useEffect, useMemo, useState } from "react";
import { RoomContext } from "./RoomContext";

export function RoomProvider({ children }) {
  const [room, setRoom] = useState(() => {
    const saved = localStorage.getItem("room");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (room) {
      localStorage.setItem("room", JSON.stringify(room));
    } else {
      localStorage.removeItem("room");
    }
  }, [room]);

  const clearRoom = () => setRoom(null);

  const value = useMemo(
    () => ({
      room,
      setRoom,
      clearRoom,
    }),
    [room]
  );

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}