// // src/lib/socket.ts

// import { io, Socket } from "socket.io-client";
// import { useAuthStore } from "../features/auth/store/auth.store";

// let socket: Socket | null = null;

// export function getSocket(): Socket {
//   if (!socket) {
//     const token = useAuthStore.getState().token;
//     socket = io(
//       import.meta.env.VITE_API_BASE_URL,
//       {
//         auth: { token },
//         transports: ["websocket"],
//         autoConnect: false,
//       }
//     );
//   }
//   return socket;
// }

// src/lib/socket.ts

// export function getSocket(): Socket {
//   if (!socket) {
//     const token = useAuthStore.getState().token;
//     socket = io(import.meta.env.VITE_API_BASE_URL, {
//       auth: { token },
//       // Try websocket, fall back to long-polling if WS is blocked
//       transports: ["websocket", "polling"],
//       autoConnect: false,
//       reconnectionAttempts: 3,
//       reconnectionDelay: 2000,
//       timeout: 10000,
//     });

//     socket.on("connect_error", (err) => {
//       console.warn("[Socket] Connection failed, polling fallback active:", err.message);
//     });

//     socket.on("connect", () => {
//       console.log("[Socket] Live connection established");
//     });
//   }
//   return socket;
// }

// export function getSocket(): Socket {
//   const token = useAuthStore.getState().token;

//   if (!socket) {
//     socket = io(import.meta.env.VITE_API_BASE_URL, {
//       autoConnect: false,
//       transports: ["polling", "websocket"],
//     });
//   }

//   socket.auth = { token };

//   return socket;
// }

import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../features/auth/store/auth.store";

let socket: Socket | null = null;

export function getSocket(): Socket {
  const token = useAuthStore.getState().token;

  if (!socket) {
    socket = io(import.meta.env.VITE_API_BASE_URL, {
      autoConnect: false,
      transports: ["polling", "websocket"],
    });
  }

  socket.auth = { token };
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://feur-backend-q4jq.onrender.com";