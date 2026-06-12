import api from "../../../lib/axios";
import type {
  ApiResponse,
  DashboardMetrics,
  DashboardCharts,
  DashboardLists,
} from "../types/dashboard.types";

export const dashboardService = {
  getMetrics: () =>
    api.get<ApiResponse<DashboardMetrics>>("/api/v1/admins/dashboard/metrics"),

  getCharts: () =>
    api.get<ApiResponse<DashboardCharts>>("/api/v1/admins/dashboard/charts"),

  getLists: () =>
    api.get<ApiResponse<DashboardLists>>("/api/v1/admins/dashboard/lists"),
};
