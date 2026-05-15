"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";

/**
 * Renders nothing. If the user is already authenticated,
 * replaces the current history entry with /dashboard.
 * Placed in the landing page so it stays a server component.
 */
export function HomeRedirect() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  return null;
}
