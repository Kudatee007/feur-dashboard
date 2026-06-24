// src/features/statements/services/statements.service.ts

import api from "../../../lib/axios";
import type { ApiResponse, FinancialStatement } from "../types/statements.types";

export const statementsService = {
  getFinancialStatement: () =>
    api.get<ApiResponse<FinancialStatement>>(
      "/api/v1/admins/dashboard/financial-statement"
    ),
};