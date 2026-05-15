'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Clock3, Trophy, TrendingUp, Play, XCircle, CheckCircle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CourseCard } from '@/components/courses/CourseCard';
import { useAuthStore } from '@/lib/store/auth.store';
import { getMyEnrollments } from '@/lib/api/courses';
import { InstructorPanel } from '@/components/instructor/InstructorPanel';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { Button } from '@/components/ui/button';
import type { Enrollment } from '@/lib/types';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Enrollment['status'] }) {
  if (status === 'APPROVED') return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
      <CheckCircle className="h-3 w-3" /> Aprobado
    </span>
  );
  if (status === 'PENDING') return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
      <Clock3 className="h-3 w-3" /> Pendiente
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
      <XCircle className="h-3 w-3" /> Rechazado
    </span>
  );
}

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

// ─── Student view ─────────────────────────────────────────────────────────────

function StudentView() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEnrollments()
      .then(setEnrollments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approved = enrollments.filter((e) => e.status === 'APPROVED');
  const pending = enrollments.filter((e) => e.status === 'PENDING');
  const rejected = enrollments.filter((e) => e.status === 'REJECTED');
  const inProgress = approved.filter((e) => e.progressPercentage > 0 && e.progressPercentage < 100);
  const completed = approved.filter((e) => e.progressPercentage === 100);

  return (
    <div>
      {/* Stats */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <StatCard label="Cursos aprobados" value={approved.length} icon={BookOpen} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/20" />
        <StatCard label="En progreso" value={inProgress.length} icon={TrendingUp} color="text-indigo-400" bg="bg-indigo-500/10 border-indigo-500/20" />
        <StatCard label="Completados" value={completed.length} icon={Trophy} color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold">Solicitudes pendientes</h2>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
              {pending.length}
            </span>
          </div>
          <div className="grid gap-3">
            {pending.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between rounded-xl border border-[#1e2d4a] bg-[#0e1525] px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-[#162038]">
                    {enrollment.course?.thumbnail
                      ? <img src={enrollment.course.thumbnail} alt="" className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center text-slate-600"><BookOpen className="h-5 w-5" /></div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-200 truncate">{enrollment.course?.title}</p>
                    <p className="text-xs text-slate-500">
                      Solicitado el {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <StatusBadge status={enrollment.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-bold">Solicitudes rechazadas</h2>
          </div>
          <div className="grid gap-3">
            {rejected.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between rounded-xl border border-red-500/20 bg-[#0e1525] px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-[#162038]">
                    {enrollment.course?.thumbnail
                      ? <img src={enrollment.course.thumbnail} alt="" className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center text-slate-600"><BookOpen className="h-5 w-5" /></div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-200 truncate">{enrollment.course?.title}</p>
                    {enrollment.rejectionReason && (
                      <p className="text-xs text-red-400/70">{enrollment.rejectionReason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={enrollment.status} />
                  <Link href={`/cursos/${enrollment.course?.slug}`}>
                    <Button size="sm" variant="outline" className="border-[#1e2d4a] text-xs text-slate-400 hover:text-slate-200">
                      Volver a solicitar
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Continue learning */}
      {inProgress.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Play className="h-5 w-5 text-blue-400" />
            Continúa aprendiendo
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                course={enrollment.course}
                showProgress
                progressPercentage={enrollment.progressPercentage}
              />
            ))}
          </div>
        </section>
      )}

      {/* All approved courses */}
      {approved.length > 0 ? (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <BookOpen className="h-5 w-5 text-slate-400" />
              Mis cursos
            </h2>
            <Link href="/cursos" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Explorar más →
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-xl border border-[#1e2d4a] bg-[#0e1525] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {approved.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  showProgress
                  progressPercentage={enrollment.progressPercentage}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        !loading && pending.length === 0 && rejected.length === 0 && (
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-12 text-center mb-10">
            <div className="mb-4 text-5xl">🎓</div>
            <h3 className="text-lg font-semibold text-slate-300">Aún no tienes cursos</h3>
            <p className="mt-1 text-sm text-slate-500">Explora nuestro catálogo y solicita inscripción</p>
            <Link href="/cursos">
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20">Explorar cursos</Button>
            </Link>
          </div>
        )
      )}

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/cursos" className="group rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-5 transition-all hover:border-blue-500/30 hover:bg-blue-600/5 hover:-translate-y-0.5">
          <BookOpen className="mb-3 h-6 w-6 text-blue-400" />
          <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">Explorar catálogo</h3>
          <p className="mt-1 text-xs text-slate-500">Descubre nuevos cursos</p>
        </Link>
        <div className="group rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-5 transition-all hover:border-indigo-500/30 hover:bg-indigo-600/5">
          <TrendingUp className="mb-3 h-6 w-6 text-indigo-400" />
          <h3 className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">Mi progreso</h3>
          <p className="mt-1 text-xs text-slate-500">{approved.length} curso{approved.length !== 1 ? 's' : ''} activo{approved.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 font-mono">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-1 text-3xl font-black">
              Hola,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {user.firstName}
              </span>{' '}
              👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {user.role === 'STUDENT' && 'Continúa aprendiendo donde lo dejaste'}
              {user.role === 'INSTRUCTOR' && 'Gestiona tus cursos y estudiantes'}
              {user.role === 'ADMIN' && 'Vista general del sistema'}
            </p>
          </div>

          {/* Profile card */}
          <div className="flex items-center gap-3 rounded-xl border border-[#1e2d4a] bg-[#0e1525] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <span className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              user.role === 'ADMIN'
                ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                : user.role === 'INSTRUCTOR'
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            }`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Role-specific content */}
        {user.role === 'ADMIN'
          ? <AdminPanel />
          : user.role === 'INSTRUCTOR'
          ? <InstructorPanel />
          : <StudentView />
        }
      </div>
    </div>
  );
}
