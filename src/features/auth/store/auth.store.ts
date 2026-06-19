import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  setAuth: (token: string, admin: AdminUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      setAuth: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "feur-auth",
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);