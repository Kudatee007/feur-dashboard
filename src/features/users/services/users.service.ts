// src/features/users/services/users.service.ts

import api from "../../../lib/axios";
import type {
  ApiResponse,
  PassengersDashboard,
  PassengerDetail,
  DriversDashboard,
  DriverDetail,
  UpdateStatusPayload,
  UpdateStatusResponse,
  ListQueryParams,
} from "../types/users.types";

export const usersService = {
  // ── Passengers ──────────────────────────────────────────────────────────

  getPassengers: (params: ListQueryParams = {}) =>
    api.get<ApiResponse<PassengersDashboard>>(
      "/api/v1/admins/dashboard/passengers",
      { params }
    ),

  getPassengerById: (id: string) =>
    api.get<ApiResponse<PassengerDetail>>(
      `/api/v1/admins/dashboard/passengers/${id}`
    ),

  updatePassengerStatus: (id: string, payload: UpdateStatusPayload) =>
    api.patch<UpdateStatusResponse>(
      `/api/v1/passengers/status/${id}`,
      payload
    ),

  // ── Drivers ──────────────────────────────────────────────────────────────

  getDrivers: (params: ListQueryParams = {}) =>
    api.get<ApiResponse<DriversDashboard>>(
      "/api/v1/admins/dashboard/drivers",
      { params }
    ),

  getDriverById: (id: string) =>
    api.get<ApiResponse<DriverDetail>>(
      `/api/v1/admins/dashboard/drivers/${id}`
    ),

  updateDriverStatus: (id: string, payload: UpdateStatusPayload) =>
    api.patch<UpdateStatusResponse>(
      `/api/v1/drivers/status/${id}`,
      payload
    ),
};