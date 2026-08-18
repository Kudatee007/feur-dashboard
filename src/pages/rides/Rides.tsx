import { useState, useEffect } from "react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {
  useActiveRides,
  useRideHistory,
  useRideDetail,
} from "../../features/rides/hooks/useRides";
import { useRideTracking } from "../../features/rides/hooks/useRideTracking";
import type {
  ActiveRideRow,
  RideHistoryRow,
} from "../../features/rides/types/rides.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtFare(n?: number | null) {
  if (n == null || isNaN(Number(n))) return "₦0.00";
  return `₦${Number(n).toFixed(2)}`;
}

function fmtDuration(mins?: number | null) {
  if (!mins) return "N/A";
  return `${mins} mins`;
}

function fmtDate(iso?: string | null) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-GB");
}

function fmtTime(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fullName(p?: { firstName?: string; lastName?: string } | null) {
  if (!p?.firstName && !p?.lastName) return "—";
  return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function activityText(status: string, driverFirstName: string): string {
  const map: Record<string, string> = {
    pending: `${driverFirstName} has accepted the ride and is heading to pickup.`,
    accepted: `${driverFirstName} has accepted the ride and is heading to pickup.`,
    driver_arrived: `${driverFirstName} has arrived at the pickup location. Passenger not yet on board.`,
    in_progress: `${driverFirstName} is on the way to the destination with the passenger.`,
    ongoing: `${driverFirstName} is on the way to the destination with the passenger.`,
    awaiting_payment: `Ride complete. Awaiting payment confirmation.`,
  };
  return (
    map[status] ??
    `${driverFirstName} is on the way to pick up at the pickup location. Passenger not yet on board.`
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const ACTIVE_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  driver_arrived: "bg-blue-50 text-blue-700 border border-blue-200",
  awaiting_payment: "bg-purple-50 text-purple-700 border border-purple-200",
  in_progress: "bg-teal-50 text-teal-700 border border-teal-200",
  accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  ongoing: "bg-indigo-50 text-indigo-700 border border-indigo-200",
};

const HIST_STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-500",
  disputed: "bg-red-50 text-red-600",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-10" />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700">
        {message ?? "Failed to load data"}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-[#3894A3] font-medium hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Tracking Modal ───────────────────────────────────────────────────────────

interface TrackingModalProps {
  ride: {
    rideId?: string;
    status: string;
    route?: {
      pickup?: string;
      dropoff?: string;
      pickupCoords?: { lat: number; lng: number }; // ← add this
      dropoffCoords?: { lat: number; lng: number };
    } | null;
    fareDetails?: { fare?: number } | null;
    distance?: number;
    startedAt?: string | null;
    estimatedDuration?: number | null;
    driver?: { firstName?: string; lastName?: string } | null;
  };
  onClose: () => void;
}

function TrackingModal({ ride, onClose }: TrackingModalProps) {
  const driverName = ride.driver ? fullName(ride.driver) : null;
  const driverFirst = ride.driver?.firstName ?? "Driver";
  const { location, isLive, error } = useRideTracking({
    driverName,
    enabled: true,
  });
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const hasLocation = !!location;
  const defaultCenter = { lat: 6.5244, lng: 3.3792 };
  const activity = activityText(ride.status, driverFirst);
  const isEnRoute = ["pending", "accepted"].includes(ride.status);

  // Pan map when driver moves
  useEffect(() => {
    if (mapInstance && hasLocation) {
      mapInstance.panTo({ lat: location!.lat, lng: location!.lng });
    }
  }, [location?.lat, location?.lng]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[96vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — same as before */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3894A3] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-base">
                Tracking — Ride {ride.rideId ? ride.rideId.slice(-8) : "—"}
              </h2>
              <p className="text-xs text-gray-400">Live location view</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${ACTIVE_STATUS_STYLES[ride.status] ?? "bg-gray-100 text-gray-500"}`}
            >
              {statusLabel(ride.status)}
            </span>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isLive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`}
              />
              {isLive ? "Live" : "Polling"}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* ── Google Map ─────────────────────────────────────────── */}
          <div
            className="relative lg:flex-1"
            style={{ minHeight: 260, height: 300 }}
          >
            {!hasLocation && !error && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50 gap-3">
                <svg
                  className="w-8 h-8 text-[#3894A3] animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <p className="text-xs text-gray-400">Fetching live location…</p>
              </div>
            )}

            {error && !hasLocation && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50 gap-2">
                <p className="text-xs text-gray-500">{error}</p>
              </div>
            )}

            <Map
              defaultCenter={
                hasLocation
                  ? { lat: location!.lat, lng: location!.lng }
                  : defaultCenter
              }
              defaultZoom={16}
              mapId="ride-tracking-map"
              gestureHandling="greedy"
              style={{ width: "100%", height: "100%" }}
              onIdle={(event) => {
                setMapInstance(event.map);
              }}
            >
              {hasLocation && (
                <>
                  {/* Driver — moves live */}
                  <AdvancedMarker
                    position={{ lat: location!.lat, lng: location!.lng }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: "#3894A3",
                          border: "3px solid #fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* Car icon */}
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 11l1.5-4.5h11L19 11"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="7"
                            rx="1.5"
                            stroke="white"
                            strokeWidth="1.5"
                          />
                          <circle cx="7.5" cy="18" r="1.5" fill="white" />
                          <circle cx="16.5" cy="18" r="1.5" fill="white" />
                        </svg>
                      </div>
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: "6px solid transparent",
                          borderRight: "6px solid transparent",
                          borderTop: "8px solid #3894A3",
                          marginTop: -1,
                        }}
                      />
                      <div
                        style={{
                          background: "white",
                          borderRadius: 4,
                          padding: "1px 5px",
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#374151",
                          marginTop: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {location!.name.split(" ")[0]}
                      </div>
                    </div>
                  </AdvancedMarker>

                  {/* Pickup — fixed */}
                  {ride.route?.pickupCoords && (
                    <AdvancedMarker
                      position={{
                        lat: ride.route.pickupCoords.lat,
                        lng: ride.route.pickupCoords.lng,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#10b981",
                            border: "3px solid #fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <polyline
                              points="20,6 9,17 4,12"
                              stroke="white"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: "7px solid #10b981",
                            marginTop: -1,
                          }}
                        />
                        <div
                          style={{
                            background: "white",
                            borderRadius: 4,
                            padding: "1px 5px",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#065f46",
                            marginTop: 2,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        >
                          Pickup
                        </div>
                      </div>
                    </AdvancedMarker>
                  )}

                  {/* Dropoff — fixed */}
                  {ride.route?.dropoffCoords && (
                    <AdvancedMarker
                      position={{
                        lat: ride.route.dropoffCoords.lat,
                        lng: ride.route.dropoffCoords.lng,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#ef4444",
                            border: "3px solid #fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <line
                              x1="4"
                              y1="22"
                              x2="4"
                              y2="15"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: "7px solid #ef4444",
                            marginTop: -1,
                          }}
                        />
                        <div
                          style={{
                            background: "white",
                            borderRadius: 4,
                            padding: "1px 5px",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#991b1b",
                            marginTop: 2,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        >
                          Dropoff
                        </div>
                      </div>
                    </AdvancedMarker>
                  )}
                </>
              )}
            </Map>

            {/* ETA overlay */}
            {hasLocation && (
              <div className="absolute top-3 left-3 z-[10] bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#3894A3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                    ETA
                  </p>
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    {fmtDuration(ride.estimatedDuration)}
                  </p>
                </div>
              </div>
            )}

            {/* Last updated */}
            {hasLocation && (
              <div className="absolute bottom-3 right-3 z-[10] bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs text-gray-500 border border-gray-100">
                Updated {relativeTime(location!.lastSeen)}
              </div>
            )}
          </div>

          {/* Info panel — unchanged from before */}
          <div className="lg:w-72 flex flex-col overflow-y-auto flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Route
              </p>
              <div className="space-y-1">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div className="w-0.5 h-6 bg-gray-200 mt-1" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Pickup</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {ride.route?.pickup ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] text-gray-400">Dropoff</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {ride.route?.dropoff ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Current Activity
              </p>
              <div
                className={`rounded-xl px-3 py-3 text-sm font-medium ${isEnRoute ? "bg-red-50 text-red-700" : "bg-teal-50 text-teal-700"}`}
              >
                {activity}
              </div>
            </div>

            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Trip Info
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 mb-1">Distance</p>
                  <p className="text-base font-bold text-gray-900">
                    {ride.distance && ride.distance > 0
                      ? `${ride.distance.toFixed(1)} km`
                      : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 mb-1">Est. Fare</p>
                  <p className="text-base font-bold text-gray-900">
                    {fmtFare(ride.fareDetails?.fare)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                  <p className="text-[10px] text-gray-400 mb-1">Started at</p>
                  <p className="text-base font-bold text-gray-900">
                    {fmtTime(ride.startedAt) || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Route Progress
              </p>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-[#3894A3] to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: isEnRoute ? "26%" : "65%" }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center font-medium">
                  {isEnRoute ? "26% to pickup" : "En route to destination"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Driver:{" "}
            <span className="font-semibold text-gray-700">
              {driverName ?? "—"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ride Detail Modal ────────────────────────────────────────────────────────

function RideDetailModal({
  rideId,
  onClose,
}: {
  rideId: string;
  onClose: () => void;
}) {
  const { data: ride, isLoading, isError } = useRideDetail(rideId);
  const [showTracking, setShowTracking] = useState(false);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900 text-base">
                Ride Details
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Complete information for this ride
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {isLoading && (
            <div className="p-10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#3894A3] animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}

          {isError && (
            <div className="p-8">
              <ErrorState message="Failed to load ride details" />
            </div>
          )}

          {ride && (
            <>
              <div className="p-5 space-y-4">
                {/* Ride ID + status + fare */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div>
                    <p className="font-bold text-gray-900 text-sm font-mono">
                      {ride.rideId}
                    </p>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${ACTIVE_STATUS_STYLES[ride.status] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      {statusLabel(ride.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {fmtFare(ride.fareDetails?.fare)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {ride.fareDetails?.type ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Start Time",
                      value: fmtTime(ride.startedAt) || "N/A",
                    },
                    {
                      label: "Distance",
                      value:
                        ride.distance > 0
                          ? `${ride.distance.toFixed(1)} km`
                          : "—",
                    },
                    {
                      label: "ETA",
                      value: fmtDuration(ride.estimatedDuration),
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="bg-gray-50 rounded-xl p-3 text-center"
                    >
                      <p className="text-xs text-gray-400">{m.label}</p>
                      <p className="font-semibold text-gray-900 text-sm mt-0.5">
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Passenger */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Passenger Information
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Name</p>
                      <p className="font-medium text-gray-900">
                        {fullName(ride.passenger)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900">
                        {ride.passenger?.phoneNumber ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Driver */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Driver Information
                  </p>
                  {ride.driver ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Name</p>
                        <p className="font-medium text-gray-900">
                          {fullName(ride.driver)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900">
                          {ride.driver.phoneNumber ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Vehicle</p>
                        <p className="font-medium text-gray-900">
                          {ride.vehicle?.model ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Plate</p>
                        <p className="font-medium text-gray-900">
                          {ride.vehicle?.plateNumber ?? "—"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No driver assigned yet
                    </p>
                  )}
                </div>

                {/* Route */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Route Information
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">
                        Pickup Location
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                        <p className="font-medium text-gray-900 text-sm">
                          {ride.route?.pickup ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="ml-1.5 w-px h-4 bg-gray-200" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">
                        Dropoff Location
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                        <p className="font-medium text-gray-900 text-sm">
                          {ride.route?.dropoff ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Payment Information
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Fare</p>
                      <p className="font-bold text-gray-900">
                        {fmtFare(ride.fareDetails?.fare)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Payment Method</p>
                      <p className="font-medium text-gray-900">
                        {ride.fareDetails?.paymentMethod ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">
                        Platform Commission
                      </p>
                      <p className="font-medium text-gray-900">
                        {fmtFare(ride.fareDetails?.platformCommission)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Driver Payout</p>
                      <p className="font-semibold text-emerald-600">
                        {fmtFare(ride.fareDetails?.driverPayout)}
                      </p>
                    </div>
                  </div>
                </div>

                {ride.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 mb-0.5">
                        Special Notes
                      </p>
                      <p className="text-sm text-amber-600">{ride.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={() => setShowTracking(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  Track on Map
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                    />
                  </svg>
                  Flag Issue
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tracking Modal — rendered on top of RideDetailModal */}
      {showTracking && ride && (
        <TrackingModal ride={ride} onClose={() => setShowTracking(false)} />
      )}
    </>
  );
}

// ─── Active Rides View ────────────────────────────────────────────────────────
// ... (keep your existing ActiveRidesView and RideHistoryView unchanged)
// Only paste from here down if replacing full file

function ActiveRidesView() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const { data, isLoading, isError, refetch } = useActiveRides({
    search: debouncedSearch || undefined,
    page,
    limit: 10,
  });

  const kpis = data?.kpis;
  const rides = data?.table?.rides ?? [];
  const pagination = data?.table?.pagination;

  const KPI_CARDS = kpis
    ? [
        {
          label: "Total Active",
          value: kpis.totalActive,
          bg: "bg-[#3894A3]",
          color: "text-white",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          ),
        },
        {
          label: "Waiting",
          value: kpis.waiting,
          bg: "bg-[#FEF9C2]",
          color: "text-[#D08700]",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ),
        },
        {
          label: "Accepted",
          value: kpis.accepted,
          bg: "bg-[#DCFCE7]",
          color: "text-[#00A63E]",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          label: "En Route",
          value: kpis.inRoute,
          bg: "bg-[#DBEAFE]",
          color: "text-[#155DFC]",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z"
              />
            </svg>
          ),
        },
        {
          label: "Ongoing",
          value: kpis.ongoing,
          bg: "bg-[#EDE9FE]",
          color: "text-[#6D28D9]",
          icon: (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">Active Rides</h2>
        <p className="text-sm text-gray-500">
          Monitor all ongoing rides in real-time
        </p>
      </div>

      {isError ? (
        <ErrorState message="Failed to load active rides" onRetry={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : KPI_CARDS.map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
                  >
                    <div
                      className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{s.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {s.value}
                      </p>
                    </div>
                  </div>
                ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 flex-shrink-0">
                Active Ride Records
              </p>
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by passenger or driver..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3894A3] focus:border-transparent placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl text-xs font-medium text-emerald-700 flex-shrink-0">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </div>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {[
                      "Ride ID",
                      "Passenger",
                      "Driver",
                      "Vehicle (Plate)",
                      "Route",
                      "Distance",
                      "ETA",
                      "Fare",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : rides.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-12 text-center text-gray-400 text-sm"
                      >
                        No active rides found
                      </td>
                    </tr>
                  ) : (
                    rides.map((r: ActiveRideRow) => (
                      <tr
                        key={r._id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-medium">
                          {r._id.slice(-8)}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                          {fullName(r.passenger)}
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                          {fullName(r.driver)}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-gray-700 whitespace-nowrap">
                            {r.vehicle?.model ?? "—"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {r.vehicle?.plateNumber ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                            {r.route?.pickup ?? "—"}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                            {r.route?.dropoff ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                          {r.distance > 0 ? `${r.distance.toFixed(1)} km` : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                          {fmtDuration(r.estimatedDuration)}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                          {r.fare > 0 ? fmtFare(r.fare) : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTIVE_STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-500"}`}
                          >
                            {statusLabel(r.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedRideId(r._id)}
                            className="p-1.5 text-gray-400 hover:text-[#3894A3] hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : rides.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-400 text-sm">
                  No active rides found
                </div>
              ) : (
                rides.map((r: ActiveRideRow) => (
                  <div key={r._id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono font-semibold text-gray-900 text-sm">
                          {r._id.slice(-8)}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${ACTIVE_STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {statusLabel(r.status)}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900">
                        {r.fare > 0 ? fmtFare(r.fare) : "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Passenger</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {fullName(r.passenger)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Driver</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {fullName(r.driver)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelectedRideId(r._id)}
                        className="text-xs text-[#3894A3] font-medium hover:underline flex items-center gap-1"
                      >
                        View Details
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total} rides
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1,
                  )
                    .filter(
                      (n) =>
                        n === 1 ||
                        n === pagination.totalPages ||
                        Math.abs(n - page) <= 1,
                    )
                    .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                      if (idx > 0 && n - (arr[idx - 1] as number) > 1)
                        acc.push("…");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === "…" ? (
                        <span
                          key={`e${i}`}
                          className="px-1 text-gray-400 text-sm"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(n as number)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === n ? "bg-[#3894A3] text-white" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                          {n}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {selectedRideId && (
        <RideDetailModal
          rideId={selectedRideId}
          onClose={() => setSelectedRideId(null)}
        />
      )}
    </>
  );
}

// ─── Ride History View (unchanged from your existing code) ────────────────────

function RideHistoryView() {
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const { data, isLoading, isError, refetch } = useRideHistory({
    status: filter,
    search: debouncedSearch || undefined,
    page,
    limit: 10,
  });
  const kpis = data?.kpis;
  const rides = data?.table?.rides ?? [];
  const pagination = data?.table?.pagination;

  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">Ride History</h2>
        <p className="text-sm text-gray-500">
          Complete historical records of all rides
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : kpis
            ? [
                { label: "Total Rides", value: kpis.totalRides },
                { label: "Completed", value: kpis.completed },
                { label: "Cancelled", value: kpis.cancelled },
                { label: "Total Revenue", value: fmtFare(kpis.totalRevenue) },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                >
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {s.value}
                  </p>
                </div>
              ))
            : null}
      </div>

      {isError ? (
        <ErrorState message="Failed to load ride history" onRetry={refetch} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700 flex-shrink-0">
              All Ride Records
            </p>
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search rides..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3894A3] focus:border-transparent placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-[7px] p-1 shrink-0">
              {(["all", "completed", "cancelled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-[#3894A3] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {[
                    "Ride ID",
                    "Passenger",
                    "Driver",
                    "Vehicle (Plate)",
                    "Route",
                    "Date & Time",
                    "Duration",
                    "Fare",
                    "Payment",
                    "Rating",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : rides.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-12 text-center text-gray-400 text-sm"
                    >
                      No rides found
                    </td>
                  </tr>
                ) : (
                  rides.map((r: RideHistoryRow) => (
                    <tr
                      key={r.rideId}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-medium">
                        {r.rideId.slice(-8)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                        {fullName(r.passenger)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                        {fullName(r.driver)}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-gray-700 whitespace-nowrap">
                          {r.vehicle?.model ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {r.vehicle?.plateNumber ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                          {r.route?.pickup ?? "—"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          {r.route?.dropoff ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="text-gray-700">
                          {fmtDate(r.completedAt || r.requestedAt)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {fmtTime(r.completedAt || r.requestedAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                        {fmtDuration(r.actualDuration)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                        {fmtFare(r.fare)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                        {r.paymentType ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        {r.passengerRating !== null ? (
                          <span className="flex items-center gap-1 text-gray-700 text-xs font-medium">
                            {r.passengerRating}
                            <svg
                              className="w-3 h-3 text-amber-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${HIST_STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelectedRideId(r.rideId)}
                          className="p-1.5 text-gray-400 hover:text-[#3894A3] hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : rides.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-400 text-sm">
                No rides found
              </div>
            ) : (
              rides.map((r: RideHistoryRow) => (
                <div key={r.rideId} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-mono font-semibold text-gray-900 text-sm">
                        {r.rideId.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {fmtDate(r.completedAt || r.requestedAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${HIST_STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Passenger</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {fullName(r.passenger)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Driver</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {fullName(r.driver)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-900">
                      {fmtFare(r.fare)}
                    </span>
                    <button
                      onClick={() => setSelectedRideId(r.rideId)}
                      className="text-xs text-[#3894A3] font-medium hover:underline flex items-center gap-1"
                    >
                      View Details
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} rides
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 ||
                      n === pagination.totalPages ||
                      Math.abs(n - page) <= 1,
                  )
                  .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                    if (idx > 0 && n - (arr[idx - 1] as number) > 1)
                      acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span
                        key={`e${i}`}
                        className="px-1 text-gray-400 text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n as number)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === n ? "bg-[#3894A3] text-white" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        {n}
                      </button>
                    ),
                  )}
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedRideId && (
        <RideDetailModal
          rideId={selectedRideId}
          onClose={() => setSelectedRideId(null)}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type MainTab = "active" | "history";

export default function Rides() {
  const [tab, setTab] = useState<MainTab>("active");

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Rides Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor active rides and view ride history
          </p>
        </div>
        <div className="flex gap-2 mb-6">
          {(
            [
              { key: "active", label: "Active Rides" },
              { key: "history", label: "Ride History" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? "bg-white border border-gray-200 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/60"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === "active" ? <ActiveRidesView /> : <RideHistoryView />}
      </div>
    </div>
  );
}
