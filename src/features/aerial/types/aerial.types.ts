export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AerialKpis {
  totalOnline: number;
  available: number;
  onRide: number;
  offline: number;
}

export type AerialDriverStatus = "available" | "on_ride" | "offline";

export interface AerialDriver {
  driverId: string;
  name: string;
  status: AerialDriverStatus;
  rating: number;
  rides: number;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  lastSeen: string;
}

export interface AerialDashboard {
  kpis: AerialKpis;
  drivers: AerialDriver[];
}

export interface AerialQueryParams {
  search?: string;
  status?: AerialDriverStatus | "";
}