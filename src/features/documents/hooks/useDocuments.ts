import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentsService,
  type QueueParams,
} from "../services/documents.services";
import type { UpdateStatusPayload } from "../types/documents.types";

export const documentKeys = {
  all: ["documents"] as const,
  driverQueue: (params?: QueueParams) =>
    [...documentKeys.all, "driver-queue", params] as const,
  driverDetail: (id: string) =>
    [...documentKeys.all, "driver-detail", id] as const,
  passengerQueue: (params?: QueueParams) =>
    [...documentKeys.all, "passenger-queue", params] as const,
  passengerDetail: (id: string) =>
    [...documentKeys.all, "passenger-detail", id] as const,
};

// ─── Driver hooks ─────────────────────────────────────────────────────────────

export function useDriverQueue(params?: QueueParams) {
  return useQuery({
    queryKey: documentKeys.driverQueue(params),
    queryFn: async () => {
      const res = await documentsService.getDriverQueue(params);
      const body = res.data as any;
      return body?.data?.data ?? body?.data ?? body;
    },
    staleTime: 1000 * 30,
  });
}

export function useDriverDetail(driverId: string) {
  return useQuery({
    queryKey: documentKeys.driverDetail(driverId),
    queryFn: async () => {
      const res = await documentsService.getDriverDetail(driverId);
      const body = res.data as any;
      return body?.data?.data ?? body?.data ?? body;
    },
    enabled: !!driverId,
    staleTime: 1000 * 60,
  });
}

export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      driverId,
      payload,
    }: {
      driverId: string;
      payload: UpdateStatusPayload;
    }) => documentsService.updateDriverStatus(driverId, payload),
    onSuccess: () => {
      // Invalidate both queue and detail
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

// ─── Passenger hooks ──────────────────────────────────────────────────────────

export function usePassengerQueue(params?: QueueParams) {
  return useQuery({
    queryKey: documentKeys.passengerQueue(params),
    queryFn: async () => {
      const res = await documentsService.getPassengerQueue(params);
      const body = res.data as any;
      return body?.data?.data ?? body?.data ?? body;
    },
    staleTime: 1000 * 30,
  });
}

export function usePassengerDetail(passengerId: string) {
  return useQuery({
    queryKey: documentKeys.passengerDetail(passengerId),
    queryFn: async () => {
      const res = await documentsService.getPassengerDetail(passengerId);
      const body = res.data as any;
      return body?.data?.data ?? body?.data ?? body;
    },
    enabled: !!passengerId,
    staleTime: 1000 * 60,
  });
}

export function useUpdatePassengerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      passengerId,
      payload,
    }: {
      passengerId: string;
      payload: UpdateStatusPayload;
    }) => documentsService.updatePassengerStatus(passengerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}
