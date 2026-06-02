import { useState, useMemo } from "react";

// ─── Types
type Status = "active" | "inactive";

interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "mobile";
  last4: string;
  expiry: string;
  isDefault?: boolean;
}

interface Transaction {
  id: string;
  method: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

interface Ride {
  id: string;
  driver: string;
  route: string;
  amount: number;
  date: string;
  rating: number;
}

interface Vehicle {
  name: string;
  plate: string;
  addedDate: string;
  isPrimary?: boolean;
}

interface Passenger {
  id: string;
  name: string;
  initials: string;
  color: string;
  email: string;
  phone: string;
  vehicle: string;
  plate: string;
  location: string;
  status: Status;
  totalRides: number;
  totalSpent: number;
  lastRide: string;
  memberSince: string;
  joinedDate: string;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  rides: Ride[];
  vehicles: Vehicle[];
}

type TabType = "overview" | "ride-history" | "vehicles" | "payments";

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const PASSENGERS: Passenger[] = [
  {
    id: "PSG001", name: "Sarah Johnson", initials: "SJ", color: "#4F46E5",
    email: "sarah.j@email.com", phone: "+234 802 345 6789",
    vehicle: "Toyota Camry 2020", plate: "LAG-456-HJ", location: "Lagos, Nigeria",
    status: "active", totalRides: 45, totalSpent: 1240, lastRide: "2 hours ago",
    memberSince: "2024-01-10", joinedDate: "2024-01-10",
    paymentMethods: [
      { id: "pm1", type: "visa", last4: "4242", expiry: "12/26", isDefault: true },
      { id: "pm2", type: "mastercard", last4: "8888", expiry: "06/25" },
    ],
    transactions: [
      { id: "TXN001", method: "Payment Gateway", amount: 28.50, date: "2024-11-24", status: "completed" },
      { id: "TXN002", method: "Visa Card •••• 4242", amount: 42.30, date: "2024-11-23", status: "completed" },
      { id: "TXN003", method: "Mastercard •••• 8888", amount: 15.80, date: "2024-11-23", status: "completed" },
      { id: "TXN004", method: "Payment Gateway", amount: 35.20, date: "2024-11-22", status: "completed" },
    ],
    rides: [
      { id: "RIDE2850", driver: "Michael Okonkwo", route: "VI to Lekki", amount: 28.50, date: "2024-11-24", rating: 5 },
      { id: "RIDE2845", driver: "David Mensah", route: "Ikeja to VI", amount: 42.30, date: "2024-11-23", rating: 4 },
      { id: "RIDE2840", driver: "Chioma Eze", route: "Yaba to Surulere", amount: 15.80, date: "2024-11-23", rating: 5 },
      { id: "RIDE2835", driver: "Kofi Asante", route: "Lekki to Airport", amount: 35.20, date: "2024-11-22", rating: 5 },
      { id: "RIDE2830", driver: "Emmanuel Banda", route: "GRA to Marina", amount: 22.40, date: "2024-11-22", rating: 4 },
    ],
    vehicles: [{ name: "Toyota Camry 2020", plate: "LAG-456-HJ", addedDate: "2024-01-10", isPrimary: true }],
  },
  {
    id: "PSG002", name: "Amara Nwankwo", initials: "AN", color: "#059669",
    email: "amara.n@email.com", phone: "+234 803 456 7890",
    vehicle: "Honda Accord 2019", plate: "ABJ-892-KL", location: "Abuja, Nigeria",
    status: "active", totalRides: 78, totalSpent: 2180, lastRide: "1 day ago",
    memberSince: "2023-08-15", joinedDate: "2023-08-15",
    paymentMethods: [
      { id: "pm1", type: "visa", last4: "1234", expiry: "03/27", isDefault: true },
    ],
    transactions: [
      { id: "TXN001", method: "Visa Card •••• 1234", amount: 55.00, date: "2024-11-23", status: "completed" },
      { id: "TXN002", method: "Visa Card •••• 1234", amount: 30.00, date: "2024-11-22", status: "completed" },
    ],
    rides: [
      { id: "RIDE2849", driver: "Emeka Obi", route: "Wuse to Garki", amount: 55.00, date: "2024-11-23", rating: 5 },
      { id: "RIDE2844", driver: "Fatima Bello", route: "Maitama to Airport", amount: 30.00, date: "2024-11-22", rating: 4 },
    ],
    vehicles: [{ name: "Honda Accord 2019", plate: "ABJ-892-KL", addedDate: "2023-08-15", isPrimary: true }],
  },
  {
    id: "PSG003", name: "John Akpan", initials: "JA", color: "#DC2626",
    email: "john.a@email.com", phone: "+234 804 567 8901",
    vehicle: "Mercedes C-Class 2019", plate: "PHC-234-MN", location: "Port Harcourt, Nigeria",
    status: "active", totalRides: 23, totalSpent: 670, lastRide: "3 hours ago",
    memberSince: "2024-03-20", joinedDate: "2024-03-20",
    paymentMethods: [
      { id: "pm1", type: "mastercard", last4: "5566", expiry: "09/26", isDefault: true },
    ],
    transactions: [
      { id: "TXN001", method: "Mastercard •••• 5566", amount: 45.00, date: "2024-11-24", status: "completed" },
    ],
    rides: [
      { id: "RIDE2851", driver: "Chidi Okeke", route: "GRA to Rumuola", amount: 45.00, date: "2024-11-24", rating: 4 },
    ],
    vehicles: [{ name: "Mercedes C-Class 2019", plate: "PHC-234-MN", addedDate: "2024-03-20", isPrimary: true }],
  },
  {
    id: "PSG004", name: "Grace Osei", initials: "GO", color: "#7C3AED",
    email: "grace.o@email.com", phone: "+233 24 123 4567",
    vehicle: "Toyota Corolla 2021", plate: "GH-567-23", location: "Accra, Ghana",
    status: "active", totalRides: 92, totalSpent: 2890, lastRide: "5 hours ago",
    memberSince: "2023-05-10", joinedDate: "2023-05-10",
    paymentMethods: [
      { id: "pm1", type: "visa", last4: "9999", expiry: "11/27", isDefault: true },
      { id: "pm2", type: "mobile", last4: "0000", expiry: "N/A" },
    ],
    transactions: [
      { id: "TXN001", method: "Visa Card •••• 9999", amount: 62.00, date: "2024-11-24", status: "completed" },
      { id: "TXN002", method: "Visa Card •••• 9999", amount: 18.50, date: "2024-11-23", status: "completed" },
    ],
    rides: [
      { id: "RIDE2852", driver: "Kwame Mensah", route: "East Legon to Airport City", amount: 62.00, date: "2024-11-24", rating: 5 },
      { id: "RIDE2847", driver: "Abena Asante", route: "Osu to Tema", amount: 18.50, date: "2024-11-23", rating: 5 },
    ],
    vehicles: [{ name: "Toyota Corolla 2021", plate: "GH-567-23", addedDate: "2023-05-10", isPrimary: true }],
  },
  {
    id: "PSG005", name: "Peter Mwale", initials: "PM", color: "#B45309",
    email: "peter.m@email.com", phone: "+260 97 234 5678",
    vehicle: "Nissan Altima 2018", plate: "ZM-789-45", location: "Lusaka, Zambia",
    status: "inactive", totalRides: 12, totalSpent: 340, lastRide: "2 weeks ago",
    memberSince: "2024-03-08", joinedDate: "2024-03-08",
    paymentMethods: [
      { id: "pm1", type: "visa", last4: "4242", expiry: "12/26", isDefault: true },
      { id: "pm2", type: "mastercard", last4: "8888", expiry: "06/25" },
      { id: "pm3", type: "mobile", last4: "0000", expiry: "N/A" },
    ],
    transactions: [
      { id: "TXN001", method: "Payment Gateway", amount: 28.50, date: "2024-11-24", status: "completed" },
      { id: "TXN002", method: "Visa Card •••• 4242", amount: 42.30, date: "2024-11-23", status: "completed" },
      { id: "TXN003", method: "Mastercard •••• 8888", amount: 15.80, date: "2024-11-23", status: "completed" },
      { id: "TXN004", method: "Payment Gateway", amount: 35.20, date: "2024-11-22", status: "completed" },
    ],
    rides: [
      { id: "RIDE2850", driver: "Michael Okonkwo", route: "VI to Lekki", amount: 28.50, date: "2024-11-24", rating: 5 },
      { id: "RIDE2845", driver: "David Mensah", route: "Ikeja to VI", amount: 42.30, date: "2024-11-23", rating: 4 },
      { id: "RIDE2840", driver: "Chioma Eze", route: "Yaba to Surulere", amount: 15.80, date: "2024-11-23", rating: 5 },
      { id: "RIDE2835", driver: "Kofi Asante", route: "Lekki to Airport", amount: 35.20, date: "2024-11-22", rating: 5 },
      { id: "RIDE2830", driver: "Emmanuel Banda", route: "GRA to Marina", amount: 22.40, date: "2024-11-22", rating: 4 },
    ],
    vehicles: [{ name: "Nissan Altima 2018", plate: "ZM-789-45", addedDate: "2024-01-10", isPrimary: true }],
  },
  {
    id: "PSG006", name: "Fatima Hassan", initials: "FH", color: "#0891B2",
    email: "fatima.h@email.com", phone: "+234 806 789 0123",
    vehicle: "BMW 3 Series 2020", plate: "KN-123-OP", location: "Kano, Nigeria",
    status: "active", totalRides: 134, totalSpent: 3920, lastRide: "6 hours ago",
    memberSince: "2023-01-05", joinedDate: "2023-01-05",
    paymentMethods: [
      { id: "pm1", type: "visa", last4: "7777", expiry: "08/28", isDefault: true },
    ],
    transactions: [
      { id: "TXN001", method: "Visa Card •••• 7777", amount: 75.00, date: "2024-11-24", status: "completed" },
      { id: "TXN002", method: "Visa Card •••• 7777", amount: 50.00, date: "2024-11-23", status: "completed" },
    ],
    rides: [
      { id: "RIDE2853", driver: "Aliyu Garba", route: "Sabon Gari to Airport", amount: 75.00, date: "2024-11-24", rating: 5 },
      { id: "RIDE2848", driver: "Musa Ibrahim", route: "Fagge to Bompai", amount: 50.00, date: "2024-11-23", rating: 4 },
    ],
    vehicles: [{ name: "BMW 3 Series 2020", plate: "KN-123-OP", addedDate: "2023-01-05", isPrimary: true }],
  },
  {
    id: "PSG007", name: "Daniel Opoku", initials: "DO", color: "#BE185D",
    email: "daniel.o@email.com", phone: "+233 20 345 6789",
    vehicle: "Mazda 3 2018", plate: "GH-234-56", location: "Kumasi, Ghana",
    status: "active", totalRides: 56, totalSpent: 1540, lastRide: "1 hour ago",
    memberSince: "2023-11-22", joinedDate: "2023-11-22",
    paymentMethods: [
      { id: "pm1", type: "mastercard", last4: "3344", expiry: "04/27", isDefault: true },
    ],
    transactions: [
      { id: "TXN001", method: "Mastercard •••• 3344", amount: 38.00, date: "2024-11-24", status: "completed" },
    ],
    rides: [
      { id: "RIDE2854", driver: "Yaw Boateng", route: "Adum to Airport", amount: 38.00, date: "2024-11-24", rating: 5 },
    ],
    vehicles: [{ name: "Mazda 3 2018", plate: "GH-234-56", addedDate: "2023-11-22", isPrimary: true }],
  },
  {
    id: "PSG008", name: "Blessing Adeyemi", initials: "BA", color: "#065F46",
    email: "blessing.a@email.com", phone: "+234 807 890 1234",
    vehicle: "Hyundai Elantra 2017", plate: "IB-678-QR", location: "Ibadan, Nigeria",
    status: "active", totalRides: 38, totalSpent: 980, lastRide: "4 hours ago",
    memberSince: "2024-02-14", joinedDate: "2024-02-14",
    paymentMethods: [
      { id: "pm1", type: "visa", last4: "6655", expiry: "07/26", isDefault: true },
    ],
    transactions: [
      { id: "TXN001", method: "Visa Card •••• 6655", amount: 22.00, date: "2024-11-24", status: "completed" },
    ],
    rides: [
      { id: "RIDE2855", driver: "Tunde Afolabi", route: "Challenge to UI", amount: 22.00, date: "2024-11-24", rating: 4 },
    ],
    vehicles: [{ name: "Hyundai Elantra 2017", plate: "IB-678-QR", addedDate: "2024-02-14", isPrimary: true }],
  },
  {
    id: "PSG009", name: "Kweku Asare", initials: "KA", color: "#6D28D9",
    email: "kweku.a@email.com", phone: "+233 24 567 8901",
    vehicle: "Ford Focus 2019", plate: "GH-901-23", location: "Cape Coast, Ghana",
    status: "inactive", totalRides: 7, totalSpent: 180, lastRide: "1 month ago",
    memberSince: "2024-06-01", joinedDate: "2024-06-01",
    paymentMethods: [
      { id: "pm1", type: "mobile", last4: "0000", expiry: "N/A", isDefault: true },
    ],
    transactions: [
      { id: "TXN001", method: "Mobile Money", amount: 25.00, date: "2024-10-15", status: "completed" },
    ],
    rides: [
      { id: "RIDE2800", driver: "Ama Boateng", route: "Cape Coast to Elmina", amount: 25.00, date: "2024-10-15", rating: 3 },
    ],
    vehicles: [{ name: "Ford Focus 2019", plate: "GH-901-23", addedDate: "2024-06-01", isPrimary: true }],
  },
  {
    id: "PSG010", name: "Ngozi Okafor", initials: "NO", color: "#9D174D",
    email: "ngozi.o@email.com", phone: "+234 809 012 3456",
    vehicle: "Kia Sportage 2022", plate: "EN-456-78", location: "Enugu, Nigeria",
    status: "active", totalRides: 61, totalSpent: 1750, lastRide: "30 mins ago",
    memberSince: "2023-09-30", joinedDate: "2023-09-30",
    paymentMethods: [
      { id: "pm1", type: "visa", last4: "2211", expiry: "10/27", isDefault: true },
      { id: "pm2", type: "mastercard", last4: "4433", expiry: "02/26" },
    ],
    transactions: [
      { id: "TXN001", method: "Visa Card •••• 2211", amount: 40.00, date: "2024-11-24", status: "completed" },
      { id: "TXN002", method: "Mastercard •••• 4433", amount: 28.00, date: "2024-11-23", status: "completed" },
    ],
    rides: [
      { id: "RIDE2856", driver: "Chukwuemeka Nwosu", route: "Independence Layout to Airport", amount: 40.00, date: "2024-11-24", rating: 5 },
      { id: "RIDE2851", driver: "Ada Ezeh", route: "GRA to New Haven", amount: 28.00, date: "2024-11-23", rating: 4 },
    ],
    vehicles: [{ name: "Kia Sportage 2022", plate: "EN-456-78", addedDate: "2023-09-30", isPrimary: true }],
  },
  {
    id: "PSG011", name: "Moussa Diallo", initials: "MD", color: "#1D4ED8",
    email: "moussa.d@email.com", phone: "+221 77 123 4567",
    vehicle: "Peugeot 508 2020", plate: "SN-789-AB", location: "Dakar, Senegal",
    status: "inactive", totalRides: 3, totalSpent: 95, lastRide: "3 weeks ago",
    memberSince: "2024-08-12", joinedDate: "2024-08-12",
    paymentMethods: [
      { id: "pm1", type: "mobile", last4: "0000", expiry: "N/A", isDefault: true },
    ],
    transactions: [
      { id: "TXN001", method: "Mobile Money", amount: 30.00, date: "2024-11-01", status: "completed" },
    ],
    rides: [
      { id: "RIDE2820", driver: "Ibrahima Ndiaye", route: "Plateau to Almadies", amount: 30.00, date: "2024-11-01", rating: 4 },
    ],
    vehicles: [{ name: "Peugeot 508 2020", plate: "SN-789-AB", addedDate: "2024-08-12", isPrimary: true }],
  },
  {
    id: "PSG012", name: "Aisha Kamara", initials: "AK", color: "#047857",
    email: "aisha.k@email.com", phone: "+232 78 901 234",
    vehicle: "Toyota RAV4 2021", plate: "SL-012-CD", location: "Freetown, Sierra Leone",
    status: "active", totalRides: 29, totalSpent: 820, lastRide: "8 hours ago",
    memberSince: "2024-01-25", joinedDate: "2024-01-25",
    paymentMethods: [
      { id: "pm1", type: "visa", last4: "5544", expiry: "05/28", isDefault: true },
    ],
    transactions: [
      { id: "TXN001", method: "Visa Card •••• 5544", amount: 33.00, date: "2024-11-24", status: "completed" },
    ],
    rides: [
      { id: "RIDE2857", driver: "Mohamed Sesay", route: "Lumley to Hill Station", amount: 33.00, date: "2024-11-24", rating: 5 },
    ],
    vehicles: [{ name: "Toyota RAV4 2021", plate: "SL-012-CD", addedDate: "2024-01-25", isPrimary: true }],
  },
];

const PAGE_SIZE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return `₦${n.toLocaleString()}`;
}

function Stars({ rating }: { rating: number }) {
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

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : "bg-gray-400"}`} />
      {status}
    </span>
  );
}

function Avatar({ passenger, size = "md" }: { passenger: Passenger; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-12 h-12 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-semibold text-white shrink-0`} style={{ backgroundColor: passenger.color }}>
      {passenger.initials}
    </div>
  );
}

// ─── Passenger Detail Modal ───────────────────────────────────────────────────

function PassengerModal({ passenger, onClose }: { passenger: Passenger; onClose: () => void }) {
  const [tab, setTab] = useState<TabType>("overview");

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "ride-history", label: "Ride History" },
    { key: "vehicles", label: "Vehicles" },
    { key: "payments", label: "Payments" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-base">Passenger Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Complete information for {passenger.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Passenger info strip */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <Avatar passenger={passenger} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{passenger.name}</span>
                <StatusBadge status={passenger.status} />
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {passenger.phone}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {passenger.email}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  {passenger.location}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Joined {passenger.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Total Rides", value: passenger.totalRides, icon: "🚗" },
              { label: "Total Spent", value: fmtCurrency(passenger.totalSpent), icon: "💳" },
              { label: "Last Ride", value: passenger.lastRide, icon: "🕐" },
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
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
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
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Passenger ID</p>
                  <p className="font-semibold text-gray-900 text-sm">{passenger.id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Account Status</p>
                  <StatusBadge status={passenger.status} />
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Primary Vehicle</p>
                  <p className="font-semibold text-gray-900 text-sm">{passenger.vehicle}</p>
                  <p className="text-xs text-gray-400">{passenger.plate}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Member Since</p>
                  <p className="font-semibold text-gray-900 text-sm">{passenger.memberSince}</p>
                </div>
              </div>
            </>
          )}

          {tab === "ride-history" && (
            <div className="space-y-2.5">
              {passenger.rides.map((ride) => (
                <div key={ride.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{ride.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Driver: {ride.driver}</p>
                      <p className="text-xs text-gray-400">{ride.route}</p>
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

          {tab === "vehicles" && (
            <div className="space-y-2.5">
              {passenger.vehicles.map((v, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">🚗</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{v.name}</p>
                      {v.isPrimary && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Primary</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Plate: {v.plate}</p>
                    <p className="text-xs text-gray-400">Added: {v.addedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "payments" && (
            <>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Methods</p>
                <div className="space-y-2">
                  {passenger.paymentMethods.map((pm) => (
                    <div key={pm.id} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-base">
                        {pm.type === "visa" ? "💳" : pm.type === "mastercard" ? "💳" : "📱"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {pm.type === "mobile" ? "Payment Gateway" : `${pm.type.charAt(0).toUpperCase() + pm.type.slice(1)} Card`} •••• {pm.last4}
                        </p>
                        <p className="text-xs text-gray-400">Expires: {pm.expiry}</p>
                      </div>
                      {pm.isDefault && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">Default</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Transactions</p>
                <div className="space-y-2">
                  {passenger.transactions.map((txn) => (
                    <div key={txn.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{txn.id}</p>
                        <p className="text-xs text-gray-400">{txn.method}</p>
                        <p className="text-xs text-gray-400">{txn.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">₦{txn.amount.toFixed(2)}</p>
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${passenger.status === "active" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {passenger.status === "active"
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
            </svg>
            {passenger.status === "active" ? "Suspend Account" : "Reactivate Account"}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Passengers() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Passenger | null>(null);

  const filtered = useMemo(() => {
    let data = PASSENGERS;
    if (filter !== "all") data = data.filter((p) => p.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.vehicle.toLowerCase().includes(q) ||
          p.plate.toLowerCase().includes(q)
      );
    }
    return data;
  }, [filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: PASSENGERS.length,
    active: PASSENGERS.filter((p) => p.status === "active").length,
    newMonth: 1456,
    avgRides: 8.2,
  }), []);

  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleFilterChange(f: "all" | Status) {
    setFilter(f);
    setPage(1);
  }

  return (
    <div className="min-h-screen font-sans">
      <div className="">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Passengers Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and monitor all registered passengers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Passengers", value: stats.total.toLocaleString() },
            { label: "Active Users", value: stats.active.toLocaleString() },
            { label: "New This Month", value: stats.newMonth.toLocaleString() },
            { label: "Avg Rides/User", value: stats.avgRides.toFixed(1) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700 shrink-0">All Passengers</p>

            <div className="flex w-64 sm:ml-auto relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search passengers..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder:text-gray-400"
              />
              {search && (
                <button onClick={() => handleSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
              {(["all", "active", "inactive"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
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
                  {["Passenger ID", "Name", "Contact", "Vehicle (Plate #)", "Location", "Status", "Total Rides", "Total Spent", "Last Ride", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">No passengers found</td>
                  </tr>
                ) : paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{p.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar passenger={p} size="sm" />
                        <span className="font-medium text-gray-900 whitespace-nowrap">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-gray-700">{p.email}</p>
                      <p className="text-gray-400 text-xs">{p.phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-gray-700 whitespace-nowrap">{p.vehicle}</p>
                      <p className="text-gray-400 text-xs">{p.plate}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{p.location}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium">{p.totalRides}</td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium">{fmtCurrency(p.totalSpent)}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{p.lastRide}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelected(p)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="More options">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
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
              <div className="px-4 py-12 text-center text-gray-400 text-sm">No passengers found</div>
            ) : paginated.map((p) => (
              <div key={p.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar passenger={p} size="md" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.id} · {p.location}</p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Rides</p>
                    <p className="font-semibold text-gray-900 text-sm">{p.totalRides}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Spent</p>
                    <p className="font-semibold text-gray-900 text-sm">{fmtCurrency(p.totalSpent)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Last Ride</p>
                    <p className="font-semibold text-gray-900 text-xs">{p.lastRide}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500">{p.vehicle} · {p.plate}</p>
                  <button
                    onClick={() => setSelected(p)}
                    className="text-xs text-orange-600 font-medium hover:underline flex items-center gap-1"
                  >
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
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} passengers
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
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
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${safePage === n ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      {n}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && <PassengerModal passenger={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}