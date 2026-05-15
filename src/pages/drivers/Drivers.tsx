import { useState, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type DriverStatus = "active" | "inactive" | "approved" | "pending" | "suspended" | "blocked" | "disapproved";

interface Document {
  name: string;
  uploaded: string;
  expires: string;
  verified: boolean;
}

interface Ride {
  id: string;
  passenger: string;
  amount: number;
  date: string;
  rating: number;
}

interface WeeklyEarning {
  week: string;
  rides: number;
  earnings: number;
  commission: number;
}

interface Driver {
  id: string;
  name: string;
  initials: string;
  color: string;
  email: string;
  phone: string;
  location: string;
  status: DriverStatus;
  verified: boolean;
  rides: number;
  rating: number | null;
  earnings: number;
  memberSince: string;
  joinedDate: string;
  verificationStatus: "verified" | "pending" | "unverified";
  documents: Document[];
  recentRides: Ride[];
  weeklyEarnings: WeeklyEarning[];
}

type TabType = "overview" | "recent-rides" | "documents" | "earnings";

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DRIVERS: Driver[] = [
  {
    id: "DRV001", name: "Michael Okonkwo", initials: "MO", color: "#4F46E5",
    email: "michael.o@email.com", phone: "+234 801 234 5678",
    location: "Lagos, Nigeria", status: "approved", verified: true,
    rides: 342, rating: 4.8, earnings: 4280,
    memberSince: "2024-01-15", joinedDate: "2024-01-15",
    verificationStatus: "verified",
    documents: [
      { name: "Driver's License", uploaded: "2024-01-10", expires: "2028-01-10", verified: true },
      { name: "Background Check", uploaded: "2024-01-10", expires: "N/A", verified: true },
      { name: "Insurance Certificate", uploaded: "2024-01-12", expires: "2025-01-12", verified: true },
      { name: "Profile Photo", uploaded: "2024-01-10", expires: "N/A", verified: true },
    ],
    recentRides: [
      { id: "RIDE2850", passenger: "Sarah Johnson", amount: 28.50, date: "2024-11-24", rating: 5 },
      { id: "RIDE2845", passenger: "John Doe", amount: 42.30, date: "2024-11-23", rating: 4 },
      { id: "RIDE2840", passenger: "Jane Smith", amount: 15.80, date: "2024-11-23", rating: 5 },
      { id: "RIDE2835", passenger: "Mike Brown", amount: 35.20, date: "2024-11-22", rating: 5 },
      { id: "RIDE2830", passenger: "Emma Wilson", amount: 22.40, date: "2024-11-22", rating: 4 },
    ],
    weeklyEarnings: [
      { week: "Week 1", rides: 45, earnings: 1280, commission: 448 },
      { week: "Week 2", rides: 52, earnings: 1560, commission: 546 },
      { week: "Week 3", rides: 48, earnings: 1420, commission: 497 },
      { week: "Week 4", rides: 38, earnings: 1020, commission: 357 },
    ],
  },
  {
    id: "DRV002", name: "David Mensah", initials: "DM", color: "#059669",
    email: "david.m@email.com", phone: "+233 20 123 4567",
    location: "Accra, Ghana", status: "approved", verified: true,
    rides: 218, rating: 4.9, earnings: 2940,
    memberSince: "2024-02-10", joinedDate: "2024-02-10",
    verificationStatus: "verified",
    documents: [
      { name: "Driver's License", uploaded: "2024-02-05", expires: "2027-02-05", verified: true },
      { name: "Background Check", uploaded: "2024-02-05", expires: "N/A", verified: true },
      { name: "Insurance Certificate", uploaded: "2024-02-06", expires: "2025-02-06", verified: true },
      { name: "Profile Photo", uploaded: "2024-02-05", expires: "N/A", verified: true },
    ],
    recentRides: [
      { id: "RIDE2849", passenger: "Grace Osei", amount: 55.00, date: "2024-11-23", rating: 5 },
      { id: "RIDE2844", passenger: "Kweku Asare", amount: 30.00, date: "2024-11-22", rating: 5 },
    ],
    weeklyEarnings: [
      { week: "Week 1", rides: 30, earnings: 820, commission: 287 },
      { week: "Week 2", rides: 38, earnings: 1010, commission: 354 },
      { week: "Week 3", rides: 25, earnings: 640, commission: 224 },
      { week: "Week 4", rides: 29, earnings: 470, commission: 165 },
    ],
  },
  {
    id: "DRV003", name: "Emmanuel Banda", initials: "EB", color: "#DC2626",
    email: "emmanuel.b@email.com", phone: "+260 97 123 4567",
    location: "Lusaka, Zambia", status: "approved", verified: true,
    rides: 156, rating: 4.7, earnings: 1820,
    memberSince: "2024-03-01", joinedDate: "2024-03-01",
    verificationStatus: "verified",
    documents: [
      { name: "Driver's License", uploaded: "2024-03-01", expires: "2026-03-01", verified: true },
      { name: "Background Check", uploaded: "2024-03-01", expires: "N/A", verified: true },
      { name: "Insurance Certificate", uploaded: "2024-03-02", expires: "2025-03-02", verified: true },
      { name: "Profile Photo", uploaded: "2024-03-01", expires: "N/A", verified: true },
    ],
    recentRides: [
      { id: "RIDE2848", passenger: "Peter Mwale", amount: 18.00, date: "2024-11-23", rating: 5 },
      { id: "RIDE2843", passenger: "Ngozi Okafor", amount: 24.50, date: "2024-11-22", rating: 4 },
    ],
    weeklyEarnings: [
      { week: "Week 1", rides: 22, earnings: 520, commission: 182 },
      { week: "Week 2", rides: 28, earnings: 680, commission: 238 },
      { week: "Week 3", rides: 19, earnings: 340, commission: 119 },
      { week: "Week 4", rides: 15, earnings: 280, commission: 98 },
    ],
  },
  {
    id: "DRV004", name: "Kofi Asante", initials: "KA", color: "#7C3AED",
    email: "kofi.a@email.com", phone: "+233 24 987 6543",
    location: "Kumasi, Ghana", status: "approved", verified: true,
    rides: 428, rating: 4.9, earnings: 5640,
    memberSince: "2023-11-20", joinedDate: "2023-11-20",
    verificationStatus: "verified",
    documents: [
      { name: "Driver's License", uploaded: "2023-11-15", expires: "2027-11-15", verified: true },
      { name: "Background Check", uploaded: "2023-11-15", expires: "N/A", verified: true },
      { name: "Insurance Certificate", uploaded: "2023-11-16", expires: "2025-11-16", verified: true },
      { name: "Profile Photo", uploaded: "2023-11-15", expires: "N/A", verified: true },
    ],
    recentRides: [
      { id: "RIDE2847", passenger: "Daniel Opoku", amount: 38.00, date: "2024-11-24", rating: 5 },
      { id: "RIDE2842", passenger: "Aisha Kamara", amount: 44.00, date: "2024-11-23", rating: 5 },
    ],
    weeklyEarnings: [
      { week: "Week 1", rides: 60, earnings: 1680, commission: 588 },
      { week: "Week 2", rides: 55, earnings: 1540, commission: 539 },
      { week: "Week 3", rides: 58, earnings: 1620, commission: 567 },
      { week: "Week 4", rides: 50, earnings: 800, commission: 280 },
    ],
  },
  {
    id: "DRV005", name: "Ibrahim Yusuf", initials: "IY", color: "#0891B2",
    email: "ibrahim.y@email.com", phone: "+234 802 345 6789",
    location: "Abuja, Nigeria", status: "suspended", verified: true,
    rides: 89, rating: 3.2, earnings: 980,
    memberSince: "2024-03-22", joinedDate: "2024-03-22",
    verificationStatus: "verified",
    documents: [
      { name: "Driver's License", uploaded: "2024-03-20", expires: "2028-03-20", verified: true },
      { name: "Background Check", uploaded: "2024-03-20", expires: "N/A", verified: false },
      { name: "Insurance Certificate", uploaded: "2024-03-21", expires: "2025-03-21", verified: true },
      { name: "Profile Photo", uploaded: "2024-03-20", expires: "N/A", verified: true },
    ],
    recentRides: [
      { id: "RIDE2850", passenger: "Sarah Johnson", amount: 28.50, date: "2024-11-24", rating: 5 },
      { id: "RIDE2845", passenger: "John Doe", amount: 42.30, date: "2024-11-23", rating: 4 },
      { id: "RIDE2840", passenger: "Jane Smith", amount: 15.80, date: "2024-11-23", rating: 5 },
      { id: "RIDE2835", passenger: "Mike Brown", amount: 35.20, date: "2024-11-22", rating: 5 },
      { id: "RIDE2830", passenger: "Emma Wilson", amount: 22.40, date: "2024-11-22", rating: 4 },
    ],
    weeklyEarnings: [
      { week: "Week 1", rides: 18, earnings: 320, commission: 112 },
      { week: "Week 2", rides: 22, earnings: 380, commission: 133 },
      { week: "Week 3", rides: 14, earnings: 180, commission: 63 },
      { week: "Week 4", rides: 10, earnings: 100, commission: 35 },
    ],
  },
  {
    id: "DRV006", name: "Chioma Eze", initials: "CE", color: "#BE185D",
    email: "chioma.e@email.com", phone: "+234 803 456 7890",
    location: "Port Harcourt, Nigeria", status: "approved", verified: true,
    rides: 267, rating: 4.8, earnings: 3210,
    memberSince: "2024-01-08", joinedDate: "2024-01-08",
    verificationStatus: "verified",
    documents: [
      { name: "Driver's License", uploaded: "2024-01-05", expires: "2027-01-05", verified: true },
      { name: "Background Check", uploaded: "2024-01-05", expires: "N/A", verified: true },
      { name: "Insurance Certificate", uploaded: "2024-01-06", expires: "2025-01-06", verified: true },
      { name: "Profile Photo", uploaded: "2024-01-05", expires: "N/A", verified: true },
    ],
    recentRides: [
      { id: "RIDE2846", passenger: "John Akpan", amount: 45.00, date: "2024-11-24", rating: 4 },
      { id: "RIDE2841", passenger: "Blessing Adeyemi", amount: 22.00, date: "2024-11-23", rating: 5 },
    ],
    weeklyEarnings: [
      { week: "Week 1", rides: 38, earnings: 920, commission: 322 },
      { week: "Week 2", rides: 42, earnings: 1080, commission: 378 },
      { week: "Week 3", rides: 35, earnings: 780, commission: 273 },
      { week: "Week 4", rides: 28, earnings: 430, commission: 151 },
    ],
  },
  {
    id: "DRV007", name: "Kwame Boateng", initials: "KB", color: "#B45309",
    email: "kwame.b@email.com", phone: "+233 20 876 5432",
    location: "Accra, Ghana", status: "blocked", verified: true,
    rides: 23, rating: 3.8, earnings: 280,
    memberSince: "2024-08-10", joinedDate: "2024-08-10",
    verificationStatus: "verified",
    documents: [
      { name: "Driver's License", uploaded: "2024-08-08", expires: "2028-08-08", verified: true },
      { name: "Background Check", uploaded: "2024-08-08", expires: "N/A", verified: true },
      { name: "Insurance Certificate", uploaded: "2024-08-09", expires: "2025-08-09", verified: true },
      { name: "Profile Photo", uploaded: "2024-08-08", expires: "N/A", verified: true },
    ],
    recentRides: [
      { id: "RIDE2850", passenger: "Sarah Johnson", amount: 28.50, date: "2024-11-24", rating: 5 },
      { id: "RIDE2845", passenger: "John Doe", amount: 42.30, date: "2024-11-23", rating: 4 },
      { id: "RIDE2840", passenger: "Jane Smith", amount: 15.80, date: "2024-11-23", rating: 5 },
      { id: "RIDE2835", passenger: "Mike Brown", amount: 35.20, date: "2024-11-22", rating: 5 },
      { id: "RIDE2830", passenger: "Emma Wilson", amount: 22.40, date: "2024-11-22", rating: 4 },
    ],
    weeklyEarnings: [
      { week: "Week 1", rides: 8, earnings: 120, commission: 42 },
      { week: "Week 2", rides: 6, earnings: 80, commission: 28 },
      { week: "Week 3", rides: 5, earnings: 50, commission: 18 },
      { week: "Week 4", rides: 4, earnings: 30, commission: 11 },
    ],
  },
  {
    id: "DRV008", name: "Tunde Bakare", initials: "TB", color: "#065F46",
    email: "tunde.b@email.com", phone: "+234 804 567 8901",
    location: "Kano, Nigeria", status: "pending", verified: false,
    rides: 0, rating: null, earnings: 0,
    memberSince: "2024-11-18", joinedDate: "2024-11-18",
    verificationStatus: "pending",
    documents: [
      { name: "Driver's License", uploaded: "2024-11-18", expires: "2028-11-18", verified: true },
      { name: "Background Check", uploaded: "2024-11-18", expires: "N/A", verified: true },
      { name: "Insurance Certificate", uploaded: "2024-11-19", expires: "2025-11-19", verified: true },
      { name: "Profile Photo", uploaded: "2024-11-18", expires: "N/A", verified: true },
    ],
    recentRides: [],
    weeklyEarnings: [],
  },
  {
    id: "DRV009", name: "Samuel Addo", initials: "SA", color: "#1D4ED8",
    email: "samuel.a@email.com", phone: "+254 712 345 678",
    location: "Nairobi, Kenya", status: "active", verified: false,
    rides: 0, rating: null, earnings: 0,
    memberSince: "2024-10-05", joinedDate: "2024-10-05",
    verificationStatus: "unverified",
    documents: [],
    recentRides: [],
    weeklyEarnings: [],
  },
  {
    id: "DRV010", name: "Grace Okafor", initials: "GO", color: "#9D174D",
    email: "grace.o@email.com", phone: "+234 805 678 9012",
    location: "Lagos, Nigeria", status: "active", verified: true,
    rides: 512, rating: 4.9, earnings: 6840,
    memberSince: "2023-06-15", joinedDate: "2023-06-15",
    verificationStatus: "verified",
    documents: [
      { name: "Driver's License", uploaded: "2023-06-10", expires: "2027-06-10", verified: true },
      { name: "Background Check", uploaded: "2023-06-10", expires: "N/A", verified: true },
      { name: "Insurance Certificate", uploaded: "2023-06-11", expires: "2025-06-11", verified: true },
      { name: "Profile Photo", uploaded: "2023-06-10", expires: "N/A", verified: true },
    ],
    recentRides: [
      { id: "RIDE2853", passenger: "Fatima Hassan", amount: 75.00, date: "2024-11-24", rating: 5 },
      { id: "RIDE2848", passenger: "Amara Nwankwo", amount: 30.00, date: "2024-11-23", rating: 5 },
    ],
    weeklyEarnings: [
      { week: "Week 1", rides: 72, earnings: 2100, commission: 735 },
      { week: "Week 2", rides: 65, earnings: 1880, commission: 658 },
      { week: "Week 3", rides: 68, earnings: 1960, commission: 686 },
      { week: "Week 4", rides: 55, earnings: 900, commission: 315 },
    ],
  },
  {
    id: "DRV011", name: "Peter Mwale", initials: "PM", color: "#6D28D9",
    email: "peter.m@email.com", phone: "+260 96 234 5678",
    location: "Kumasi, Ghana", status: "active", verified: true,
    rides: 145, rating: 4.6, earnings: 1750,
    memberSince: "2024-04-12", joinedDate: "2024-04-12",
    verificationStatus: "verified",
    documents: [
      { name: "Driver's License", uploaded: "2024-04-10", expires: "2028-04-10", verified: true },
      { name: "Background Check", uploaded: "2024-04-10", expires: "N/A", verified: true },
      { name: "Insurance Certificate", uploaded: "2024-04-11", expires: "2025-04-11", verified: true },
      { name: "Profile Photo", uploaded: "2024-04-10", expires: "N/A", verified: true },
    ],
    recentRides: [
      { id: "RIDE2852", passenger: "Grace Osei", amount: 62.00, date: "2024-11-24", rating: 5 },
    ],
    weeklyEarnings: [
      { week: "Week 1", rides: 20, earnings: 480, commission: 168 },
      { week: "Week 2", rides: 24, earnings: 580, commission: 203 },
      { week: "Week 3", rides: 18, earnings: 390, commission: 137 },
      { week: "Week 4", rides: 16, earnings: 300, commission: 105 },
    ],
  },
  {
    id: "DRV012", name: "Fatima Bello", initials: "FB", color: "#047857",
    email: "fatima.b@email.com", phone: "+234 806 789 0123",
    location: "Abuja, Nigeria", status: "pending", verified: false,
    rides: 0, rating: null, earnings: 0,
    memberSince: "2024-11-10", joinedDate: "2024-11-10",
    verificationStatus: "pending",
    documents: [
      { name: "Driver's License", uploaded: "2024-11-10", expires: "2027-11-10", verified: true },
      { name: "Background Check", uploaded: "2024-11-10", expires: "N/A", verified: false },
      { name: "Insurance Certificate", uploaded: "2024-11-11", expires: "2025-11-11", verified: true },
      { name: "Profile Photo", uploaded: "2024-11-10", expires: "N/A", verified: true },
    ],
    recentRides: [],
    weeklyEarnings: [],
  },
  {
    id: "DRV013", name: "Emeka Obi", initials: "EO", color: "#B45309",
    email: "emeka.o@email.com", phone: "+234 807 890 1234",
    location: "Accra, Ghana", status: "pending", verified: false,
    rides: 0, rating: null, earnings: 0,
    memberSince: "2024-11-05", joinedDate: "2024-11-05",
    verificationStatus: "pending",
    documents: [
      { name: "Driver's License", uploaded: "2024-11-05", expires: "2028-11-05", verified: true },
      { name: "Background Check", uploaded: "2024-11-05", expires: "N/A", verified: true },
      { name: "Insurance Certificate", uploaded: "2024-11-06", expires: "2025-11-06", verified: false },
      { name: "Profile Photo", uploaded: "2024-11-05", expires: "N/A", verified: true },
    ],
    recentRides: [],
    weeklyEarnings: [],
  },
  {
    id: "DRV014", name: "Joseph Nkrumah", initials: "JN", color: "#1D4ED8",
    email: "joseph.n@email.com", phone: "+233 20 123 9876",
    location: "Accra, Ghana", status: "disapproved", verified: false,
    rides: 0, rating: null, earnings: 0,
    memberSince: "2024-11-01", joinedDate: "2024-11-01",
    verificationStatus: "pending",
    documents: [],
    recentRides: [],
    weeklyEarnings: [],
  },
];

const ALL_FILTERS = ["All", "Active", "Inactive", "Approved", "Pending", "Suspended", "Blocked", "Disapproved"] as const;
type FilterType = typeof ALL_FILTERS[number];

const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return n === 0 ? "₦0" : `₦${n.toLocaleString()}`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

const STATUS_STYLES: Record<DriverStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-gray-100 text-gray-500",
  approved: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  suspended: "bg-orange-50 text-orange-700",
  blocked: "bg-red-50 text-red-700",
  disapproved: "bg-red-100 text-red-800",
};

const STATUS_DOT: Record<DriverStatus, string> = {
  active: "bg-emerald-500",
  inactive: "bg-gray-400",
  approved: "bg-blue-500",
  pending: "bg-amber-500",
  suspended: "bg-orange-500",
  blocked: "bg-red-500",
  disapproved: "bg-red-700",
};

function StatusBadge({ status }: { status: DriverStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

function Avatar({ driver, size = "md" }: { driver: Driver; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-12 h-12 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`} style={{ backgroundColor: driver.color }}>
      {driver.initials}
    </div>
  );
}

// ─── Driver Modal ─────────────────────────────────────────────────────────────

function DriverModal({ driver: initialDriver, onClose }: { driver: Driver; onClose: () => void }) {
  const [driver, setDriver] = useState(initialDriver);
  const [tab, setTab] = useState<TabType>("overview");

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "recent-rides", label: "Recent Rides" },
    { key: "documents", label: "Documents" },
    { key: "earnings", label: "Earnings" },
  ];

  function handleSuspend() {
    setDriver((d) => ({ ...d, status: d.status === "suspended" ? "approved" : "suspended" }));
  }
  function handleBlock() {
    setDriver((d) => ({ ...d, status: d.status === "blocked" ? "approved" : "blocked" }));
  }
  function handleApprove() {
    setDriver((d) => ({ ...d, status: "approved", verificationStatus: "verified", verified: true }));
  }
  function handleDisapprove() {
    setDriver((d) => ({ ...d, status: "disapproved" }));
  }
  function handleReactivate() {
    setDriver((d) => ({ ...d, status: "approved" }));
  }

  const isPending = driver.status === "pending";
  const isSuspended = driver.status === "suspended";
  const isBlocked = driver.status === "blocked";
  const isDisapproved = driver.status === "disapproved";
  const isReactivatable = isSuspended || isBlocked || isDisapproved;

  const totalEarnings = driver.weeklyEarnings.reduce((s, w) => s + w.earnings, 0);
  const totalCommission = driver.weeklyEarnings.reduce((s, w) => s + w.commission, 0);
  const driverPayout = totalEarnings - totalCommission;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-base">Driver Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Complete information for {driver.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Driver info strip */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-start gap-3">
            <Avatar driver={driver} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{driver.name}</span>
                <StatusBadge status={driver.status} />
                {driver.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {driver.phone}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {driver.email}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  {driver.location}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Joined {driver.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Total Rides", value: driver.rides, icon: "🚗" },
              { label: "Rating", value: driver.rating !== null ? `${driver.rating} ★` : "N/A", icon: "⭐" },
              { label: "Total Earnings", value: fmtCurrency(driver.earnings), icon: "💰" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 flex items-center gap-1">{s.icon} {s.label}</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-gray-100">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {tab === "overview" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Driver ID</p>
                <p className="font-semibold text-gray-900 text-sm">{driver.id}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Account Status</p>
                <StatusBadge status={driver.status} />
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Verification Status</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${driver.verificationStatus === "verified" ? "bg-emerald-50 text-emerald-700" : driver.verificationStatus === "pending" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                  {driver.verificationStatus}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Member Since</p>
                <p className="font-semibold text-gray-900 text-sm">{driver.memberSince}</p>
              </div>
            </div>
          )}

          {tab === "recent-rides" && (
            <div className="space-y-2.5">
              {driver.recentRides.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No rides yet</p>
              ) : driver.recentRides.map((ride) => (
                <div key={ride.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{ride.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Passenger: {ride.passenger}</p>
                      <p className="text-xs text-gray-400">{ride.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">₦{ride.amount.toFixed(2)}</p>
                      <Stars rating={ride.rating} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "documents" && (
            <div className="space-y-2.5">
              {driver.documents.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No documents uploaded</p>
              ) : driver.documents.map((doc, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-base flex-shrink-0">📄</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-400">Uploaded: {doc.uploaded} | Expires: {doc.expires}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${doc.verified ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {doc.verified
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
                    </svg>
                    {doc.verified ? "verified" : "unverified"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === "earnings" && (
            <>
              {driver.weeklyEarnings.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No earnings data</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">Total Earnings</p>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">{fmtCurrency(totalEarnings)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">Commission (35%)</p>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">{fmtCurrency(totalCommission)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">Driver Payout (65%)</p>
                      <p className="font-bold text-emerald-600 text-sm mt-0.5">{fmtCurrency(driverPayout)}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {driver.weeklyEarnings.map((w, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{w.week}</p>
                          <p className="text-xs text-gray-400">{w.rides} rides</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">{fmtCurrency(w.earnings)}</p>
                          <p className="text-xs text-orange-500">Commission: ₦{w.commission}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
          {isPending && (
            <>
              <button onClick={handleApprove} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Approve Driver
              </button>
              <button onClick={handleDisapprove} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Disapprove Driver
              </button>
            </>
          )}

          {!isPending && !isReactivatable && (
            <>
              <button onClick={handleSuspend} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                Suspend Driver
              </button>
              <button onClick={handleBlock} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                Block Driver
              </button>
            </>
          )}

          {isReactivatable && (
            <button onClick={handleReactivate} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Reactivate Driver
            </button>
          )}

          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Drivers() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Driver | null>(null);

  const statCounts = useMemo(() => ({
    active: DRIVERS.filter((d) => d.status === "active").length,
    inactive: DRIVERS.filter((d) => d.status === "inactive").length,
    approved: DRIVERS.filter((d) => d.status === "approved").length,
    pending: DRIVERS.filter((d) => d.status === "pending").length,
    suspended: DRIVERS.filter((d) => d.status === "suspended").length,
    blocked: DRIVERS.filter((d) => d.status === "blocked").length,
    disapproved: DRIVERS.filter((d) => d.status === "disapproved").length,
  }), []);

  const filtered = useMemo(() => {
    let data = DRIVERS;
    if (filter !== "All") data = data.filter((d) => d.status === filter.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      );
    }
    return data;
  }, [filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSearch(v: string) { setSearch(v); setPage(1); }
  function handleFilter(f: FilterType) { setFilter(f); setPage(1); }

  const STAT_CARDS = [
    { label: "Active Drivers", value: statCounts.active, color: "text-emerald-600", bg: "bg-emerald-50", icon: "✓" },
    { label: "Inactive", value: statCounts.inactive, color: "text-gray-500", bg: "bg-gray-100", icon: "–" },
    { label: "Approved", value: statCounts.approved, color: "text-blue-600", bg: "bg-blue-50", icon: "✓" },
    { label: "Pending", value: statCounts.pending, color: "text-amber-600", bg: "bg-amber-50", icon: "⏳" },
    { label: "Suspended", value: statCounts.suspended, color: "text-orange-600", bg: "bg-orange-50", icon: "⊘" },
    { label: "Blocked", value: statCounts.blocked, color: "text-red-600", bg: "bg-red-50", icon: "✕" },
    { label: "Disapproved", value: statCounts.disapproved, color: "text-red-700", bg: "bg-red-100", icon: "✕" },
  ];

  return (
    <div className="bg-gray-50 font-sans">
      <div className="max-w-screen-xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">All Drivers Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Comprehensive driver tracking by status category</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-5 h-5 rounded-full ${s.bg} ${s.color} text-xs flex items-center justify-center font-bold`}>{s.icon}</span>
                <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-gray-700 flex-shrink-0">All Drivers by Status</p>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search drivers by name, email, or ID..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder:text-gray-400"
              />
              {search && (
                <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {ALL_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Driver ID", "Name", "Contact", "Location", "Status", "Rides", "Rating", "Earnings", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No drivers found</td></tr>
                ) : paginated.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{d.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar driver={d} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900 whitespace-nowrap">{d.name}</p>
                          {d.verified && (
                            <p className="text-xs text-emerald-600 flex items-center gap-0.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Verified
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-gray-700">{d.email}</p>
                      <p className="text-gray-400 text-xs">{d.phone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{d.location}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium">{d.rides}</td>
                    <td className="px-4 py-3.5">
                      {d.rating !== null ? (
                        <span className="flex items-center gap-1 text-gray-700 font-medium">
                          {d.rating}
                          <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </span>
                      ) : <span className="text-gray-400 text-sm">N/A</span>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium">{fmtCurrency(d.earnings)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(d)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View details">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-400 text-sm">No drivers found</div>
            ) : paginated.map((d) => (
              <div key={d.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar driver={d} size="md" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{d.name}</p>
                      <p className="text-xs text-gray-400">{d.id} · {d.location}</p>
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Rides</p>
                    <p className="font-semibold text-gray-900 text-sm">{d.rides}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Rating</p>
                    <p className="font-semibold text-gray-900 text-sm">{d.rating !== null ? `${d.rating} ★` : "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Earnings</p>
                    <p className="font-semibold text-gray-900 text-xs">{fmtCurrency(d.earnings)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <button onClick={() => setSelected(d)} className="text-xs text-orange-600 font-medium hover:underline flex items-center gap-1">
                    View Details
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} drivers
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === "…" ? (
                    <span key={`e-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n as number)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${safePage === n ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                      {n}
                    </button>
                  )
                )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && <DriverModal driver={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}