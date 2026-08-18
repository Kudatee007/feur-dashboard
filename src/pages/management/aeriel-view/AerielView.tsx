// src/features/aerial/pages/AerialView.tsx

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { useAerialView } from "../../../features/aerial/hooks/useAerial";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import type {
  AerialDriver,
  AerialDriverStatus,
} from "../../../features/aerial/types/aerial.types";

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

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AerialDriverStatus,
  {
    label: string;
    color: string;
    bg: string;
    dot: string;
    pinBg: string;
    pinBorder: string;
  }
> = {
  available: {
    label: "Available",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "#10b981",
    pinBg: "#10b981",
    pinBorder: "#059669",
  },
  on_ride: {
    label: "On Ride",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "#f59e0b",
    pinBg: "#f59e0b",
    pinBorder: "#d97706",
  },
  offline: {
    label: "Offline",
    color: "text-gray-500",
    bg: "bg-gray-100 border-gray-200",
    dot: "#9ca3af",
    pinBg: "#9ca3af",
    pinBorder: "#6b7280",
  },
};

// ─── Driver Marker ────────────────────────────────────────────────────────────

function DriverMarker({
  driver,
  isSelected,
  onClick,
}: {
  driver: AerialDriver;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[driver.status];
  const initials = initialsOf(driver.name);

  return (
    <AdvancedMarker
      position={{
        lat: driver.location.coordinates.lat,
        lng: driver.location.coordinates.lng,
      }}
      onClick={onClick}
      zIndex={isSelected ? 100 : 1}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          transform: isSelected ? "scale(1.2)" : "scale(1)",
          transition: "transform 0.2s ease",
        }}
      >
        {/* Circle */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: cfg.pinBg,
            border: `3px solid ${isSelected ? "#fff" : cfg.pinBorder}`,
            boxShadow: isSelected
              ? `0 0 0 3px ${cfg.pinBg}, 0 4px 16px rgba(0,0,0,0.35)`
              : "0 2px 8px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {initials}
        </div>
        {/* Pin tail */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `9px solid ${cfg.pinBg}`,
            marginTop: -1,
          }}
        />
        {/* Name label */}
        <div
          style={{
            background: "white",
            borderRadius: 6,
            padding: "2px 6px",
            fontSize: 10,
            fontWeight: 600,
            color: "#374151",
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            marginTop: 3,
            whiteSpace: "nowrap",
            fontFamily: "system-ui, sans-serif",
            border: `1px solid ${cfg.pinBg}22`,
          }}
        >
          {driver.name.split(" ")[0]}
        </div>
      </div>
    </AdvancedMarker>
  );
}

// ─── FitBounds — fires whenever drivers change ────────────────────────────────

function FitBoundsOnDrivers({ drivers }: { drivers: AerialDriver[] }) {
  const map = useMap();
  const lastCount = useRef(0);

  useEffect(() => {
    // Fit bounds when drivers first load or count changes significantly
    if (!map || !drivers.length) return;
    if (
      lastCount.current > 0 &&
      Math.abs(drivers.length - lastCount.current) < 3
    )
      return;

    lastCount.current = drivers.length;

    const bounds = new google.maps.LatLngBounds();
    drivers.forEach((d) => {
      bounds.extend({
        lat: d.location.coordinates.lat,
        lng: d.location.coordinates.lng,
      });
    });

    // Don't zoom too far in if only 1-2 drivers
    if (drivers.length === 1) {
      map.setCenter({
        lat: drivers[0].location.coordinates.lat,
        lng: drivers[0].location.coordinates.lng,
      });
      map.setZoom(14);
    } else {
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [map, drivers.length]);

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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

  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const debouncedSearch = useDebouncedValue(search, 400);
  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: FILTER_TO_STATUS[filter] || undefined,
    }),
    [debouncedSearch, filter],
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    isLive,
    dataUpdatedAt,
  } = useAerialView(queryParams);

  const kpis = data?.kpis;
  const drivers = data?.drivers ?? [];

  // Keep selected driver coords fresh after each refetch
  useEffect(() => {
    if (!selectedDriver) return;
    const updated = drivers.find((d) => d.driverId === selectedDriver.driverId);
    if (!updated) setSelectedDriver(null);
    else setSelectedDriver(updated);
  }, [drivers]);

  function flyToDriver(driver: AerialDriver) {
    setSelectedDriver(driver);
    if (mapRef) {
      mapRef.panTo({
        lat: driver.location.coordinates.lat,
        lng: driver.location.coordinates.lng,
      });
      mapRef.setZoom(15);
    }
  }

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Aerial View</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Real-time aerial view of all driver locations across Lagos
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {lastUpdated}
              </span>
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${isLive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`}
              />
              {isLive ? "Live" : "Polling"}
            </div>
            {isFetching && !isLoading && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                <svg
                  className="w-3 h-3 animate-spin"
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
                Syncing
              </div>
            )}
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

            <div style={{ height: 480, position: "relative" }}>
              {isLoading ? (
                <div className="h-full bg-gray-100 animate-pulse flex items-center justify-center">
                  <p className="text-sm text-gray-400">Loading map...</p>
                </div>
              ) : (
                <Map
                  // ── Key fix: Lagos center + tight zoom to show road detail ──
                  key="aerial-map"
                  defaultCenter={{ lat: 6.5244, lng: 3.3792 }}
                  defaultZoom={11}
                  mapId={mapId}
                  gestureHandling="greedy"
                  // ── Don't hide roads/labels — keep the map readable ──────────
                  // Remove MAP_STYLES entirely so roads show like the Figma
                  style={{ width: "100%", height: "100%" }}
                  // ── Use onIdle instead of onLoad (correct @vis.gl API) ───────
                  onIdle={(e) => {
                    if (!mapRef) setMapRef(e.map);
                  }}
                >
                  {/* Auto-fit to driver positions when data loads */}
                  <FitBoundsOnDrivers drivers={drivers} />

                  {/* Driver markers */}
                  {drivers.map((driver) => (
                    <DriverMarker
                      key={driver.driverId}
                      driver={driver}
                      isSelected={selectedDriver?.driverId === driver.driverId}
                      onClick={() =>
                        setSelectedDriver((prev) =>
                          prev?.driverId === driver.driverId ? null : driver,
                        )
                      }
                    />
                  ))}

                  {/* InfoWindow on selected driver */}
                  {selectedDriver && (
                    <InfoWindow
                      position={{
                        lat: selectedDriver.location.coordinates.lat,
                        lng: selectedDriver.location.coordinates.lng,
                      }}
                      onCloseClick={() => setSelectedDriver(null)}
                      pixelOffset={[0, -65]}
                    >
                      <div
                        style={{
                          fontFamily: "system-ui",
                          padding: "4px 2px",
                          minWidth: 210,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: colorFor(selectedDriver.driverId),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontSize: 14,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {initialsOf(selectedDriver.name)}
                          </div>
                          <div>
                            <p
                              style={{
                                fontWeight: 700,
                                fontSize: 14,
                                margin: 0,
                                color: "#111827",
                              }}
                            >
                              {selectedDriver.name}
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                color: "#6b7280",
                                margin: "2px 0 0",
                              }}
                            >
                              {selectedDriver.rides} rides · ⭐{" "}
                              {selectedDriver.rating}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            borderTop: "1px solid #f3f4f6",
                            paddingTop: 8,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "3px 10px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              background:
                                selectedDriver.status === "available"
                                  ? "#d1fae5"
                                  : selectedDriver.status === "on_ride"
                                    ? "#fef3c7"
                                    : "#f3f4f6",
                              color:
                                selectedDriver.status === "available"
                                  ? "#065f46"
                                  : selectedDriver.status === "on_ride"
                                    ? "#92400e"
                                    : "#4b5563",
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background:
                                  STATUS_CONFIG[selectedDriver.status].dot,
                                display: "inline-block",
                              }}
                            />
                            {STATUS_CONFIG[selectedDriver.status].label}
                          </span>
                          <p
                            style={{
                              fontSize: 11,
                              color: "#374151",
                              margin: "4px 0 2px",
                            }}
                          >
                            📍 {selectedDriver.location.address}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: "#9ca3af",
                              margin: 0,
                            }}
                          >
                            Updated {relativeTime(selectedDriver.lastSeen)}
                          </p>
                        </div>
                      </div>
                    </InfoWindow>
                  )}

                  {/* Legend overlay — positioned inside map */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 28,
                      left: 16,
                      background: "white",
                      borderRadius: 12,
                      padding: "10px 14px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      zIndex: 10,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#374151",
                        margin: "0 0 6px",
                      }}
                    >
                      Legend
                    </p>
                    {[
                      { label: "Available", color: "#10b981" },
                      { label: "On Ride", color: "#f59e0b" },
                      { label: "Offline", color: "#9ca3af" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: item.color,
                            flexShrink: 0,
                            display: "inline-block",
                          }}
                        />
                        <span style={{ fontSize: 11, color: "#4b5563" }}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </Map>
              )}
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

            {/* Selected driver detail panel */}
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
                      label: "Last Seen",
                      value: relativeTime(selectedDriver.lastSeen),
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
