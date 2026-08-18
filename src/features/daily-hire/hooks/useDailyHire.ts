import { useQuery } from "@tanstack/react-query";
import { dailyHireService } from "../services/dailyHire.service";
import type {
  DailyHireDashboard,
  ExtensionRequestsData,
  HireBookingDetail,
  DailyHireQueryParams,
} from "../types/dailyHire.types";

function unwrap<T>(res: any): T {
  const body = res.data as any;
  return (body?.data?.data ?? body?.data ?? body) as T;
}

export const dailyHireKeys = {
  all: ["daily-hire"] as const,
  dashboard: (params: DailyHireQueryParams) =>
    [...dailyHireKeys.all, "dashboard", params] as const,
  extensions: (page: number) =>
    [...dailyHireKeys.all, "extensions", page] as const,
  detail: (id: string) =>
    [...dailyHireKeys.all, "detail", id] as const,
};

export function useDailyHireDashboard(params: DailyHireQueryParams = {}) {
  return useQuery({
    queryKey: dailyHireKeys.dashboard(params),
    queryFn: async () => {
      const res = await dailyHireService.getDashboard(params);
      const payload = unwrap<DailyHireDashboard>(res);
      if (!payload?.kpis) throw new Error("Unexpected daily hire shape");
      return payload;
    },
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });
}

export function useExtensionRequests(page = 1) {
  return useQuery({
    queryKey: dailyHireKeys.extensions(page),
    queryFn: async () => {
      const res = await dailyHireService.getExtensionRequests(page);
      return unwrap<ExtensionRequestsData>(res);
    },
    staleTime: 1000 * 30,
  });
}

export function useHireBookingDetail(id: string | null) {
  return useQuery({
    queryKey: dailyHireKeys.detail(id ?? ""),
    queryFn: async () => {
      const res = await dailyHireService.getBookingDetail(id!);
      return unwrap<HireBookingDetail>(res);
    },
    enabled: !!id,
    staleTime: 1000 * 30,
  });
}