// src/features/rides/hooks/useRideTracking.ts

import { useState, useEffect, useRef, useCallback } from "react";
import { getSocket } from "../../../lib/socket";
import { aerialService } from "../../aerial/services/aerial.service";

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
  enabled,
}: {
  driverName: string | null;
  enabled: boolean;
}) {
  const [location, setLocation] = useState<LiveDriverLocation | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const joinedRef = useRef(false);

  const fetchAndMatch = useCallback(async () => {
    if (!driverName) return;
    try {
      const res = await aerialService.getAerialView({ status: "on_ride" });
      const body = res.data as any;
      const payload = body?.data?.data ?? body?.data ?? body;
      const drivers: any[] = payload?.drivers ?? [];

      const match = drivers.find(
        (d) => d.name.toLowerCase() === driverName.toLowerCase()
      );

      if (match) {
        setLocation({
          driverId: match.driverId,
          name: match.name,
          lat: match.location.coordinates.lat,
          lng: match.location.coordinates.lng,
          address: match.location.address,
          lastSeen: match.lastSeen,
          status: match.status,
        });
        setError(null);
      } else {
        setError("Driver not found in live feed");
      }
    } catch {
      setError("Unable to fetch live location");
    }
  }, [driverName]);

  useEffect(() => {
    if (!enabled || !driverName) return;

    // Initial fetch immediately
    fetchAndMatch();

    // Poll every 10s as fallback
    pollRef.current = setInterval(fetchAndMatch, 10000);

    // Socket for real-time push
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    function onConnect() {
      setIsLive(true);
      if (!joinedRef.current) {
        socket.emit("admin:join_aerial");
        joinedRef.current = true;
      }
    }

    function onDisconnect() {
      setIsLive(false);
    }

    function onLocationUpdated(data: any) {
      if (!data || !driverName) return;
      if ((data.name ?? "").toLowerCase() !== driverName.toLowerCase()) return;
      setLocation((prev) => ({
        driverId: data.driverId ?? prev?.driverId ?? "",
        name: data.name ?? prev?.name ?? "",
        lat: data.location?.coordinates?.lat ?? prev?.lat ?? 0,
        lng: data.location?.coordinates?.lng ?? prev?.lng ?? 0,
        address: data.location?.address ?? prev?.address ?? "",
        lastSeen: data.lastSeen ?? new Date().toISOString(),
        status: data.status ?? prev?.status ?? "on_ride",
      }));
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("admin:driver_location_updated", onLocationUpdated);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("admin:driver_location_updated", onLocationUpdated);
      if (joinedRef.current) {
        socket.emit("admin:leave_aerial");
        joinedRef.current = false;
      }
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [enabled, driverName, fetchAndMatch]);

  return { location, isLive, error };
}