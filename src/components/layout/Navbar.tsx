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
          ? 'bg-stone-900/10 text-stone-900 border border-stone-900/20'
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-900/5'
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
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/image 2.svg" alt="Kore Training & Consulting" width={160} height={48} className="h-10 w-auto" />
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
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900/10 text-[10px] font-bold text-stone-700">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="text-sm text-stone-700">{user.firstName}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-500/20 text-purple-700'
                    : user.role === 'INSTRUCTOR'
                    ? 'bg-stone-900/10 text-stone-700'
                    : 'bg-emerald-500/20 text-emerald-700'
                }`}>
                  {user.role}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate(undefined, { onSuccess: () => router.push('/login') })}
                disabled={logoutMutation.isPending}
                className="border-border text-stone-600 hover:text-stone-900 hover:border-stone-700 text-xs"
              >
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-border text-stone-600 hover:text-stone-900 text-xs">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/registro">
                <Button size="sm" className="bg-stone-900 hover:bg-stone-800 text-background text-xs font-semibold">
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
