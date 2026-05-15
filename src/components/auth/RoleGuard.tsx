"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = "/dashboard" }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && !allowedRoles.includes(user.role)) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, user]);

  // While loading, show spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080c14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated or wrong role → render nothing (redirect in flight)
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
