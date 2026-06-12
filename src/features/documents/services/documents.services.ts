import api from "../../../lib/axios";
import type {
  ApiResponse,
  DriverQueueData,
  DriverQueueItem,
  PassengerQueueData,
  PassengerDetailData,
  UpdateStatusPayload,
} from "../types/documents.types";

export interface QueueParams {
  page?: number;
  limit?: number;
}

export const documentsService = {
  // ── Drivers ────────────────────────────────────────────────────────────────

  getDriverQueue: (params?: QueueParams) =>
    api.get<ApiResponse<DriverQueueData>>(
      "/api/v1/admins/dashboard/documents/drivers",
      { params }
    ),

  getDriverDetail: (driverId: string) =>
    api.get<ApiResponse<DriverQueueItem>>(
      `/api/v1/admins/dashboard/documents/drivers/${driverId}`
    ),

  updateDriverStatus: (driverId: string, payload: UpdateStatusPayload) =>
    api.patch<ApiResponse<{ driverId: string; verificationStatus: string }>>(
      `/api/v1/admins/dashboard/documents/drivers/${driverId}/status`,
      payload
    ),

  // ── Passengers ─────────────────────────────────────────────────────────────

  getPassengerQueue: (params?: QueueParams) =>
    api.get<ApiResponse<PassengerQueueData>>(
      "/api/v1/admins/dashboard/documents/passengers",
      { params }
    ),

  getPassengerDetail: (passengerId: string) =>
    api.get<ApiResponse<PassengerDetailData>>(
      `/api/v1/admins/dashboard/documents/passengers/${passengerId}`
    ),

  updatePassengerStatus: (passengerId: string, payload: UpdateStatusPayload) =>
    api.patch<ApiResponse<{ passengerId: string; verificationStatus: string }>>(
      `/api/v1/admins/dashboard/documents/passengers/${passengerId}/status`,
      payload
    ),
};