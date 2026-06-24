// src/features/statements/hooks/useStatements.ts

import { useQuery } from "@tanstack/react-query";
import { statementsService } from "../services/statements.service";
import type { FinancialStatement } from "../types/statements.types";

export const statementsKeys = {
  all: ["statements"] as const,
  financial: () => [...statementsKeys.all, "financial"] as const,
};

function unwrap<T>(res: any): T {
  const body = res.data as any;
  return (body?.data?.data ?? body?.data ?? body) as T;
}

export function useFinancialStatement() {
  return useQuery({
    queryKey: statementsKeys.financial(),
    queryFn: async () => {
      const res = await statementsService.getFinancialStatement();
      const payload = unwrap<FinancialStatement>(res);
      if (!payload?.kpis) throw new Error("Unexpected financial statement shape");
      return payload;
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 2,
  });
}