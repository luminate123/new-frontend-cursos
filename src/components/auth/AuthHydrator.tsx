"use client";

import { useEffect } from "react";
import { useHydrate } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/store/auth.store";

export function AuthHydrator() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  useHydrate();

  // If no token exists, isLoading stays true forever (useHydrate is disabled).
  // Call clearAuth immediately so isLoading → false and guards can redirect.
  useEffect(() => {
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken");
    if (!hasToken) clearAuth();
  }, []);

  return null;
}
