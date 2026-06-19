// src/features/aerial/pages/AerialView.tsx

import { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAerialView } from "../../../features/aerial/hooks/useAerial";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import type {
  AerialDriver,
  AerialDriverStatus,
} from "../../../features/aerial/types/aerial.types";

// ─── Fix default marker icons (Leaflet + Vite) ────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#0d9488",
  "#6366f1",
  "#0891b2",
  "#7c3aed",
  "#dc2626",
  "#059669",
  "#b45309",
  "#9d174d",
];

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AerialDriverStatus,
  {
    label: string;
    color: string;
    bg: string;
    dot: string;
    mapColor: string;
    mapBorder: string;
  }
> = {
  available: {
    label: "Available",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "#10b981",
    mapColor: "#10b981",
    mapBorder: "#059669",
  },
  on_ride: {
    label: "On Ride",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "#f59e0b",
    mapColor: "#f59e0b",
    mapBorder: "#d97706",
  },
  offline: {
    label: "Offline",
    color: "text-gray-500",
    bg: "bg-gray-100 border-gray-200",
    dot: "#9ca3af",
    mapColor: "#9ca3af",
    mapBorder: "#6b7280",
  },
};

// ─── Custom map marker ────────────────────────────────────────────────────────

function createDriverIcon(status: AerialDriverStatus, initials: string) {
  const c = STATUS_CONFIG[status];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="50" viewBox="0 0 44 50">
      <circle cx="22" cy="22" r="20" fill="${c.mapColor}" stroke="${c.mapBorder}" stroke-width="2.5"/>
      <circle cx="22" cy="22" r="18" fill="${c.mapColor}" opacity="0.3"/>
      <text x="22" y="27" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="white">${initials}</text>
      <polygon points="22,44 16,34 28,34" fill="${c.mapColor}" stroke="${c.mapBorder}" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [44, 50],
    iconAnchor: [22, 50],
    popupAnchor: [0, -50],
  });
}

// ─── Popup style injection ────────────────────────────────────────────────────

const POPUP_STYLE = `
  .driver-popup .leaflet-popup-content-wrapper {
    padding: 0; border-radius: 20px; overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18); border: none;
  }
  .driver-popup .leaflet-popup-content { margin: 0; width: auto !important; }
  .driver-popup .leaflet-popup-tip { box-shadow: none; }
`;

function InjectPopupStyle() {
  useEffect(() => {
    if (document.getElementById("driver-popup-style")) return;
    const el = document.createElement("style");
    el.id = "driver-popup-style";
    el.textContent = POPUP_STYLE;
    document.head.appendChild(el);
  }, []);
  return null;
}

// ─── Popup card ───────────────────────────────────────────────────────────────

function DriverPopupCard({ driver }: { driver: AerialDriver }) {
  const cfg = STATUS_CONFIG[driver.status];
  const avatarBg = colorFor(driver.driverId);
  const initials = initialsOf(driver.name);

  function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  return (
    <div
      style={{
        fontFamily: "system-ui,-apple-system,sans-serif",
        width: 264,
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f3f4f6" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: avatarBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            {/* Rating badge */}
            <div
              style={{
                position: "absolute",
                bottom: -4,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 20,
                padding: "1px 7px",
                display: "flex",
                alignItems: "center",
                gap: 3,
                boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>
                {driver.rating}
              </span>
              <svg width="10" height="10" fill="#f59e0b" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.3,
              }}
            >
              {driver.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
              {driver.rides} rides
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px" }}>
        {/* Status badge */}
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background:
                driver.status === "available"
                  ? "#d1fae5"
                  : driver.status === "on_ride"
                    ? "#fef3c7"
                    : "#f3f4f6",
              color:
                driver.status === "available"
                  ? "#065f46"
                  : driver.status === "on_ride"
                    ? "#92400e"
                    : "#4b5563",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: cfg.dot,
                display: "inline-block",
              }}
            />
            {cfg.label}
          </span>
        </div>

        {/* Location */}
        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="#0d9488"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
              {driver.location.address}
            </span>
          </div>

          {/* Last seen */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #f3f4f6",
              paddingTop: 10,
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Last seen</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
              {relativeTime(driver.lastSeen)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Map auto-fit ─────────────────────────────────────────────────────────────

function FitBounds({ drivers }: { drivers: AerialDriver[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || !drivers.length) return;
    const bounds = L.latLngBounds(
      drivers.map((d) => [
        d.location.coordinates.lat,
        d.location.coordinates.lng,
      ]),
    );
    map.fitBounds(bounds, { padding: [40, 40] });
    fitted.current = true;
  }, [drivers]);
  return null;
}

// ─── Driver list item ─────────────────────────────────────────────────────────

function DriverListItem({
  driver,
  selected,
  onClick,
}: {
  driver: AerialDriver;
  selected: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[driver.status];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected ? "bg-teal-50 border-l-2 border-l-teal-500" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: colorFor(driver.driverId) }}
          >
            {initialsOf(driver.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {driver.name}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
              <svg
                className="w-3 h-3 flex-shrink-0"
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
              {driver.location.address}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} flex-shrink-0 ml-2`}
        >
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-1.5 ml-12 text-xs text-gray-400">
        <span>⭐ {driver.rating}</span>
        <span>{driver.rides} rides</span>
      </div>
    </button>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
      <div>
        <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
        <div className="h-6 w-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ─── Filter type ──────────────────────────────────────────────────────────────

type FilterType = "All" | "Available" | "On Ride" | "Offline";

const FILTER_TO_STATUS: Record<FilterType, AerialDriverStatus | ""> = {
  All: "",
  Available: "available",
  "On Ride": "on_ride",
  Offline: "offline",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AerialView() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<AerialDriver | null>(
    null,
  );
  const debouncedSearch = useDebouncedValue(search, 400);
  const mapRef = useRef<L.Map | null>(null);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: FILTER_TO_STATUS[filter] || undefined,
    }),
    [debouncedSearch, filter],
  );

  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } =
    useAerialView(queryParams);

  const kpis = data?.kpis;
  const drivers = data?.drivers ?? [];

  // Clear selected driver if it's no longer in the result set
  useEffect(() => {
    if (!selectedDriver) return;
    const stillExists = drivers.find(
      (d) => d.driverId === selectedDriver.driverId,
    );
    if (!stillExists) setSelectedDriver(null);
    else setSelectedDriver(stillExists); // keep coords updated
  }, [drivers]);

  function flyToDriver(driver: AerialDriver) {
    setSelectedDriver(driver);
    if (mapRef.current) {
      mapRef.current.flyTo(
        [driver.location.coordinates.lat, driver.location.coordinates.lng],
        14,
        { duration: 1 },
      );
    }
  }

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Aerial View</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Real-time driver locations
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {lastUpdated}
              </span>
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${isFetching ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isFetching ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}
              />
              {isFetching ? "Live" : "Idle"}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonStatCard key={i} />
            ))
          ) : isError ? (
            <div className="col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Failed to load aerial data
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs text-[#3894A3] font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            [
              {
                label: "Total Online",
                value: kpis?.totalOnline ?? 0,
                dot: "#3894A3",
                bg: "bg-teal-50",
              },
              {
                label: "Available",
                value: kpis?.available ?? 0,
                dot: "#10b981",
                bg: "bg-emerald-50",
              },
              {
                label: "On Ride",
                value: kpis?.onRide ?? 0,
                dot: "#f59e0b",
                bg: "bg-amber-50",
              },
              {
                label: "Offline",
                value: kpis?.offline ?? 0,
                dot: "#9ca3af",
                bg: "bg-gray-100",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <span
                    className="w-3 h-3 rounded-full block"
                    style={{ backgroundColor: s.dot }}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map */}
        {!isError && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                Live Driver Locations
              </h2>
              <span className="text-xs text-gray-400">
                {drivers.length} driver{drivers.length !== 1 ? "s" : ""} shown
              </span>
            </div>

            <div className="relative" style={{ height: "420px" }}>
              {isLoading ? (
                <div className="h-full bg-gray-100 animate-pulse flex items-center justify-center">
                  <p className="text-sm text-gray-400">Loading map...</p>
                </div>
              ) : (
                <MapContainer
                  center={[6.5244, 3.3792]}
                  zoom={11}
                  style={{ height: "100%", width: "100%" }}
                  ref={mapRef as any}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitBounds drivers={drivers} />
                  <InjectPopupStyle />

                  {drivers.map((driver) => (
                    <Marker
                      key={driver.driverId}
                      position={[
                        driver.location.coordinates.lat,
                        driver.location.coordinates.lng,
                      ]}
                      icon={createDriverIcon(
                        driver.status,
                        initialsOf(driver.name),
                      )}
                      eventHandlers={{ click: () => setSelectedDriver(driver) }}
                    >
                      <Popup
                        minWidth={260}
                        maxWidth={280}
                        className="driver-popup"
                      >
                        <DriverPopupCard driver={driver} />
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2.5 z-[1000]">
                <p className="text-xs font-semibold text-gray-600 mb-1.5">
                  Legend
                </p>
                {[
                  { label: "Available", color: "#10b981" },
                  { label: "On Ride", color: "#f59e0b" },
                  { label: "Offline", color: "#9ca3af" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 mb-1 last:mb-0"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Driver list */}
        {!isError && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3">
                Drivers on Map
              </h2>

              {/* Search */}
              <div className="relative mb-3">
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
                  placeholder="Search drivers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder:text-gray-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter pills */}
              <div className="flex gap-1.5 overflow-x-auto">
                {(
                  ["All", "Available", "On Ride", "Offline"] as FilterType[]
                ).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 animate-pulse flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))
              ) : drivers.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">
                  No drivers found
                </div>
              ) : (
                drivers.map((driver) => (
                  <DriverListItem
                    key={driver.driverId}
                    driver={driver}
                    selected={selectedDriver?.driverId === driver.driverId}
                    onClick={() => flyToDriver(driver)}
                  />
                ))
              )}
            </div>

            {/* Selected driver details panel */}
            {selectedDriver && (
              <div className="border-t border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{
                        backgroundColor: colorFor(selectedDriver.driverId),
                      }}
                    >
                      {initialsOf(selectedDriver.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedDriver.name}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selectedDriver.status].bg} ${STATUS_CONFIG[selectedDriver.status].color}`}
                      >
                        {STATUS_CONFIG[selectedDriver.status].label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDriver(null)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    {
                      label: "Location",
                      value: selectedDriver.location.address,
                    },
                    { label: "Rating", value: `⭐ ${selectedDriver.rating}` },
                    {
                      label: "Total Rides",
                      value: `${selectedDriver.rides} rides`,
                    },
                    {
                      label: "Coordinates",
                      value: `${selectedDriver.location.coordinates.lat.toFixed(4)}, ${selectedDriver.location.coordinates.lng.toFixed(4)}`,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white rounded-xl p-2.5 border border-gray-100"
                    >
                      <p className="text-gray-400 mb-0.5">{item.label}</p>
                      <p className="font-semibold text-gray-900 text-xs">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
