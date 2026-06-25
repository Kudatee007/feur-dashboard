// export interface Pagination {
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// // ─── Active Rides ─────────────────────────────────────────────────────────────

// export interface ActiveRideKpis {
//   totalActive: number;
//   waiting: number;
//   accepted: number;
//   inRoute: number;
//   ongoing: number;
// }

// // Update ActiveRideRow to match actual API shape
// export interface ActiveRideRow {
//   _id: string;
//   status: string;
//   requestedAt: string;
//   startedAt: string | null;
//   distance: number;
//   estimatedDuration: number;
//   route: { pickup: string; dropoff: string } | null;
//   passenger: { firstName: string; lastName: string } | null;
//   driver: { firstName: string; lastName: string } | null;
//   vehicle: { model: string; plateNumber: string } | null;
//   fare: number;
// }

// export interface ActiveRidesData {
//   kpis: ActiveRideKpis;
//   table: {
//     rides: ActiveRideRow[];
//     pagination: Pagination;
//   };
// }

// // ─── Ride History ─────────────────────────────────────────────────────────────

// export interface RideHistoryKpis {
//   totalRides: number;
//   completed: number;
//   cancelled: number;
//   totalRevenue: number;
// }

// export interface RideHistoryRow {
//   rideId: string;
//   status: "completed" | "cancelled" | "disputed";
//   requestedAt: string;
//   completedAt: string;
//   actualDuration: number;
//   estimatedDuration: number;
//   passengerRating: number | null;
//   driverRating: number | null;
// //   route: { pickup: string; dropoff: string };
//   passenger: { firstName: string; lastName: string };
// //   driver: { firstName: string; lastName: string };
// //   vehicle: { model: string; plateNumber: string };
//   driver: { firstName: string; lastName: string } | null;
//   vehicle: { model: string; plateNumber: string } | null;
//   route: { pickup?: string; dropoff?: string } | null;
//   fare: number;
//   paymentType: string;
// }

// export interface RideHistoryData {
//   kpis: RideHistoryKpis;
//   table: {
//     rides: RideHistoryRow[];
//     pagination: Pagination;
//   };
// }

// // ─── Ride Detail ──────────────────────────────────────────────────────────────

// export interface RideDetail {
//   rideId: string;
//   status: string;
//   requestedAt: string;
//   startedAt: string;
//   completedAt: string | null;
//   cancelledAt: string | null;
//   distance: number;
//   estimatedDuration: number;
//   actualDuration: number | null;
//   notes: string | null;
//   route: { pickup: string; dropoff: string };
//   passenger: { firstName: string; lastName: string; phoneNumber: string };
//   driver: { firstName: string; lastName: string; phoneNumber: string };
//   vehicle: { model: string; plateNumber: string };
//   fareDetails: {
//     fare: number;
//     type: string;
//     paymentMethod: string;
//     platformCommission: number;
//     driverPayout: number;
//   };
// }

// // ─── Params ───────────────────────────────────────────────────────────────────

// export interface ActiveRidesParams {
//   search?: string;
//   page?: number;
//   limit?: number;
// }

// export interface RideHistoryParams {
//   status?: "all" | "completed" | "cancelled";
//   search?: string;
//   page?: number;
//   limit?: number;
//   startDate?: string;
//   endDate?: string;
// }

// // ─── API wrapper ──────────────────────────────────────────────────────────────

// export interface ApiResponse<T> {
//   success: boolean;
//   data: T;
// }

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Shared nullable fragments ────────────────────────────────────────────────
// The API returns partial records (pending rides have no driver, some rides
// have no dropoff yet), so these are nullable / partial by design.

export interface PersonRef {
  firstName?: string;
  lastName?: string;
}

export interface PersonWithPhone extends PersonRef {
  phoneNumber?: string;
}

export interface VehicleRef {
  model?: string;
  plateNumber?: string;
}

export interface RouteRef {
  pickup?: string;
  dropoff?: string;
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
}

// ─── Active Rides ─────────────────────────────────────────────────────────────

export interface ActiveRideKpis {
  totalActive: number;
  waiting: number;
  accepted: number;
  inRoute: number;
  ongoing: number;
}

export interface ActiveRideRow {
  _id: string;
  status: string;
  requestedAt: string;
  startedAt?: string | null;
  distance: number;
  estimatedDuration: number;
  route: RouteRef | null;
  passenger: PersonRef | null;
  driver: PersonRef | null;
  vehicle: VehicleRef | null;
  fare: number;
}

export interface ActiveRidesData {
  kpis: ActiveRideKpis;
  table: {
    rides: ActiveRideRow[];
    pagination: Pagination;
  };
}

// ─── Ride History ─────────────────────────────────────────────────────────────

export interface RideHistoryKpis {
  totalRides: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface RideHistoryRow {
  rideId: string;
  status: "completed" | "cancelled" | "disputed";
  requestedAt: string;
  completedAt: string | null;
  actualDuration: number | null;
  estimatedDuration: number;
  passengerRating: number | null;
  driverRating: number | null;
  route: RouteRef | null;
  passenger: PersonRef | null;
  driver: PersonRef | null;
  vehicle: VehicleRef | null;
  fare: number;
  paymentType: string;
}

export interface RideHistoryData {
  kpis: RideHistoryKpis;
  table: {
    rides: RideHistoryRow[];
    pagination: Pagination;
  };
}

// ─── Ride Detail ──────────────────────────────────────────────────────────────

export interface RideDetail {
  rideId: string;
  status: string;
  requestedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  distance: number;
  estimatedDuration: number | null;
  actualDuration: number | null;
  notes: string | null;
  route: RouteRef | null;
  passenger: PersonWithPhone | null;
  driver: PersonWithPhone | null;
  vehicle: VehicleRef | null;
  fareDetails: {
    fare?: number;
    type?: string;
    paymentMethod?: string;
    platformCommission?: number;
    driverPayout?: number;
  } | null;
}

// ─── Params ───────────────────────────────────────────────────────────────────

export interface ActiveRidesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface RideHistoryParams {
  status?: "all" | "completed" | "cancelled";
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

// ─── API wrapper ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
