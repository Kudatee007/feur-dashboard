// src/services/passengers.service.ts
import api from "../lib/axios";

export interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  totalRides: number;
  totalSpent: number;
  // add more fields as the API returns them
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const passengersService = {
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get<PaginatedResponse<Passenger>>("/passengers", { params }),

  getById: (id: string) =>
    api.get<Passenger>(`/passengers/${id}`),

  suspend: (id: string) =>
    api.patch(`/passengers/${id}/suspend`),

  reactivate: (id: string) =>
    api.patch(`/passengers/${id}/reactivate`),
};