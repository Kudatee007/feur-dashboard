import api from "../../../lib/axios";
import type { ApiResponse, AerialDashboard, AerialQueryParams } from "../types/aerial.types";

export const aerialService = {
  getAerialView: (params: AerialQueryParams = {}) =>
    api.get<ApiResponse<AerialDashboard>>("/api/v1/admins/dashboard/aerial", {
      params: {
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    }),
};