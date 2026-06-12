// src/features/auth/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  setAuth: (token: string, admin: AdminUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      setAuth: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: "feur-auth" } // this is the localStorage key your axios reads
  )
);