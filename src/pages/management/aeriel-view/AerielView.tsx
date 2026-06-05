import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Fix default marker icons (Leaflet + Vite issue) ─────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Types ────────────────────────────────────────────────────────────────────

type DriverStatus = "available" | "on-ride" | "offline";

interface Driver {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  status: DriverStatus;
  location: string;
  lat: number;
  lng: number;
  rating: number;
  rides: number;
  vehicle: string;
  plate: string;
  phone: string;
  // ride-specific (only when on-ride)
  rideId?: string;
  pickup?: string;
  dropoff?: string;
  eta?: string;
  fare?: string;
  // available-specific
  lastLocation?: string;
  color: string;
}

// ─── Dummy drivers around Lagos ───────────────────────────────────────────────

const DRIVERS: Driver[] = [
  {
    id: "d1",
    name: "Michael Okonkwo",
    initials: "MO",
    color: "#059669",
    avatarBg: "#0d9488",
    status: "on-ride",
    location: "Victoria Island, Lagos",
    lat: 6.4281,
    lng: 3.4219,
    rating: 4.7,
    rides: 500,
    vehicle: "Toyota Camry 2020",
    plate: "LAG-456-HJ",
    phone: "+234 801 234 5678",
    rideId: "RIDE 2854",
    pickup: "Victoria Island, Lagos",
    dropoff: "Lekki Phase 1, Lagos",
    eta: "12mins",
    fare: "₦980",
  },
  {
    id: "d2",
    name: "David Mensah",
    initials: "DM",
    color: "#059669",
    avatarBg: "#6366f1",
    status: "available",
    location: "Lekki Phase 1",
    lat: 6.4698,
    lng: 3.5852,
    rating: 4.9,
    rides: 218,
    vehicle: "Honda Accord 2019",
    plate: "LAG-789-KL",
    phone: "+234 802 345 6789",
    lastLocation: "Lekki Phase 1",
  },
  {
    id: "d3",
    name: "Chioma Eze",
    initials: "CE",
    color: "#059669",
    avatarBg: "#0891b2",
    status: "available",
    location: "Ikeja, Lagos",
    lat: 6.6018,
    lng: 3.3515,
    rating: 4.8,
    rides: 267,
    vehicle: "Toyota Corolla 2021",
    plate: "LAG-123-MN",
    phone: "+234 803 456 7890",
    lastLocation: "Ikeja, Lagos",
  },
  {
    id: "d4",
    name: "Kane Boateng",
    initials: "KB",
    color: "#f59e0b",
    avatarBg: "#7c3aed",
    status: "on-ride",
    location: "Surulere, Lagos",
    lat: 6.5059,
    lng: 3.3596,
    rating: 4.2,
    rides: 89,
    vehicle: "Mazda 3 2018",
    plate: "LAG-234-OP",
    phone: "+234 804 567 8901",
    rideId: "RIDE 2861",
    pickup: "Surulere, Lagos",
    dropoff: "Mushin, Lagos",
    eta: "8mins",
    fare: "₦650",
  },
  {
    id: "d5",
    name: "Emmanuel Banda",
    initials: "EB",
    color: "#6b7280",
    avatarBg: "#dc2626",
    status: "offline",
    location: "Yaba, Lagos",
    lat: 6.5095,
    lng: 3.3711,
    rating: 4.7,
    rides: 500,
    vehicle: "Nissan Altima 2018",
    plate: "LAG-345-QR",
    phone: "+234 805 678 9012",
    lastLocation: "Yaba, Lagos",
  },
  {
    id: "d6",
    name: "Emeka Obi",
    initials: "EO",
    color: "#059669",
    avatarBg: "#059669",
    status: "available",
    location: "Ajah, Lagos",
    lat: 6.4724,
    lng: 3.5674,
    rating: 4.6,
    rides: 189,
    vehicle: "Kia Sportage 2022",
    plate: "LAG-456-ST",
    phone: "+234 806 789 0123",
    lastLocation: "Ajah, Lagos",
  },
  {
    id: "d7",
    name: "Fatima Bello",
    initials: "FB",
    color: "#f59e0b",
    avatarBg: "#b45309",
    status: "on-ride",
    location: "Ikorodu, Lagos",
    lat: 6.6194,
    lng: 3.5061,
    rating: 4.5,
    rides: 201,
    vehicle: "Toyota RAV4 2021",
    plate: "LAG-567-UV",
    phone: "+234 807 890 1234",
    rideId: "RIDE 2858",
    pickup: "Ikorodu Road",
    dropoff: "Maryland, Lagos",
    eta: "19mins",
    fare: "₦1,240",
  },
  {
    id: "d8",
    name: "Grace Okafor",
    initials: "GO",
    color: "#6b7280",
    avatarBg: "#9d174d",
    status: "offline",
    location: "Apapa, Lagos",
    lat: 6.448,
    lng: 3.3591,
    rating: 4.9,
    rides: 512,
    vehicle: "BMW 3 Series 2020",
    plate: "LAG-678-WX",
    phone: "+234 808 901 2345",
    lastLocation: "Apapa, Lagos",
  },
  {
    id: "d9",
    name: "Samuel Addo",
    initials: "SA",
    color: "#059669",
    avatarBg: "#1d4ed8",
    status: "available",
    location: "Maryland, Lagos",
    lat: 6.5661,
    lng: 3.3686,
    rating: 4.5,
    rides: 98,
    vehicle: "Ford Focus 2019",
    plate: "LAG-789-YZ",
    phone: "+234 809 012 3456",
    lastLocation: "Maryland, Lagos",
  },
];

const STATUS_CONFIG: Record<
  DriverStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  available: {
    label: "Available",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "#10b981",
  },
  "on-ride": {
    label: "On Ride",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "#f59e0b",
  },
  offline: {
    label: "Offline",
    color: "text-gray-500",
    bg: "bg-gray-100 border-gray-200",
    dot: "#9ca3af",
  },
};

// ─── Custom marker icons ──────────────────────────────────────────────────────

function createDriverIcon(status: DriverStatus, initials: string) {
  const colors: Record<DriverStatus, { bg: string; border: string }> = {
    available: { bg: "#10b981", border: "#059669" },
    "on-ride": { bg: "#f59e0b", border: "#d97706" },
    offline: { bg: "#9ca3af", border: "#6b7280" },
  };
  const c = colors[status];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="50" viewBox="0 0 44 50">
      <circle cx="22" cy="22" r="20" fill="${c.bg}" stroke="${c.border}" stroke-width="2.5"/>
      <circle cx="22" cy="22" r="18" fill="${c.bg}" opacity="0.3"/>
      <text x="22" y="27" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="white">${initials}</text>
      <polygon points="22,44 16,34 28,34" fill="${c.bg}" stroke="${c.border}" stroke-width="1.5" stroke-linejoin="round"/>
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

// ─── Inject popup CSS (removes Leaflet's default white border/shadow wrapper) ─

const POPUP_STYLE = `
  .driver-popup .leaflet-popup-content-wrapper {
    padding: 0;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    border: none;
  }
  .driver-popup .leaflet-popup-content {
    margin: 0;
    width: auto !important;
  }
  .driver-popup .leaflet-popup-tip-container {
    margin-top: -1px;
  }
  .driver-popup .leaflet-popup-tip {
    box-shadow: none;
  }
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

// ─── Driver Popup Card ────────────────────────────────────────────────────────

function DriverPopupCard({ driver }: { driver: Driver }) {
  const cfg = STATUS_CONFIG[driver.status];

  const statusColors: Record<DriverStatus, string> = {
    available: "#10b981",
    "on-ride": "#f59e0b",
    offline: "#9ca3af",
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
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
          {/* Avatar with rating badge */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: driver.avatarBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {driver.initials}
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
                  : driver.status === "on-ride"
                    ? "#fef3c7"
                    : "#f3f4f6",
              color:
                driver.status === "available"
                  ? "#065f46"
                  : driver.status === "on-ride"
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
                background: statusColors[driver.status],
                display: "inline-block",
              }}
            />
            {cfg.label}
          </span>
        </div>

        {/* On-ride: pickup / dropoff route */}
        {driver.status === "on-ride" && driver.pickup && driver.dropoff ? (
          <>
            <div
              style={{
                borderTop: "1px solid #f3f4f6",
                paddingTop: 12,
                marginBottom: 12,
              }}
            >
              {/* Pickup */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 3,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#10b981",
                      border: "2px solid #10b981",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{ width: 2, height: 16, background: "#d1d5db" }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 10,
                      color: "#9ca3af",
                      lineHeight: 1,
                    }}
                  >
                    Pickup Location
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 13,
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {driver.pickup}
                  </p>
                </div>
              </div>
              {/* Dropoff */}
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#ef4444",
                    border: "2px solid #ef4444",
                    flexShrink: 0,
                    marginTop: 3,
                  }}
                />
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 10,
                      color: "#9ca3af",
                      lineHeight: 1,
                    }}
                  >
                    Dropoff Location
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 13,
                      color: "#111827",
                      fontWeight: 500,
                    }}
                  >
                    {driver.dropoff}
                  </p>
                </div>
              </div>
            </div>

            {/* ETA */}
            <div
              style={{
                borderTop: "1px solid #f3f4f6",
                paddingTop: 12,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 14, color: "#111827" }}>ETA: </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0d9488" }}>
                {driver.eta}
              </span>
            </div>

            {/* Ride ID + Fare */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #f3f4f6",
                paddingTop: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                >
                  {driver.rideId}
                </span>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                  }}
                />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                {driver.fare}
              </span>
            </div>
          </>
        ) : driver.status === "available" ? (
          /* Available: show location */
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
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
              <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                {driver.lastLocation}
              </span>
            </div>
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
              <span style={{ fontSize: 14, color: "#111827" }}>ETA: </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#9ca3af" }}>
                NIL
              </span>
            </div>
          </div>
        ) : (
          /* Offline */
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="#9ca3af"
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
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Last seen location: {driver.lastLocation}
              </span>
            </div>
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
              <span style={{ fontSize: 14, color: "#111827" }}>ETA: </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#9ca3af" }}>
                NIL
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Map auto-fit helper ──────────────────────────────────────────────────────

function FitBounds({ drivers }: { drivers: Driver[] }) {
  const map = useMap();
  useEffect(() => {
    if (!drivers.length) return;
    const bounds = L.latLngBounds(drivers.map((d) => [d.lat, d.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, []);
  return null;
}

// ─── Driver list item ─────────────────────────────────────────────────────────

function DriverListItem({
  driver,
  selected,
  onClick,
}: {
  driver: Driver;
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
            style={{ backgroundColor: STATUS_CONFIG[driver.status].dot }}
          >
            {driver.initials}
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
              {driver.location}
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
        <span className="flex items-center gap-0.5">⭐ {driver.rating}</span>
        <span>{driver.rides} rides</span>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterType = "All" | "Available" | "On Ride" | "Offline";

export default function AerialView() {
  const [drivers, setDrivers] = useState<Driver[]>(DRIVERS);
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isLive, setIsLive] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  // Simulate live position jitter
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setDrivers((prev) =>
        prev.map((d) =>
          d.status !== "offline"
            ? {
                ...d,
                lat: d.lat + (Math.random() - 0.5) * 0.002,
                lng: d.lng + (Math.random() - 0.5) * 0.002,
              }
            : d,
        ),
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isLive]);

  const counts = {
    total: drivers.filter((d) => d.status !== "offline").length,
    available: drivers.filter((d) => d.status === "available").length,
    onRide: drivers.filter((d) => d.status === "on-ride").length,
    offline: drivers.filter((d) => d.status === "offline").length,
  };

  const filtered = drivers.filter((d) => {
    const matchFilter =
      filter === "All" ||
      (filter === "Available" && d.status === "available") ||
      (filter === "On Ride" && d.status === "on-ride") ||
      (filter === "Offline" && d.status === "offline");
    const matchSearch =
      !search.trim() ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const mapDrivers = filter === "All" ? drivers : filtered;

  function flyToDriver(driver: Driver) {
    setSelectedDriver(driver);
    if (mapRef.current) {
      mapRef.current.flyTo([driver.lat, driver.lng], 14, { duration: 1 });
    }
  }

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Aerial View</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time aerial view of all driver locations across Lagos
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            {
              label: "Total Online",
              value: counts.total,
              icon: (
                <svg
                  className="w-5 h-5 text-teal-600"
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
              bg: "bg-teal-50",
            },
            {
              label: "Available",
              value: counts.available,
              icon: (
                <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
              ),
              bg: "bg-emerald-50",
            },
            {
              label: "On Ride",
              value: counts.onRide,
              icon: (
                <svg
                  className="w-5 h-5 text-amber-500"
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
              bg: "bg-amber-50",
            },
            {
              label: "Offline",
              value: counts.offline,
              icon: <span className="w-3 h-3 rounded-full bg-gray-400 block" />,
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
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Live Driver Locations
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLive((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${isLive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}
                />
                {isLive ? "Live" : "Paused"}
              </button>
            </div>
          </div>

          <div className="relative" style={{ height: "420px" }}>
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

              {mapDrivers.map((driver) => (
                <Marker
                  key={driver.id}
                  position={[driver.lat, driver.lng]}
                  icon={createDriverIcon(driver.status, driver.initials)}
                  eventHandlers={{ click: () => setSelectedDriver(driver) }}
                >
                  <Popup minWidth={260} maxWidth={280} className="driver-popup">
                    <DriverPopupCard driver={driver} />
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Legend overlay */}
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

        {/* Driver list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">Drivers on Map</h2>
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
            </div>
            {/* Filters */}
            <div className="flex gap-1.5 overflow-x-auto">
              {(["All", "Available", "On Ride", "Offline"] as FilterType[]).map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {f}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                No drivers found
              </div>
            ) : (
              filtered.map((driver) => (
                <DriverListItem
                  key={driver.id}
                  driver={driver}
                  selected={selectedDriver?.id === driver.id}
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
                      backgroundColor: STATUS_CONFIG[selectedDriver.status].dot,
                    }}
                  >
                    {selectedDriver.initials}
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
                  { label: "Location", value: selectedDriver.location },
                  { label: "Vehicle", value: selectedDriver.vehicle },
                  { label: "Plate", value: selectedDriver.plate },
                  {
                    label: "Rating",
                    value: `⭐ ${selectedDriver.rating} · ${selectedDriver.rides} rides`,
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
      </div>
    </div>
  );
}
