"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { useLogout } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BookOpen, LayoutDashboard, GraduationCap } from "lucide-react";

function NavLink({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: React.ElementType }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1e2d4a] bg-[#080c14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-slate-100">EduTech <span className="text-blue-400">Pro</span></span>
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink href="/cursos" icon={BookOpen}>Cursos</NavLink>
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
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-[#1e2d4a] bg-[#0e1525] px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/20 text-[10px] font-bold text-blue-400">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="text-sm text-slate-300">{user.firstName}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-500/20 text-purple-400'
                    : user.role === 'INSTRUCTOR'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {user.role}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate(undefined, { onSuccess: () => router.push('/login') })}
                disabled={logoutMutation.isPending}
                className="border-[#1e2d4a] text-slate-400 hover:text-slate-100 hover:border-slate-600 text-xs"
              >
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-[#1e2d4a] text-slate-400 hover:text-slate-100 text-xs">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/registro">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
