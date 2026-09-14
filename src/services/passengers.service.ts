// // src/services/passengers.service.ts
// import api from "../lib/axios";

// // export interface Passenger {
// //   id: string;
// //   name: string;
// //   email: string;
// //   phone: string;
// //   status: "active" | "inactive";
// //   totalRides: number;
// //   totalSpent: number;
// //   // add more fields as the API returns them
// // }

// export interface Passenger {
//   id: string;
//   userId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   dateOfBirth: string;
//   state: string;
//   city: string;
//   gender: string;
//   homeAddress: string;
//   workAddress: string | null;
//   profilePicture: string | null;
//   validId: string | null;
//   ratings: unknown[];
//   referralCode: string | null;
//   referredBy: string | null;
//   status: "active" | "inactive" | "suspended" | "blocked";
//   verificationStatus: string;
//   accountType: "passenger";
//   createdAt: string;
//   updatedAt: string;
//   _id: string;
// }

// export interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   limit: number;
// }

// export const passengersService = {
//   getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
//     api.get<PaginatedResponse<Passenger>>("/passengers", { params }),

//   getById: (id: string) =>
//     api.get<Passenger>(`/passengers/${id}`),

//   suspend: (id: string) =>
//     api.patch(`/passengers/${id}/suspend`),

//   reactivate: (id: string) =>
//     api.patch(`/passengers/${id}/reactivate`),
// };


// src/features/users/services/passengers.service.ts

import api from "../lib/axios";

export const passengersService = {
  // GET /api/v1/admins/dashboard/passengers  (dashboard list with KPIs)
  getPassengers: (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}) =>
    api.get("/api/v1/admins/dashboard/passengers", { params }),

  // GET /api/v1/passengers/{id}  ← THIS was wrong before (missing /api/v1/)
  getPassengerById: (id: string) =>
    api.get(`/api/v1/passengers/${id}`),

  // PATCH /api/v1/passengers/status/{id}
  updatePassengerStatus: (id: string, payload: { status: string }) =>
    api.patch(`/api/v1/passengers/status/${id}`, payload),
};