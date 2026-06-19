import { useQuery } from "@tanstack/react-query";
import { aerialService } from "../services/aerial.service";
import type { AerialDashboard, AerialQueryParams } from "../types/aerial.types";

export const aerialKeys = {
  all: ["aerial"] as const,
  view: (params: AerialQueryParams) => [...aerialKeys.all, "view", params] as const,
};

function unwrap<T>(res: any): T {
  const body = res.data as any;
  return (body?.data?.data ?? body?.data ?? body) as T;
}

export function useAerialView(params: AerialQueryParams = {}) {
  return useQuery({
    queryKey: aerialKeys.view(params),
    queryFn: async () => {
      const res = await aerialService.getAerialView(params);
      const payload = unwrap<AerialDashboard>(res);
      if (!payload?.kpis) throw new Error("Unexpected aerial shape");
      return payload;
    },
    staleTime: 1000 * 15,           // 15s — location data goes stale fast
    refetchInterval: 1000 * 15,     // auto-refetch every 15s for live feel
    refetchIntervalInBackground: true,
  });
}