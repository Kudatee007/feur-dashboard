import { useQuery } from "@tanstack/react-query";
import { ridesService } from "../services/rides.services";
import type {
  ActiveRidesParams,
  RideHistoryParams,
} from "../types/rides.types";

export const rideKeys = {
  all: ["rides"] as const,
  active: (params?: ActiveRidesParams) =>
    [...rideKeys.all, "active", params] as const,
  history: (params?: RideHistoryParams) =>
    [...rideKeys.all, "history", params] as const,
  detail: (id: string) => [...rideKeys.all, "detail", id] as const,
};

export function useActiveRides(params?: ActiveRidesParams) {
  return useQuery({
    queryKey: rideKeys.active(params),
    queryFn: async () => {
      const res = await ridesService.getActiveRides(params);
      const body = res.data as any;
      return body?.data?.data ?? body?.data ?? body;
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}

export function useRideHistory(params?: RideHistoryParams) {
  return useQuery({
    queryKey: rideKeys.history(params),
    queryFn: async () => {
      const res = await ridesService.getRideHistory(params);
      const body = res.data as any;
      return body?.data?.data ?? body?.data ?? body;
    },
    staleTime: 1000 * 60,
  });
}

export function useRideDetail(id: string) {
  return useQuery({
    queryKey: rideKeys.detail(id),
    queryFn: async () => {
      const res = await ridesService.getRideById(id);
      const body = res.data as any;
      return body?.data?.data ?? body?.data ?? body;
    },
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}
