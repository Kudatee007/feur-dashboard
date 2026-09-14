// // // // src/hooks/usePassengers.ts
// // // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // // import { passengersService } from "../services/passengers.service";

// // // export function usePassengers(params?: { page?: number; search?: string; status?: string }) {
// // //   return useQuery({
// // //     queryKey: ["passengers", params],
// // //     queryFn: () => passengersService.getAll(params).then((r) => r.data),
// // //   });
// // // }

// // // // export function usePassenger(id: string) {
// // // //   return useQuery({
// // // //     queryKey: ["passengers", id],
// // // //     queryFn: () => passengersService.getById(id).then((r) => r.data),
// // // //     enabled: !!id,
// // // //   });
// // // // }

// // // export function usePassenger(id: string) {
// // //   return useQuery({
// // //     queryKey: ["passengers", id],
// // //     queryFn: () => passengersService.getById(id).then((r) => r.data),
// // //     enabled: !!id,
// // //   });
// // // }

// // // export function useSuspendPassenger() {
// // //   const queryClient = useQueryClient();
// // //   return useMutation({
// // //     mutationFn: (id: string) => passengersService.suspend(id),
// // //     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["passengers"] }),
// // //   });
// // // }

// // // src/features/users/hooks/usePassengers.ts

// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import { passengersService } from "../services/passengers.service";

// // export const passengerKeys = {
// //   all:    ["passengers"] as const,
// //   list:   (params: object) => [...passengerKeys.all, "list", params] as const,
// //   detail: (id: string)     => [...passengerKeys.all, "detail", id] as const,
// // };

// // // ── Unwrap helper ─────────────────────────────────────────────────────────────
// // // Swagger shows: { status: "success", data: { message: "...", data: { ...passenger } } }
// // // Through axios that arrives as res.data = { status, data: { message, data: passenger } }
// // function unwrapDetail(res: any) {
// //   const body = res.data;
// //   // Handle: body.data.data  OR  body.data  OR  body
// //   return body?.data?.data ?? body?.data ?? body;
// // }

// // function unwrapList(res: any) {
// //   const body = res.data;
// //   return body?.data?.data ?? body?.data ?? body;
// // }

// // export function usePassengers(params: {
// //   page?: number;
// //   limit?: number;
// //   search?: string;
// //   status?: string;
// // } = {}) {
// //   return useQuery({
// //     queryKey: passengerKeys.list(params),
// //     queryFn: async () => {
// //       const res = await passengersService.getPassengers(params);
// //       return unwrapList(res);
// //     },
// //     staleTime: 1000 * 30,
// //     placeholderData: (prev) => prev,
// //   });
// // }

// // export function usePassengerDetail(id: string | null) {
// //   return useQuery({
// //     queryKey: passengerKeys.detail(id ?? ""),
// //     queryFn: async () => {
// //       const res = await passengersService.getPassengerById(id!);
// //       const payload = unwrapDetail(res);

// //       // Swagger response shape uses "id" not "passengerId" — normalise it
// //       return {
// //         ...payload,
// //         passengerId: payload.id ?? payload._id ?? payload.passengerId,
// //       };
// //     },
// //     enabled: !!id,
// //     staleTime: 1000 * 30,
// //   });
// // }

// // export function useUpdatePassengerStatus() {
// //   const queryClient = useQueryClient();

// //   return useMutation({
// //     mutationFn: ({ id, status }: { id: string; status: string }) =>
// //       passengersService.updatePassengerStatus(id, { status }),
// //     onSuccess: (_data, variables) => {
// //       queryClient.invalidateQueries({ queryKey: passengerKeys.all });
// //       queryClient.invalidateQueries({ queryKey: passengerKeys.detail(variables.id) });
// //     },
// //   });
// // }

// // src/features/users/hooks/usePassengers.ts

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { passengersService } from "../services/passengers.service";
// import type { PassengerDetail, PassengersDashboard } from "../types/users.types";

// export const passengerKeys = {
//   all:    ["passengers"] as const,
//   list:   (params: object) => [...passengerKeys.all, "list", params] as const,
//   detail: (id: string)     => [...passengerKeys.all, "detail", id] as const,
// };

// function unwrapDetail(res: any): PassengerDetail {
//   const body = res.data;
//   const payload = body?.data?.data ?? body?.data ?? body;
//   return {
//     ...payload,
//     // normalise: real API uses "id", add passengerId alias
//     passengerId: payload.id ?? payload._id ?? payload.passengerId,
//   } as PassengerDetail;
// }

// function unwrapList(res: any): PassengersDashboard {
//   const body = res.data;
//   return (body?.data?.data ?? body?.data ?? body) as PassengersDashboard;
// }

// export function usePassengers(params: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   status?: string;
// } = {}) {
//   return useQuery({
//     queryKey: passengerKeys.list(params),
//     queryFn: async () => {
//       const res = await passengersService.getPassengers(params);
//       return unwrapList(res);
//     },
//     staleTime: 1000 * 30,
//     placeholderData: (prev) => prev,
//   });
// }

// export function usePassengerDetail(id: string | null) {
//   return useQuery({
//     queryKey: passengerKeys.detail(id ?? ""),
//     queryFn: async (): Promise<PassengerDetail> => {
//       const res = await passengersService.getPassengerById(id!);
//       return unwrapDetail(res);
//     },
//     enabled: !!id,
//     staleTime: 1000 * 30,
//   });
// }

// export function useUpdatePassengerStatus() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, status }: { id: string; status: string }) =>
//       passengersService.updatePassengerStatus(id, { status }),
//     onSuccess: (_data, variables) => {
//       queryClient.invalidateQueries({ queryKey: passengerKeys.all });
//       queryClient.invalidateQueries({
//         queryKey: passengerKeys.detail(variables.id),
//       });
//     },
//   });
// }