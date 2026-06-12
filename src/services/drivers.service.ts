// src/services/drivers.service.ts
import api from "../lib/axios";

export const driversService = {
  getAll: (params?: { page?: number; status?: string; search?: string }) =>
    api.get("/drivers", { params }),

  getById: (id: string) =>
    api.get(`/drivers/${id}`),

  approve: (id: string) =>
    api.patch(`/drivers/${id}/approve`),

  suspend: (id: string) =>
    api.patch(`/drivers/${id}/suspend`),

  block: (id: string) =>
    api.patch(`/drivers/${id}/block`),
};