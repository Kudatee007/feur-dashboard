import api from "../../../lib/axios";
import type {
  ApiResponse,
  ActiveRidesData,
  ActiveRidesParams,
  RideHistoryData,
  RideHistoryParams,
  RideDetail,
} from "../types/rides.types";

export const ridesService = {
  getActiveRides: (params?: ActiveRidesParams) =>
    api.get<ApiResponse<ActiveRidesData>>(
      "/api/v1/admins/dashboard/rides/active",
      { params }
    ),

  getRideHistory: (params?: RideHistoryParams) =>
    api.get<ApiResponse<RideHistoryData>>(
      "/api/v1/admins/dashboard/rides/history",
      { params }
    ),

  getRideById: (id: string) =>
    api.get<ApiResponse<RideDetail>>(
      `/api/v1/admins/dashboard/rides/${id}`
    ),
};