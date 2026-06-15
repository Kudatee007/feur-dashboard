import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/users.service";
import type { ListQueryParams, UpdateStatusPayload } from "../types/users.types";

export const passengerKeys = {
  all: ["passengers"] as const,
  list: (params: ListQueryParams) => [...passengerKeys.all, "list", params] as const,
  detail: (id: string) => [...passengerKeys.all, "detail", id] as const,
};

function unwrap<T>(res: any): T {
  const body = res.data as any;
  return (body?.data?.data ?? body?.data ?? body) as T;
}

export function usePassengers(params: ListQueryParams = {}) {
  return useQuery({
    queryKey: passengerKeys.list(params),
    queryFn: async () => {
      const res = await usersService.getPassengers(params);
      return unwrap<import("../types/users.types").PassengersDashboard>(res);
    },
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });
}

export function usePassengerDetail(id: string | null) {
  return useQuery({
    queryKey: passengerKeys.detail(id ?? ""),
    queryFn: async () => {
      const res = await usersService.getPassengerById(id as string);
      return unwrap<import("../types/users.types").PassengerDetail>(res);
    },
    enabled: !!id,
    staleTime: 1000 * 30,
  });
}

export function useUpdatePassengerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusPayload }) =>
      usersService.updatePassengerStatus(id, payload).then((r) => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: passengerKeys.all });
      queryClient.invalidateQueries({ queryKey: passengerKeys.detail(variables.id) });
    },
  });
}