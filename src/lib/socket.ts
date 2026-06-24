// src/lib/socket.ts

import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../features/auth/store/auth.store";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = useAuthStore.getState().token;
    socket = io(
      import.meta.env.VITE_API_BASE_URL ?? "https://feur-backend-q4jq.onrender.com",
      {
        auth: { token },
        transports: ["websocket"],
        autoConnect: false,
      }
    );
  }
  return socket;
}