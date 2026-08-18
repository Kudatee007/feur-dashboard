import api from "../../../lib/axios";
import type {
  ApiResponse,
  DailyHireDashboard,
  ExtensionRequestsData,
  HireBookingDetail,
  DailyHireQueryParams,
} from "../types/dailyHire.types";

export const dailyHireService = {
  getDashboard: (params: DailyHireQueryParams = {}) =>
    api.get<ApiResponse<DailyHireDashboard>>(
      "/api/v1/admins/dashboard/daily-hire",
      { params }
    ),

  getExtensionRequests: (page = 1, limit = 10) =>
    api.get<ApiResponse<ExtensionRequestsData>>(
      "/api/v1/admins/dashboard/daily-hire/extension-requests",
      { params: { page, limit } }
    ),

  getBookingDetail: (id: string) =>
    api.get<ApiResponse<HireBookingDetail>>(
      `/api/v1/admins/dashboard/daily-hire/${id}`
    ),
};