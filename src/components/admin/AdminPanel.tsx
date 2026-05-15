'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Clock3, Trophy, TrendingUp, CheckCircle, XCircle,
  Globe, Eye, Users, GraduationCap, BarChart3,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { getAdminStats, type AdminStats } from '@/lib/api/admin';
import { getUsers, updateUserRole, type UsersResponse } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth.store';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color, bg,
}: {
  label: string; value: number; icon: React.ElementType;
  color: string; bg: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border bg-[#0e1525] p-5 ${bg}`}>
      <div className={`rounded-xl p-3 ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

const ROLE_BADGE: Record<User['role'], string> = {
  STUDENT: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  INSTRUCTOR: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  ADMIN: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
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
          <div key={i} className="h-20 rounded-xl border border-[#1e2d4a] bg-[#0e1525] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Users */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Usuarios</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.users.total} icon={Users} color="text-slate-300" bg="bg-[#162038]/80 border-[#1e2d4a]" />
          <StatCard label="Estudiantes" value={stats.users.students} icon={GraduationCap} color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
          <StatCard label="Instructores" value={stats.users.instructors} icon={BookOpen} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/20" />
          <StatCard label="Admins" value={stats.users.admins} icon={BarChart3} color="text-purple-400" bg="bg-purple-500/10 border-purple-500/20" />
        </div>
      </section>

      {/* Courses */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Cursos</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total" value={stats.courses.total} icon={BookOpen} color="text-slate-300" bg="bg-[#162038]/80 border-[#1e2d4a]" />
          <StatCard label="Publicados" value={stats.courses.published} icon={Globe} color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
          <StatCard label="Borradores" value={stats.courses.drafts} icon={BookOpen} color="text-amber-400" bg="bg-amber-500/10 border-amber-500/20" />
        </div>
      </section>

      {/* Enrollments */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Inscripciones</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.enrollments.total} icon={TrendingUp} color="text-slate-300" bg="bg-[#162038]/80 border-[#1e2d4a]" />
          <StatCard label="Aprobadas" value={stats.enrollments.approved} icon={CheckCircle} color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
          <StatCard label="Pendientes" value={stats.enrollments.pending} icon={Clock3} color="text-amber-400" bg="bg-amber-500/10 border-amber-500/20" />
          <StatCard label="Rechazadas" value={stats.enrollments.rejected} icon={XCircle} color="text-red-400" bg="bg-red-500/10 border-red-500/20" />
        </div>
      </section>

      {/* Top courses */}
      {stats.topCourses.length > 0 && (
        <section>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            <Trophy className="inline h-3.5 w-3.5 text-amber-400 mr-1" />
            Cursos más populares
          </p>
          <div className="rounded-xl border border-[#1e2d4a] bg-[#0e1525] overflow-hidden">
            {stats.topCourses.map((course, idx) => (
              <div
                key={course.id}
                className="flex items-center gap-4 px-5 py-3 border-b border-[#1e2d4a] last:border-0 hover:bg-blue-600/5 transition-colors"
              >
                <span className="text-lg font-black text-slate-700 w-6 shrink-0 text-center">{idx + 1}</span>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />
                ) : (
                  <div className="h-10 w-14 shrink-0 rounded-md bg-[#162038] flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-slate-600" />
                  </div>
                )}
                <span className="flex-1 text-sm font-medium text-slate-200 truncate">{course.title}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-sm font-bold text-emerald-400">{course.studentCount}</span>
                  <span className="text-xs text-slate-600">estudiantes</span>
                </div>
                <Link
                  href={`/cursos/${course.slug}`}
                  className="shrink-0 rounded-lg border border-[#1e2d4a] p-1.5 text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors"
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
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Gestión de usuarios</p>

        {/* Role filter */}
        <div className="flex items-center gap-2">
          {(['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filterRole === r
                  ? r === 'INSTRUCTOR'
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                    : r === 'ADMIN'
                    ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                    : r === 'STUDENT'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-[#1e2d4a] bg-[#162038] text-slate-300'
                  : 'border-[#1e2d4a] text-slate-500 hover:border-slate-600'
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
            <div key={i} className="h-14 rounded-xl border border-[#1e2d4a] bg-[#0e1525] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#1e2d4a] bg-[#0e1525] p-8 text-center text-sm text-slate-500">
          No hay usuarios con ese filtro
        </div>
      ) : (
        <div className="rounded-xl border border-[#1e2d4a] bg-[#0e1525] overflow-hidden">
          {filtered.map((u) => {
            const isSelf = u.id === currentUser?.id;
            const isChanging = actionLoading === u.id;

            return (
              <div
                key={u.id}
                className="flex items-center gap-4 px-5 py-3 border-b border-[#1e2d4a] last:border-0 hover:bg-blue-600/5 transition-colors"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#162038] text-sm font-bold text-slate-400">
                  {u.firstName[0]}{u.lastName[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    {isSelf && (
                      <span className="text-[10px] text-slate-600">(tú)</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
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
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 h-7 px-3 text-xs shadow-sm shadow-blue-600/20"
                      disabled={isChanging}
                      onClick={() => handleRoleChange(u.id, 'INSTRUCTOR')}
                    >
                      {isChanging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Hacer instructor'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-[#1e2d4a] text-slate-400 hover:text-red-400 hover:border-red-500/30 h-7 px-3 text-xs"
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
          <span className="text-xs text-slate-500">
            {meta.total} usuarios · página {page} de {meta.lastPage}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-[#1e2d4a] h-7 px-2 text-slate-400"
              disabled={page <= 1 || loading}
              onClick={() => fetchPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[#1e2d4a] h-7 px-2 text-slate-400"
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

export function AdminPanel() {
  return (
    <div className="space-y-10">
      <StatsSection />
      <UsersSection />
    </div>
  );
}
