import { useQuery } from "@tanstack/react-query";
import { payoutsService } from "../services/payouts.service";
import type { PayoutsDashboard } from "../types/payouts.types";

export const payoutsKeys = {
  all: ["payouts"] as const,
  dashboard: () => [...payoutsKeys.all, "dashboard"] as const,
};

function unwrap<T>(res: any): T {
  const body = res.data as any;
  return (body?.data?.data ?? body?.data ?? body) as T;
}

export function usePayoutsDashboard() {
  return useQuery({
    queryKey: payoutsKeys.dashboard(),
    queryFn: async () => {
      const res = await payoutsService.getPayoutsDashboard();
      const payload = unwrap<PayoutsDashboard>(res);
      if (!payload?.kpis) throw new Error("Unexpected payouts shape");
      return payload;
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 2,
  });
}