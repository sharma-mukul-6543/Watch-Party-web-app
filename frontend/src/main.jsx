import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { RoomProvider } from "./context/RoomProvider";

import { socket } from "./socket/socket";

import "./index.css";

// Connect socket once when application starts
if (!socket.connected) {
  socket.connect();
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoomProvider>
        <App />
      </RoomProvider>
    </BrowserRouter>
  </React.StrictMode>
);