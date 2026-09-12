'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Clock3, Trophy, TrendingUp, CheckCircle, XCircle,
  Globe, Eye, Users, GraduationCap, BarChart3,
  ChevronLeft, ChevronRight, Loader2, Receipt,
} from 'lucide-react';
import { getAdminStats, type AdminStats } from '@/lib/api/admin';
import { StatTile } from '@/components/ui/stat-tile';
import { getUsers, updateUserRole, type UsersResponse } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth.store';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Adaptador: las llamadas siguen pasando color/bg, pero el render es el común.
// El color por tarjeta se ignora a propósito — era lo que descuadraba los paneles.
function StatCard({
  label, value, icon,
}: {
  label: string; value: number; icon: React.ElementType;
  color?: string; bg?: string;
}) {
  return <StatTile label={label} value={value} icon={icon} />;
}

const ROLE_BADGE: Record<User['role'], string> = {
  STUDENT: 'border-success/30 bg-success/10 text-success',
  INSTRUCTOR: 'border-border bg-muted text-foreground',
  ADMIN: 'border-ai-500/30 bg-ai-50 text-ai-700',
};

const ROLE_LABEL: Record<User['role'], string> = {
  STUDENT: 'Estudiante',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Admin',
};

// ─── Stats section ─────────────────────────────────────────────────────────────

function StatsSection() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Users */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Usuarios</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.users.total} icon={Users} color="text-foreground" bg="bg-secondary/80 border-border" />
          <StatCard label="Estudiantes" value={stats.users.students} icon={GraduationCap} color="text-success" bg="bg-success/10 border-success/20" />
          <StatCard label="Instructores" value={stats.users.instructors} icon={BookOpen} color="text-foreground" bg="bg-muted border-border" />
          <StatCard label="Admins" value={stats.users.admins} icon={BarChart3} color="text-ai-700" bg="bg-ai-500/10 border-ai-500/20" />
        </div>
      </section>

      {/* Courses */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Cursos</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total" value={stats.courses.total} icon={BookOpen} color="text-foreground" bg="bg-secondary/80 border-border" />
          <StatCard label="Publicados" value={stats.courses.published} icon={Globe} color="text-success" bg="bg-success/10 border-success/20" />
          <StatCard label="Borradores" value={stats.courses.drafts} icon={BookOpen} color="text-warning-foreground" bg="bg-warning/10 border-warning/20" />
        </div>
      </section>

      {/* Enrollments */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Inscripciones</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.enrollments.total} icon={TrendingUp} color="text-foreground" bg="bg-secondary/80 border-border" />
          <StatCard label="Aprobadas" value={stats.enrollments.approved} icon={CheckCircle} color="text-success" bg="bg-success/10 border-success/20" />
          <StatCard label="Pendientes" value={stats.enrollments.pending} icon={Clock3} color="text-warning-foreground" bg="bg-warning/10 border-warning/20" />
          <StatCard label="Rechazadas" value={stats.enrollments.rejected} icon={XCircle} color="text-destructive" bg="bg-destructive/10 border-destructive/20" />
        </div>
      </section>

      {/* Top courses */}
      {stats.topCourses.length > 0 && (
        <section>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Trophy className="inline h-3.5 w-3.5 text-warning-foreground mr-1" />
            Cursos más populares
          </p>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {stats.topCourses.map((course, idx) => (
              <div
                key={course.id}
                className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors"
              >
                <span className="text-lg font-black text-muted-foreground w-6 shrink-0 text-center">{idx + 1}</span>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />
                ) : (
                  <div className="h-10 w-14 shrink-0 rounded-md bg-secondary flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <span className="flex-1 text-sm font-medium text-foreground truncate">{course.title}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-bold text-success">{course.studentCount}</span>
                  <span className="text-xs text-muted-foreground">estudiantes</span>
                </div>
                <Link
                  href={`/cursos/${course.slug}`}
                  className="shrink-0 rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Users management section ─────────────────────────────────────────────────

function UsersSection() {
  const { user: currentUser } = useAuthStore();
  const [response, setResponse] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'ALL' | User['role']>('ALL');

  const fetchPage = async (p: number) => {
    setLoading(true);
    try {
      const res = await getUsers(p, 20);
      setResponse(res);
      setPage(p);
    } catch {
      toast.error('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPage(1); }, []);

  const handleRoleChange = async (userId: string, newRole: 'STUDENT' | 'INSTRUCTOR') => {
    setActionLoading(userId);
    try {
      const updated = await updateUserRole(userId, newRole);
      setResponse((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)),
            }
          : prev,
      );
      toast.success(
        newRole === 'INSTRUCTOR'
          ? 'Usuario promovido a Instructor'
          : 'Usuario cambiado a Estudiante',
      );
    } catch (err: any) {
      toast.error(err?.message || 'Error al cambiar rol');
    } finally {
      setActionLoading(null);
    }
  };

  const users = response?.data ?? [];
  const meta = response?.meta;
  const filtered = filterRole === 'ALL' ? users : users.filter((u) => u.role === filterRole);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Gestión de usuarios</p>

        {/* Role filter */}
        <div className="flex items-center gap-2">
          {(['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filterRole === r
                  ? r === 'INSTRUCTOR'
                    ? 'border-border bg-muted text-foreground'
                    : r === 'ADMIN'
                    ? 'border-ai-500/50 bg-ai-50 text-ai-700'
                    : r === 'STUDENT'
                    ? 'border-success/50 bg-success/10 text-success'
                    : 'border-border bg-secondary text-foreground'
                  : 'border-border text-muted-foreground hover:border-border'
              }`}
            >
              {r === 'ALL' ? 'Todos' : ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay usuarios con ese filtro
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {filtered.map((u) => {
            const isSelf = u.id === currentUser?.id;
            const isChanging = actionLoading === u.id;

            return (
              <div
                key={u.id}
                className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                  {u.firstName[0]}{u.lastName[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    {isSelf && (
                      <span className="text-[10px] text-muted-foreground">(tú)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>

                {/* Role badge */}
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${ROLE_BADGE[u.role]}`}>
                  {ROLE_LABEL[u.role]}
                </span>

                {/* Action */}
                {!isSelf && u.role !== 'ADMIN' && (
                  u.role === 'STUDENT' ? (
                    <Button
                      size="sm"
                      className="shrink-0 bg-navy hover:bg-navy-800 h-7 px-3 text-xs shadow-sm shadow-navy/20"
                      disabled={isChanging}
                      onClick={() => handleRoleChange(u.id, 'INSTRUCTOR')}
                    >
                      {isChanging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Hacer instructor'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 h-7 px-3 text-xs"
                      disabled={isChanging}
                      onClick={() => handleRoleChange(u.id, 'STUDENT')}
                    >
                      {isChanging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Quitar instructor'}
                    </Button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.lastPage > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {meta.total} usuarios · página {page} de {meta.lastPage}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-border h-7 px-2 text-muted-foreground"
              disabled={page <= 1 || loading}
              onClick={() => fetchPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-border h-7 px-2 text-muted-foreground"
              disabled={page >= meta.lastPage || loading}
              onClick={() => fetchPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Main AdminPanel ───────────────────────────────────────────────────────────

// Accesos a la vista transaccional. Viven en sus propias rutas para no
// engordar este panel.
function TransactionalLinks() {
  const links = [
    {
      href: '/dashboard/admin/pagos',
      title: 'Pagos',
      description: 'Validar comprobantes y dar acceso a los programas',
      icon: Receipt,
    },
    {
      href: '/dashboard/admin/ingresos',
      title: 'Ingresos',
      description: 'Cuánto se ha generado con la venta de programas',
      icon: TrendingUp,
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">Administración</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-card"
          >
            <div className="mb-3 inline-flex rounded-xl bg-muted p-2.5">
              <link.icon className="h-5 w-5 text-navy" />
            </div>
            <p className="font-semibold">{link.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function AdminPanel() {
  return (
    <div className="space-y-10">
      <StatsSection />
      <TransactionalLinks />
      <UsersSection />
    </div>
  );
}
