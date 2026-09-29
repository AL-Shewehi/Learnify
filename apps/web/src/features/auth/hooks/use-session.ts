"use client";

import { useEffect } from "react";
import { authApi } from "../api/auth-api";
import { useAuthStore } from "../store/auth-store";

export function useSession() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;

    authApi
      .me()
      .then((user) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, [setUser]);
}