// src/features/rides/hooks/useRideTracking.ts

import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../../../features/auth/store/auth.store";
import { SOCKET_URL } from "../../../lib/socket";

export interface LiveDriverLocation {
  driverId: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  lastSeen: string;
  status: string;
}

export function useRideTracking({
  driverName,
  tripId,
  enabled,
}: {
  driverName: string | null;
  tripId?: string | null;      // if you have tripId, socket gives more precise updates
  enabled: boolean;
}) {
  const token = useAuthStore.getState().token;

  const [location, setLocation]   = useState<LiveDriverLocation | null>(null);
  const [isLive, setIsLive]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // ── REST fallback: fetch aerial and match by driverName ───────────────────
 const fetchAndMatch = useCallback(async () => {
  if (!driverName || !token) return;

  try {
    // ── KEY FIX ──────────────────────────────────────────────────────────────
    // Don't filter by status=on_ride — if the driver hasn't started the trip
    // yet they'll be "available" and get excluded. Fetch all, match by name.
    const res = await fetch(
      `${SOCKET_URL}/api/v1/admins/dashboard/aerial`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const payload =
      json?.data?.data?.drivers != null ? json.data.data
      : json?.data?.drivers     != null ? json.data
      : json;

    const allDrivers: any[] = payload?.drivers ?? [];

    const match = allDrivers.find(
      (d) => d.name?.toLowerCase() === driverName.toLowerCase()
    );

    if (match) {
      setLocation({
        driverId: match.driverId,
        name:     match.name,
        lat:      match.location.coordinates.lat,
        lng:      match.location.coordinates.lng,
        address:  match.location.address,
        lastSeen: match.lastSeen,
        status:   match.status,
      });
      setError(null);
    } else {
      setError("Driver location not available");
    }
  } catch {
    setError("Unable to fetch live location");
  }
}, [driverName, token]);

  useEffect(() => {
    if (!enabled || !driverName || !token) return;

    // 1. Immediate REST fetch
    fetchAndMatch();

    // 2. Polling every 10s as fallback
    pollRef.current = setInterval(fetchAndMatch, 10000);

    // 3. Socket connection
    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsLive(true);

      // If we have a tripId, use the passenger trip room for more precise updates
      if (tripId) {
        socket.emit("join_room", `trip:${tripId}`);
      } else {
        // Fall back to aerial room
        socket.emit("admin:join_aerial");
      }
    });

    socket.on("disconnect", () => setIsLive(false));
    socket.on("connect_error", () => setIsLive(false));

    // Listen for aerial driver updates (matches by driverName)
    socket.on("admin:driver_location_updated", (data: {
      driverId: string;
      userId?: string;
      location: { lat: number; lng: number };
      status?: string;
    }) => {
      setLocation((prev) => {
        if (!prev || prev.driverId !== data.driverId) return prev;
        return {
          ...prev,
          lat:      data.location.lat,
          lng:      data.location.lng,
          status:   data.status ?? prev.status,
          lastSeen: new Date().toISOString(),
        };
      });
    });

    // Listen for trip-specific updates (more precise, from passenger guide)
    socket.on("driver:location:updated", (data: {
      driverId: string;
      tripId: string;
      location: { lat: number; lng: number };
      timestamp: string;
    }) => {
      setLocation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lat:      data.location.lat,
          lng:      data.location.lng,
          lastSeen: data.timestamp ?? new Date().toISOString(),
        };
      });
    });

    return () => {
      socket.emit("admin:leave_aerial");
      socket.disconnect();
      socketRef.current = null;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [enabled, driverName, tripId, token, fetchAndMatch]);

  return { location, isLive, error };
}