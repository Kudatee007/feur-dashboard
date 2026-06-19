export interface LoginPayload {
  email: string;
  password: string;
}

export interface AdminUser {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export interface LoginResponse {
  status: string;
  data: {
    message: string;
    accessToken: string;
    refreshToken: string;
    data: AdminUser;
  };
}