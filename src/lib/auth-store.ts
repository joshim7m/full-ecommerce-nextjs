"use client";

import { create } from "zustand";
import { apiClient, setAccessToken, ApiError } from "./api-client";

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: "USER" | "ADMIN" | "MANAGER";
  status: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const { user, accessToken: token } = res.data;
      setAccessToken(token);
      localStorage.setItem("bp_access_token", token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Login failed", isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setAccessToken(null);
    localStorage.removeItem("bp_access_token");
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // 1. Try stored access token from localStorage
      const token = localStorage.getItem("bp_access_token");
      if (token) {
        setAccessToken(token);
        try {
          const res: any = await apiClient("/auth/me");
          set({ user: res.data, isAuthenticated: true, isLoading: false });
          return;
        } catch (err: any) {
          // Only attempt refresh on 401 (expired token)
          if (!(err instanceof ApiError && err.status === 401)) {
            throw err;
          }
          setAccessToken(null);
        }
      }

      // 2. Try refresh using HttpOnly bp_refresh_token cookie
      //    (browser sends it automatically for /api/v1/auth/* paths)
      const refreshRes: any = await apiClient("/auth/refresh", { method: "POST" });
      const { user, accessToken: newToken } = refreshRes.data;
      setAccessToken(newToken);
      localStorage.setItem("bp_access_token", newToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      setAccessToken(null);
      localStorage.removeItem("bp_access_token");
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
