// src/features/aerial/hooks/useAerial.ts

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../../../features/auth/store/auth.store";
import { SOCKET_URL } from "../../../lib/socket";
import type {
  AerialDashboard,
  AerialDriver,
  AerialKpis,
  AerialQueryParams,
} from "../types/aerial.types";

// ─── Recalculate KPIs client-side after each socket patch ────────────────────

function recalcKpis(drivers: AerialDriver[]): AerialKpis {
  return {
    totalOnline: drivers.filter((d) => d.status !== "offline").length,
    available: drivers.filter((d) => d.status === "available").length,
    onRide: drivers.filter((d) => d.status === "on_ride").length,
    offline: drivers.filter((d) => d.status === "offline").length,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAerialView(params: AerialQueryParams = {}) {
  const token = useAuthStore.getState().token;

  const [drivers, setDrivers] = useState<AerialDriver[]>([]);
  const [kpis, setKpis] = useState<AerialKpis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [dataUpdatedAt, setDataUpdatedAt] = useState<number | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  // ── Build query string from params ─────────────────────────────────────────
  function buildUrl() {
    const base = `${SOCKET_URL}/api/v1/admins/dashboard/aerial`;
    const qs = new URLSearchParams();
    if (paramsRef.current.search) qs.set("search", paramsRef.current.search);
    if (
      paramsRef.current.status &&
      paramsRef.current.status !== "offline" // offline drivers won't have GPS anyway
    ) {
      qs.set("status", paramsRef.current.status);
    }

    return qs.toString() ? `${base}?${qs}` : base;
  }

  // ── REST snapshot — exactly as in backend guide ────────────────────────────
  const fetchSnapshot = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) setIsFetching(true);

      try {
        // Use fetch directly so we don't go through the axios singleton
        const res = await fetch(buildUrl(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        // Backend guide shows: response.data.data.data.drivers
        // But our axios wrapper adds one level, so raw fetch gives:
        // json.data.drivers  OR  json.data.data.drivers
        const payload =
          json?.data?.data?.drivers != null
            ? json.data.data
            : json?.data?.drivers != null
              ? json.data
              : json?.drivers != null
                ? json
                : null;

        if (!payload) throw new Error("Unexpected aerial shape");

        const incomingDrivers: AerialDriver[] = payload.drivers ?? [];

        setDrivers(incomingDrivers);
        setKpis(payload.kpis ?? recalcKpis(incomingDrivers));
        setIsError(false);
        setDataUpdatedAt(Date.now());
      } catch (err) {
        console.error("[Aerial] REST snapshot failed:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    [token],
  );

  // ── Socket setup — follows backend guide exactly ───────────────────────────
  useEffect(() => {
    if (!token) return;

    // 1. Initial snapshot first (backend guide step 1)
    fetchSnapshot();

    // 2. Polling fallback every 15s while socket may be unreliable
    pollRef.current = setInterval(() => fetchSnapshot(true), 15000);

    // 3. Connect socket (backend guide step 2)
    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      // Backend guide specifies this exact order
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Aerial Socket] Connected. Joining aerial room...");
      setIsLive(true);
      // Backend guide step 3: emit join after connect
      socket.emit("admin:join_aerial");
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Aerial Socket] Disconnected:", reason);
      setIsLive(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Aerial Socket] Connection error:", err.message);
      setIsLive(false);
    });

    // 4. Listen for location updates (backend guide step 3)
    socket.on(
      "admin:driver_location_updated",
      (data: {
        driverId: string;
        userId?: string;
        location: { lat: number; lng: number };
        status?: "available" | "on_ride" | "offline";
      }) => {
        setDrivers((prev) => {
          // Backend guide: match by driverId OR userId
          const updated = prev.map((driver) => {
            const matchesId =
              driver.driverId === data.driverId ||
              (driver as any).userId === data.userId;

            if (!matchesId) return driver;

            return {
              ...driver,
              status: data.status ?? driver.status,
              location: {
                ...driver.location,
                coordinates: data.location, // { lat, lng } directly from socket
              },
              lastSeen: new Date().toISOString(),
            };
          });

          // Recalculate KPIs after patch
          setKpis(recalcKpis(updated));
          setDataUpdatedAt(Date.now());
          return updated;
        });
      },
    );

    // 5. Cleanup — backend guide: emit leave then disconnect
    return () => {
      console.log("[Aerial Socket] Leaving aerial room and disconnecting...");
      socket.emit("admin:leave_aerial");
      socket.disconnect();
      socketRef.current = null;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token]); // re-run only if token changes

  // ── Re-fetch when search/status filter changes ─────────────────────────────
  useEffect(() => {
    if (isLoading) return; // skip during initial load
    fetchSnapshot(true);
  }, [params.search, params.status]);

  // ── Computed data shape for the page ──────────────────────────────────────
  const data: AerialDashboard | null =
    kpis && drivers ? { kpis, drivers } : null;

  return {
    data,
    isLoading,
    isError,
    isFetching,
    isLive,
    dataUpdatedAt,
    refetch: () => fetchSnapshot(),
  };
}
