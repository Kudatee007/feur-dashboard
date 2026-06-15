export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── Passengers ────────────────────────────────────────────────────────────

export interface PassengerKpis {
  totalPassengers: number;
  activeUsers: number;
  newThisMonth: number;
  avgRidesPerUser: number;
}

export interface PassengerListItem {
  passengerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  status: string;
  totalRides: number;
  totalSpent: number;
  lastRide: string;
  vehicle: {
    model: string;
    plateNumber: string;
  } | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PassengersDashboard {
  kpis: PassengerKpis;
  table: {
    passengers: PassengerListItem[];
    pagination: Pagination;
  };
}

export interface PassengerRideHistoryItem {
  rideId: string;
  driverName: string;
  route: { pickup: string; dropoff: string };
  date: string;
  fare: number;
  rating: number;
  status: string;
}

export interface PassengerVehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  plateNumber: string;
  color: string;
}

export interface PassengerPayment {
  paymentId: string;
  amount: number;
  status: string;
  completedAt: string;
  paymentMethod: string;
  transactionRef: string;
}

export interface PassengerDetail {
  passengerInfo: {
    passengerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    location: string;
    status: string;
    memberSince: string;
  };
  kpis: {
    totalRides: number;
    totalSpent: number;
    lastRide: string;
  };
  rideHistory: PassengerRideHistoryItem[];
  vehicles: PassengerVehicle[];
  payments: PassengerPayment[];
}

// ─── Drivers ───────────────────────────────────────────────────────────────

export interface DriverKpis {
  activeDrivers: number;
  inactive: number;
  approved: number;
  pending: number;
  suspended: number;
  blocked: number;
  disapproved: number;
}

export interface DriverListItem {
  driverId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  status: string;
  verificationStatus: string;
  rides: number;
  rating: number | null;
  earnings: number;
}

export interface DriversDashboard {
  kpis: DriverKpis;
  table: {
    drivers: DriverListItem[];
    pagination: Pagination;
  };
}

export interface DriverRecentRide {
  rideId: string;
  rideCode: string;
  passengerName: string;
  date: string;
  fare: number;
  rating: number;
  status: string;
}

export interface DriverDocument {
  name: string;
  url: string;
  uploadedAt: string;
  expiresAt: string;
  status: string;
}

export interface DriverWeeklyEarning {
  week: string;
  ridesCount: number;
  amount: number;
}

export interface DriverDetail {
  driverInfo: {
    driverId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    location: string;
    status: string;
    verificationStatus: string;
    joinedAt: string;
  };
  kpis: {
    totalRides: number;
    rating: number;
    totalEarnings: number;
  };
  recentRides: DriverRecentRide[];
  documents: DriverDocument[];
  earnings: {
    totalEarningsThisMonth: number;
    platformCommission: number;
    driverPayout: number;
    weeklyBreakdown: DriverWeeklyEarning[];
  };
}

// ─── Shared ────────────────────────────────────────────────────────────────

export type OperationalStatus = "active" | "inactive" | "suspended" | "blocked";

export interface UpdateStatusPayload {
  status: OperationalStatus;
}

export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}