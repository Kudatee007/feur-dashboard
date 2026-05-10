import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type RideStatus = "en-route" | "waiting" | "assigned" | "completed" | "cancelled" | "disputed";
type HistoryFilter = "all" | "completed" | "cancelled" | "disputed";

interface ActiveRide {
  id: string;
  status: RideStatus;
  statusLabel: string;
  startedAt: string;
  distance: string;
  eta: string;
  fare: number;
  passenger: { name: string; initials: string; color: string; phone: string; vehicle: string; plate: string };
  driver: { name: string; initials: string; color: string; phone: string };
  pickup: string;
  dropoff: string;
  paymentMethod: string;
  platformCommission: number;
  driverPayout: number;
  specialNote?: string;
}

interface RideRecord {
  id: string;
  passenger: string;
  vehicle: string;
  plate: string;
  driver: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  duration: string;
  fare: number;
  payment: string;
  rating: number | null;
  status: "completed" | "cancelled" | "disputed";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ACTIVE_RIDES: ActiveRide[] = [
  {
    id: "RIDE2854", status: "en-route", statusLabel: "En Route to Pickup",
    startedAt: "10:45 AM", distance: "8.4 km", eta: "12 mins", fare: 28.50,
    passenger: { name: "Sarah Johnson", initials: "SJ", color: "#4F46E5", phone: "+234 802 345 6789", vehicle: "Toyota Camry 2020", plate: "LAG-456-HJ" },
    driver: { name: "Michael Okonkwo", initials: "MO", color: "#059669", phone: "+234 801 234 5678" },
    pickup: "Victoria Island, Lagos", dropoff: "Lekki Phase 1, Lagos",
    paymentMethod: "Card •••• 4242", platformCommission: 9.97, driverPayout: 18.53,
    specialNote: "Please arrive 5 minutes early",
  },
  {
    id: "RIDE2855", status: "waiting", statusLabel: "Waiting for Driver",
    startedAt: "10:45 AM", distance: "6.2 km", eta: "5 mins", fare: 15.20,
    passenger: { name: "Amara Nwankwo", initials: "AN", color: "#DC2626", phone: "+234 802 345 6789", vehicle: "Honda Accord 2019", plate: "ABJ-892-KL" },
    driver: { name: "David Mensah", initials: "DM", color: "#7C3AED", phone: "+234 801 234 5678" },
    pickup: "Osu, Accra", dropoff: "Airport Residential, Accra",
    paymentMethod: "Card •••• 4242", platformCommission: 5.32, driverPayout: 9.88,
    specialNote: "Please arrive 5 minutes early",
  },
  {
    id: "RIDE2856", status: "assigned", statusLabel: "Driver Assigned",
    startedAt: "10:45 AM", distance: "4.1 km", eta: "3 mins", fare: 12.80,
    passenger: { name: "John Akpan", initials: "JA", color: "#B45309", phone: "+234 802 345 6789", vehicle: "Mercedes C-Class 2019", plate: "PHC-234-MN" },
    driver: { name: "Chioma Eze", initials: "CE", color: "#0891B2", phone: "+234 801 234 5678" },
    pickup: "GRA, Port Harcourt", dropoff: "Trans Amadi, Port Harcourt",
    paymentMethod: "Card •••• 4242", platformCommission: 4.48, driverPayout: 8.32,
    specialNote: "Please arrive 5 minutes early",
  },
  {
    id: "RIDE2857", status: "en-route", statusLabel: "En Route to Pickup",
    startedAt: "11:00 AM", distance: "5.3 km", eta: "8 mins", fare: 22.40,
    passenger: { name: "Grace Osei", initials: "GO", color: "#BE185D", phone: "+233 24 123 4567", vehicle: "Toyota Corolla 2021", plate: "GH-567-23" },
    driver: { name: "Kofi Asante", initials: "KA", color: "#065F46", phone: "+233 24 987 6543" },
    pickup: "East Legon, Accra", dropoff: "Tema Community 1, Accra",
    paymentMethod: "Card •••• 9999", platformCommission: 7.84, driverPayout: 14.56,
    specialNote: "Please arrive 5 minutes early",
  },
  {
    id: "RIDE2858", status: "waiting", statusLabel: "Waiting for Driver",
    startedAt: "11:10 AM", distance: "3.8 km", eta: "6 mins", fare: 18.60,
    passenger: { name: "Fatima Hassan", initials: "FH", color: "#6D28D9", phone: "+234 806 789 0123", vehicle: "BMW 3 Series 2020", plate: "KN-123-OP" },
    driver: { name: "Ibrahim Yusuf", initials: "IY", color: "#9D174D", phone: "+234 802 345 6789" },
    pickup: "Wuse 2, Abuja", dropoff: "Maitama, Abuja",
    paymentMethod: "Mobile Money", platformCommission: 6.51, driverPayout: 12.09,
  },
];

const RIDE_HISTORY: RideRecord[] = [
  { id: "RIDE2854", passenger: "Sarah Johnson", vehicle: "Toyota Camry 2020", plate: "LAG-456-HJ", driver: "Michael Okonkwo", pickup: "Victoria Island, Lagos", dropoff: "Lekki Phase 1, Lagos", date: "2024-11-19", time: "14:25", duration: "25 mins", fare: 28.50, payment: "Gateway", rating: 5, status: "completed" },
  { id: "RIDE2853", passenger: "Amara Nwankwo", vehicle: "Honda Accord 2019", plate: "ABJ-892-KL", driver: "David Mensah", pickup: "Osu, Accra", dropoff: "Airport Residential, Accra", date: "2024-11-19", time: "13:15", duration: "18 mins", fare: 15.20, payment: "Gateway", rating: 4, status: "completed" },
  { id: "RIDE2852", passenger: "John Akpan", vehicle: "Mercedes C-Class 2019", plate: "PHC-234-MN", driver: "Chioma Eze", pickup: "GRA, Port Harcourt", dropoff: "Trans Amadi, Port Harcourt", date: "2024-11-19", time: "12:45", duration: "N/A", fare: 0, payment: "N/A", rating: null, status: "cancelled" },
  { id: "RIDE2851", passenger: "Grace Osei", vehicle: "Toyota Corolla 2021", plate: "GH-567-23", driver: "Kofi Asante", pickup: "Legon, Accra", dropoff: "Tema Community 1", date: "2024-11-19", time: "11:30", duration: "32 mins", fare: 22.40, payment: "Gateway", rating: 5, status: "completed" },
  { id: "RIDE2850", passenger: "Daniel Opoku", vehicle: "Mazda 3 2018", plate: "GH-234-56", driver: "Emmanuel Banda", pickup: "Northmead, Lusaka", dropoff: "Cairo Road, Lusaka", date: "2024-11-19", time: "10:15", duration: "15 mins", fare: 8.90, payment: "Gateway", rating: 2, status: "disputed" },
  { id: "RIDE2849", passenger: "Fatima Hassan", vehicle: "BMW 3 Series 2020", plate: "KN-123-OP", driver: "Ibrahim Yusuf", pickup: "Wuse 2, Abuja", dropoff: "Maitama, Abuja", date: "2024-11-18", time: "18:20", duration: "12 mins", fare: 16.30, payment: "Gateway", rating: 4, status: "completed" },
  { id: "RIDE2848", passenger: "Blessing Adeyemi", vehicle: "Hyundai Elantra 2017", plate: "IB-678-QR", driver: "Tunde Bakare", pickup: "Bodija, Ibadan", dropoff: "Challenge, Ibadan", date: "2024-11-18", time: "16:45", duration: "20 mins", fare: 18.90, payment: "Gateway", rating: 5, status: "completed" },
  { id: "RIDE2847", passenger: "Peter Mwale", vehicle: "Nissan Altima 2018", plate: "ZM-789-45", driver: "Emmanuel Banda", pickup: "Asokwa, Kumasi", dropoff: "Adum, Kumasi", date: "2024-11-18", time: "15:10", duration: "28 mins", fare: 24.50, payment: "Gateway", rating: 4, status: "completed" },
  { id: "RIDE2846", passenger: "Ngozi Okafor", vehicle: "Kia Sportage 2022", plate: "EN-456-78", driver: "Chukwuemeka Nwosu", pickup: "GRA, Enugu", dropoff: "New Haven, Enugu", date: "2024-11-18", time: "14:00", duration: "22 mins", fare: 19.80, payment: "Card", rating: 5, status: "completed" },
  { id: "RIDE2845", passenger: "Kweku Asare", vehicle: "Ford Focus 2019", plate: "GH-901-23", driver: "Ama Boateng", pickup: "Cape Coast", dropoff: "Elmina", date: "2024-11-17", time: "09:30", duration: "N/A", fare: 0, payment: "N/A", rating: null, status: "cancelled" },
  { id: "RIDE2844", passenger: "Aisha Kamara", vehicle: "Toyota RAV4 2021", plate: "SL-012-CD", driver: "Mohamed Sesay", pickup: "Lumley, Freetown", dropoff: "Hill Station, Freetown", date: "2024-11-17", time: "11:00", duration: "35 mins", fare: 33.00, payment: "Gateway", rating: 5, status: "completed" },
  { id: "RIDE2843", passenger: "Moussa Diallo", vehicle: "Peugeot 508 2020", plate: "SN-789-AB", driver: "Ibrahima Ndiaye", pickup: "Plateau, Dakar", dropoff: "Almadies, Dakar", date: "2024-11-17", time: "08:45", duration: "14 mins", fare: 11.00, payment: "Mobile Money", rating: 3, status: "disputed" },
];

const STATUS_STYLES: Record<RideStatus, string> = {
  "en-route": "bg-teal-50 text-teal-700 border border-teal-200",
  "waiting": "bg-amber-50 text-amber-700 border border-amber-200",
  "assigned": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "completed": "bg-blue-50 text-blue-700",
  "cancelled": "bg-gray-100 text-gray-500",
  "disputed": "bg-red-50 text-red-600",
};

const HIST_STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-500",
  disputed: "bg-red-50 text-red-600",
};

const PAGE_SIZE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtFare(n: number) { return `₦${n.toFixed(2)}`; }

function InitialAvatar({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return <div className={`${sz} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`} style={{ backgroundColor: color }}>{initials}</div>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// ─── Ride Detail Modal ────────────────────────────────────────────────────────

function RideDetailModal({ ride, onClose }: { ride: ActiveRide; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-base">Ride Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Complete information for Ride {ride.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Ride ID + fare */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <div>
              <p className="font-bold text-gray-900">{ride.id}</p>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_STYLES[ride.status]}`}>{ride.statusLabel}</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">{fmtFare(ride.fare)}</p>
              <p className="text-xs text-gray-400">Estimated Fare</p>
            </div>
          </div>

          {/* Ride meta */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Start Time", value: ride.startedAt, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
              { label: "Distance", value: ride.distance, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
              { label: "ETA", value: ride.eta, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            ].map((m) => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="flex justify-center text-gray-400 mb-1">{m.icon}</div>
                <p className="text-xs text-gray-400">{m.label}</p>
                <p className="font-semibold text-gray-900 text-sm">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Passenger */}
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Passenger Information
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Name</p><p className="font-medium text-gray-900">{ride.passenger.name}</p></div>
              <div><p className="text-xs text-gray-400">Phone</p><p className="font-medium text-gray-900 flex items-center gap-1">{ride.passenger.phone} <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></p></div>
              <div><p className="text-xs text-gray-400">Vehicle</p><p className="font-medium text-gray-900">{ride.passenger.vehicle}</p></div>
              <div><p className="text-xs text-gray-400">Plate Number</p><p className="font-medium text-gray-900">{ride.passenger.plate}</p></div>
            </div>
          </div>

          {/* Driver */}
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM13 16l2-5h3l2 5H13z" /></svg>
              Driver Information
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Name</p><p className="font-medium text-gray-900">{ride.driver.name}</p></div>
              <div><p className="text-xs text-gray-400">Phone</p><p className="font-medium text-gray-900 flex items-center gap-1">{ride.driver.phone} <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></p></div>
            </div>
          </div>

          {/* Route */}
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              Route Information
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Pickup Location</p>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" /><p className="font-medium text-gray-900 text-sm">{ride.pickup}</p></div>
              </div>
              <div className="ml-1.5 w-px h-4 bg-gray-200" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Dropoff Location</p>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" /><p className="font-medium text-gray-900 text-sm">{ride.dropoff}</p></div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Payment Information
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Fare</p><p className="font-bold text-gray-900">{fmtFare(ride.fare)}</p></div>
              <div><p className="text-xs text-gray-400">Payment Method</p><p className="font-medium text-gray-900">{ride.paymentMethod}</p></div>
              <div><p className="text-xs text-gray-400">Platform Commission (35%)</p><p className="font-medium text-gray-900">{fmtFare(ride.platformCommission)}</p></div>
              <div><p className="text-xs text-gray-400">Driver Payout (65%)</p><p className="font-semibold text-emerald-600">{fmtFare(ride.driverPayout)}</p></div>
            </div>
          </div>

          {/* Special note */}
          {ride.specialNote && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div><p className="text-xs font-semibold text-amber-700 mb-0.5">Special Notes</p><p className="text-sm text-amber-600">{ride.specialNote}</p></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            Track on Map
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
            Flag Issue
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Active Rides View ────────────────────────────────────────────────────────

function ActiveRidesView() {
  const [selectedRide, setSelectedRide] = useState<ActiveRide | null>(null);

  const stats = {
    total: 284,
    enRoute: ACTIVE_RIDES.filter((r) => r.status === "en-route").length * 50,
    waiting: ACTIVE_RIDES.filter((r) => r.status === "waiting").length * 50,
    assigned: ACTIVE_RIDES.filter((r) => r.status === "assigned").length * 28,
  };

  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">Active Rides</h2>
        <p className="text-sm text-gray-500">Monitor all ongoing rides in real-time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Active", value: stats.total, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>, bg: "bg-teal-50", color: "text-teal-600" },
          { label: "En Route", value: 100, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" /></svg>, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Waiting", value: 100, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Assigned", value: 84, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>, bg: "bg-emerald-50", color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div><p className="text-xs text-gray-400">{s.label}</p><p className="text-2xl font-bold text-gray-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Ride cards */}
      <div className="space-y-4">
        {ACTIVE_RIDES.map((ride) => (
          <div key={ride.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">{ride.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[ride.status]}`}>{ride.statusLabel}</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-lg">{fmtFare(ride.fare)}</p>
                <p className="text-xs text-gray-400">Est. Fare</p>
              </div>
            </div>

            <div className="px-5 pb-4">
              {/* Meta chips */}
              <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Started at {ride.startedAt}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  {ride.distance}
                </span>
              </div>

              {/* Passenger + Driver */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <InitialAvatar initials={ride.passenger.initials} color={ride.passenger.color} />
                  <div><p className="text-xs text-gray-400">Passenger</p><p className="font-semibold text-gray-900 text-sm">{ride.passenger.name}</p><p className="text-xs text-gray-400">Vehicle: {ride.passenger.vehicle}</p><p className="text-xs text-gray-400">Plate: {ride.passenger.plate}</p></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <InitialAvatar initials={ride.driver.initials} color={ride.driver.color} />
                  <div><p className="text-xs text-gray-400">Driver</p><p className="font-semibold text-gray-900 text-sm">{ride.driver.name}</p></div>
                </div>
              </div>

              {/* Route */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" /><div><p className="text-xs text-gray-400">Pickup</p><p className="text-sm font-medium text-gray-900">{ride.pickup}</p></div></div>
                <div className="ml-1 w-px h-3 bg-gray-300" />
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" /><div><p className="text-xs text-gray-400">Dropoff</p><p className="text-sm font-medium text-gray-900">{ride.dropoff}</p></div></div>
              </div>

              {/* ETA */}
              <div className="text-center mb-4 py-2 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">ETA</p>
                <p className="text-2xl font-bold text-gray-900">{ride.eta}</p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  Track on Map
                </button>
                <button onClick={() => setSelectedRide(ride)} className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                  View Details
                </button>
                <button className="w-full py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                  Flag Issue
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRide && <RideDetailModal ride={selectedRide} onClose={() => setSelectedRide(null)} />}
    </>
  );
}

// ─── Ride History View ────────────────────────────────────────────────────────

function RideHistoryView() {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let data = RIDE_HISTORY;
    if (filter !== "all") data = data.filter((r) => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((r) => r.id.toLowerCase().includes(q) || r.passenger.toLowerCase().includes(q) || r.driver.toLowerCase().includes(q) || r.pickup.toLowerCase().includes(q) || r.dropoff.toLowerCase().includes(q));
    }
    return data;
  }, [filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = {
    total: RIDE_HISTORY.length,
    completed: RIDE_HISTORY.filter((r) => r.status === "completed").length,
    cancelled: RIDE_HISTORY.filter((r) => r.status === "cancelled").length,
    revenue: RIDE_HISTORY.filter((r) => r.status === "completed").reduce((s, r) => s + r.fare, 0),
  };

  return (
    <>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">Ride History</h2>
        <p className="text-sm text-gray-500">Complete historical records of all rides</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Rides", value: stats.total },
          { label: "Completed", value: stats.completed },
          { label: "Cancelled", value: stats.cancelled },
          { label: "Total Revenue", value: `₦${stats.revenue.toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700 flex-shrink-0">All Ride Records</p>
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search rides..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder:text-gray-400" />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0">
            {(["all", "completed", "cancelled"] as const).map((f) => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{f}</button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export
          </button>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Ride ID", "Passenger", "Vehicle (Plate)", "Driver", "Route", "Date & Time", "Duration", "Fare", "Payment", "Rating", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0
                ? <tr><td colSpan={11} className="px-4 py-12 text-center text-gray-400 text-sm">No rides found</td></tr>
                : paginated.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-medium">{r.id}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">{r.passenger}</td>
                    <td className="px-4 py-3.5"><p className="text-gray-700 whitespace-nowrap">{r.vehicle}</p><p className="text-xs text-gray-400">{r.plate}</p></td>
                    <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{r.driver}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        {r.pickup}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        {r.dropoff}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap"><p className="text-gray-700">{r.date}</p><p className="text-xs text-gray-400">{r.time}</p></td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{r.duration}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">{r.fare > 0 ? fmtFare(r.fare) : "₦0.00"}</td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{r.payment}</td>
                    <td className="px-4 py-3.5">
                      {r.rating !== null
                        ? <span className="flex items-center gap-1 text-gray-700 text-xs font-medium">{r.rating} <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></span>
                        : <span className="text-gray-300 text-xs">–</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${HIST_STATUS_STYLES[r.status]}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {paginated.length === 0
            ? <div className="px-4 py-12 text-center text-gray-400 text-sm">No rides found</div>
            : paginated.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-mono font-semibold text-gray-900 text-sm">{r.id}</p>
                    <p className="text-xs text-gray-400">{r.date} at {r.time}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${HIST_STATUS_STYLES[r.status]}`}>{r.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Passenger</p><p className="font-medium text-gray-900 text-sm">{r.passenger}</p></div>
                  <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Driver</p><p className="font-medium text-gray-900 text-sm">{r.driver}</p></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 mb-2 text-xs">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-gray-600">{r.pickup}</span></div>
                  <div className="flex items-center gap-1.5 mt-1"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-gray-600">{r.dropoff}</span></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-900">{r.fare > 0 ? fmtFare(r.fare) : "₦0.00"}</span>
                  {r.rating !== null ? <StarRating rating={r.rating} /> : <span className="text-gray-300 text-xs">No rating</span>}
                  <span className="text-xs text-gray-400">{r.duration}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} rides</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, n, idx, arr) => { if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…"); acc.push(n); return acc; }, [])
              .map((n, i) => n === "…"
                ? <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
                : <button key={n} onClick={() => setPage(n as number)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${safePage === n ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{n}</button>
              )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page 
type MainTab = "active" | "history";

export default function Rides() {
  const [tab, setTab] = useState<MainTab>("active");

  return (
    <div className="bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Rides Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor active rides and view ride history</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {([{ key: "active", label: "Active Rides" }, { key: "history", label: "Ride History" }] as const).map((t) => (
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