"use client"
import {create} from "zustand";
import { setUnauthorizedHandler } from "@/lib/api";
import type { UserResponse } from "@learnify/shared";

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: UserResponse | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    setUser: (user) => set({ user, isAuthenticated: !!user, isInitialized: true }),
}))

setUnauthorizedHandler(() => {
    useAuthStore.getState().setUser(null);
    if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path !== "/login" && !path.startsWith("/login?")) {
            window.location.href = "/login";
        }
    }
})