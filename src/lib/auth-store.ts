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
      const { user, accessToken: token } = res;
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
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem("bp_access_token");
      if (token) {
        setAccessToken(token);
        const res: any = await apiClient("/auth/me");
        set({ user: res.user, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch {
      // token invalid or expired
    }
    setAccessToken(null);
    localStorage.removeItem("bp_access_token");
    set({ isLoading: false });
  },

  clearError: () => set({ error: null }),
}));
