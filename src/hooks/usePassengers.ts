// src/hooks/usePassengers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { passengersService } from "../services/passengers.service";

export function usePassengers(params?: { page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ["passengers", params],
    queryFn: () => passengersService.getAll(params).then((r) => r.data),
  });
}

export function usePassenger(id: string) {
  return useQuery({
    queryKey: ["passengers", id],
    queryFn: () => passengersService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useSuspendPassenger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => passengersService.suspend(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["passengers"] }),
  });
}