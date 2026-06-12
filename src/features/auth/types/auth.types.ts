// src/features/auth/types/auth.types.ts
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    admin: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}