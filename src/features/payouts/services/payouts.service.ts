import api from "../../../lib/axios";
import type { ApiResponse, PayoutsDashboard } from "../types/payouts.types";

export const payoutsService = {
  getPayoutsDashboard: () =>
    api.get<ApiResponse<PayoutsDashboard>>("/api/v1/admins/dashboard/payouts"),
};