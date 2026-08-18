export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface HirePackageConfig {
  label: string;
  startWindow: string;
  mustEndBy: string;
  commissionPercent: number;
  driverPayoutPercent: number;
  extensions: string[];
  extensionNote: string;
}

export interface HireKpis {
  activeHires: number;
  scheduledHires: number;
  completedHires: number;
  extensionRequests: number;
}

export interface BookingExtensionBadge {
  label: string;
  status: "Pending" | "Approved" | string;
}

export interface HireBooking {
  id: string;
  tripId: string;
  package: "half_day" | "full_day";
  packageLabel: string;
  passengerName: string;
  driverName: string;
  pickup: string;
  date: string;
  scheduledDate?: string;
  timeWindow: string;
  fare: number;
  status: string;
  statusLabel: string;
  extension?: BookingExtensionBadge | null;
}

export interface DailyHireDashboard {
  packages: {
    half_day: HirePackageConfig;
    full_day: HirePackageConfig;
  };
  kpis: HireKpis;
  bookings: HireBooking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Extension Requests ───────────────────────────────────────────────────────

export interface ExtensionRequest {
  bookingCode: string;
  tripId: string;
  package: string;
  packageLabel: string;
  passengerName: string;
  driverName: string;
  durationMinutes: number;
  extensionStatus: "awaiting_driver" | "awaiting_payment" | string;
  agreedPrice: number;
  requestedAt: string;
  projectedEndTime: string;
}

export interface ExtensionRequestsData {
  requests: ExtensionRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Booking Detail ───────────────────────────────────────────────────────────

export interface CommittedExtension {
  durationMinutes: number;
  agreedPrice: number;
  paymentStatus: string;
  requestedAt: string;
  agreedAt: string;
  newEndTime: string;
}

export interface PendingExtension {
  durationMinutes: number;
  status: string;
  agreedPrice: number;
  projectedEndTime: string;
  requestedAt: string;
}

export interface HireBookingDetail {
  bookingCode: string;
  tripId: string;
  package: string;
  packageLabel: string;
  status: string;
  statusLabel: string;
  passenger: string;
  driver: string;
  pickupAddress: string;
  date: string;
  timeWindow: {
    start: string;
    end: string;
    validStartWindow: string;
    curfew: string;
  };
  fare: {
    baseFare: number;
    platformCommission: number;
    platformCommissionPercent: number;
    driverPayout: number;
    driverPayoutPercent: number;
    extensionTotal?: number;
    extensionCommission?: number;
    extensionDriverPayout?: number;
    totalFare?: number;
    currency: string;
  };
  extensions: {
    committed: CommittedExtension[];
    pending?: PendingExtension | null;
    totalCommittedMinutes: number;
  };
  notes?: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface DailyHireQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  package?: string;
}