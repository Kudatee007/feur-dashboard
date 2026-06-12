import api from "../../../lib/axios";
import type { LoginPayload, LoginResponse } from "../types/auth.types";

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/api/v1/admins/login", payload),

  logout: () =>
    api.post("/api/v1/admins/logout"),
};