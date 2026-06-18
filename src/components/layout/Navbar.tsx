"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { useLogout } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BookOpen, LayoutDashboard } from "lucide-react";

function NavLink({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: React.ElementType }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-white/10 text-white border border-white/20'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0F1E3C]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="Kore Training & Consulting" width={160} height={48} className="h-10 w-auto brightness-0 invert" />
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-1">
          {pathname !== '/' && <NavLink href="/cursos" icon={BookOpen}>Cursos</NavLink>}
          {isAuthenticated && user?.role === 'STUDENT' && (
            <NavLink href="/dashboard" icon={LayoutDashboard}>Mi aprendizaje</NavLink>
          )}
          {isAuthenticated && user?.role === 'INSTRUCTOR' && (
            <NavLink href="/dashboard" icon={LayoutDashboard}>Mi panel</NavLink>
          )}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <NavLink href="/dashboard" icon={LayoutDashboard}>Admin</NavLink>
          )}
        </div>

        {/* Auth section */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="text-sm text-white">{user.firstName}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-500/30 text-purple-200'
                    : user.role === 'INSTRUCTOR'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-500/30 text-emerald-200'
                }`}>
                  {user.role}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate(undefined, { onSuccess: () => router.push('/login') })}
                disabled={logoutMutation.isPending}
                className="border-white/30 text-white hover:text-white hover:border-white/60 hover:bg-white/10 text-xs"
              >
                Salir
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-[#F97316] hover:bg-[#EA6D0E] text-white text-xs font-semibold shadow-lg shadow-[#F97316]/30">
                Ingresar al Aula Virtual
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
