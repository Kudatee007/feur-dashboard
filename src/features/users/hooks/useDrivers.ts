// src/features/users/hooks/useDrivers.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/users.service";
import type { ListQueryParams, UpdateStatusPayload } from "../types/users.types";

export const driverKeys = {
  all: ["drivers"] as const,
  list: (params: ListQueryParams) => [...driverKeys.all, "list", params] as const,
  detail: (id: string) => [...driverKeys.all, "detail", id] as const,
};

function unwrap<T>(res: any): T {
  const body = res.data as any;
  return (body?.data?.data ?? body?.data ?? body) as T;
}

export function useDrivers(params: ListQueryParams = {}) {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn: async () => {
      const res = await usersService.getDrivers(params);
      return unwrap<import("../types/users.types").DriversDashboard>(res);
    },
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });
}

export function useDriverDetail(id: string | null) {
  return useQuery({
    queryKey: driverKeys.detail(id ?? ""),
    queryFn: async () => {
      const res = await usersService.getDriverById(id as string);
      return unwrap<import("../types/users.types").DriverDetail>(res);
    },
    enabled: !!id,
    staleTime: 1000 * 30,
  });
}

export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusPayload }) =>
      usersService.updateDriverStatus(id, payload).then((r) => r.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(variables.id) });
    },
  });
}