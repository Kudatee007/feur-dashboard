// import { useQuery } from "@tanstack/react-query";
// import { dashboardService } from "../services/dashboard.service";

// export const dashboardKeys = {
//   all: ["dashboard"] as const,
//   metrics: () => [...dashboardKeys.all, "metrics"] as const,
//   charts: () => [...dashboardKeys.all, "charts"] as const,
//   lists: () => [...dashboardKeys.all, "lists"] as const,
// };

// export function useDashboardMetrics() {
//   return useQuery({
//     queryKey: dashboardKeys.metrics(),
//     queryFn: () => dashboardService.getMetrics().then((r) => r.data.data),
//     staleTime: 1000 * 30,
//     refetchInterval: 1000 * 60,
//   });
// }

// export function useDashboardCharts() {
//   return useQuery({
//     queryKey: dashboardKeys.charts(),
//     queryFn: () => dashboardService.getCharts().then((r) => r.data.data),
//     staleTime: 1000 * 60 * 5,
//   });
// }

// export function useDashboardLists() {
//   return useQuery({
//     queryKey: dashboardKeys.lists(),
//     queryFn: () => dashboardService.getLists().then((r) => r.data.data),
//     staleTime: 1000 * 30,
//     refetchInterval: 1000 * 60,
//   });
// }

// src/features/dashboard/hooks/useDashboard.ts

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  metrics: () => [...dashboardKeys.all, "metrics"] as const,
  charts: () => [...dashboardKeys.all, "charts"] as const,
  lists: () => [...dashboardKeys.all, "lists"] as const,
};

export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: async () => {
      const res = await dashboardService.getMetrics();
      // Handle both shapes: { data: { success, data } } and { success, data }
      const body = res.data as any;
      // const payload = body?.data ?? body;
      const payload = body?.data?.data ?? body?.data ?? body;
      if (!payload?.activePassengers) throw new Error("Unexpected metrics shape");
      return payload;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: dashboardKeys.charts(),
    queryFn: async () => {
      const res = await dashboardService.getCharts();
      const body = res.data as any;
      const payload = body?.data?.data ?? body?.data ?? body;
      if (!payload) throw new Error("Empty charts response");
      return payload;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useDashboardLists() {
  return useQuery({
    queryKey: dashboardKeys.lists(),
    queryFn: async () => {
      const res = await dashboardService.getLists();
      const body = res.data as any;
      const payload = body?.data?.data ?? body?.data ?? body;
      if (!payload) throw new Error("Empty lists response");
      return payload;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}
