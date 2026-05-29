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
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
      <CheckCircle className="h-3 w-3" /> Aprobado
    </span>
  );
  if (status === 'PENDING') return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-600/30 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
      <Clock3 className="h-3 w-3" /> Pendiente
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-600/30 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
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
    <div className={`flex items-center gap-4 rounded-xl border bg-[#ede7d9] p-5 ${bg}`}>
      <div className={`rounded-xl p-3 ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        <p className="text-xs text-stone-500">{label}</p>
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
        <StatCard label="Cursos aprobados" value={approved.length} icon={BookOpen} color="text-stone-700" bg="bg-stone-900/10 border-stone-700/20" />
        <StatCard label="En progreso" value={inProgress.length} icon={TrendingUp} color="text-stone-700" bg="bg-stone-800/8 border-stone-700/20" />
        <StatCard label="Completados" value={completed.length} icon={Trophy} color="text-emerald-700" bg="bg-emerald-500/10 border-emerald-500/20" />
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-amber-700" />
            <h2 className="text-lg font-bold">Solicitudes pendientes</h2>
            <span className="rounded-full bg-amber-50 border border-amber-600/20 px-2 py-0.5 text-xs text-amber-700">
              {pending.length}
            </span>
          </div>
          <div className="grid gap-3">
            {pending.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between rounded-xl border border-[#c9beab] bg-[#ede7d9] px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-[#e4ddd0]">
                    {enrollment.course?.thumbnail
                      ? <img src={enrollment.course.thumbnail} alt="" className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center text-stone-400"><BookOpen className="h-5 w-5" /></div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800 truncate">{enrollment.course?.title}</p>
                    <p className="text-xs text-stone-500">
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
            <XCircle className="h-5 w-5 text-red-700" />
            <h2 className="text-lg font-bold">Solicitudes rechazadas</h2>
          </div>
          <div className="grid gap-3">
            {rejected.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between rounded-xl border border-red-500/20 bg-[#ede7d9] px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-[#e4ddd0]">
                    {enrollment.course?.thumbnail
                      ? <img src={enrollment.course.thumbnail} alt="" className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center text-stone-400"><BookOpen className="h-5 w-5" /></div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800 truncate">{enrollment.course?.title}</p>
                    {enrollment.rejectionReason && (
                      <p className="text-xs text-red-700/70">{enrollment.rejectionReason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={enrollment.status} />
                  <Link href={`/cursos/${enrollment.course?.slug}`}>
                    <Button size="sm" variant="outline" className="border-[#c9beab] text-xs text-stone-600 hover:text-stone-900">
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
            <Play className="h-5 w-5 text-stone-700" />
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
              <BookOpen className="h-5 w-5 text-stone-600" />
              Mis cursos
            </h2>
            <Link href="/cursos" className="text-sm text-stone-700 hover:text-stone-900 transition-colors">
              Explorar más →
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-xl border border-[#c9beab] bg-[#ede7d9] animate-pulse" />
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
          <div className="rounded-2xl border border-[#c9beab] bg-[#ede7d9] p-12 text-center mb-10">
            <div className="mb-4 text-5xl">🎓</div>
            <h3 className="text-lg font-semibold text-stone-700">Aún no tienes cursos</h3>
            <p className="mt-1 text-sm text-stone-500">Explora nuestro catálogo y solicita inscripción</p>
            <Link href="/cursos">
              <Button className="mt-6 bg-stone-900 hover:bg-stone-800 font-semibold shadow-lg shadow-stone-900/20">Explorar cursos</Button>
            </Link>
          </div>
        )
      )}

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/cursos" className="group rounded-2xl border border-[#c9beab] bg-[#ede7d9] p-5 transition-all hover:border-stone-700/30 hover:bg-stone-900/5 hover:-translate-y-0.5">
          <BookOpen className="mb-3 h-6 w-6 text-stone-700" />
          <h3 className="font-semibold text-stone-800 group-hover:text-stone-900 transition-colors">Explorar catálogo</h3>
          <p className="mt-1 text-xs text-stone-500">Descubre nuevos cursos</p>
        </Link>
        <div className="group rounded-2xl border border-[#c9beab] bg-[#ede7d9] p-5 transition-all hover:border-stone-700/30 hover:bg-stone-900/5">
          <TrendingUp className="mb-3 h-6 w-6 text-stone-600" />
          <h3 className="font-semibold text-stone-800 group-hover:text-stone-900 transition-colors">Mi progreso</h3>
          <p className="mt-1 text-xs text-stone-500">{approved.length} curso{approved.length !== 1 ? 's' : ''} activo{approved.length !== 1 ? 's' : ''}</p>
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
    <div className="min-h-screen bg-[#f5f0e6] text-stone-900">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-stone-500 font-mono">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-1 text-3xl font-black">
              Hola,{' '}
              <span className="bg-gradient-to-r from-stone-800 to-stone-700 bg-clip-text text-transparent">
                {user.firstName}
              </span>{' '}
              👋
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              {user.role === 'STUDENT' && 'Continúa aprendiendo donde lo dejaste'}
              {user.role === 'INSTRUCTOR' && 'Gestiona tus cursos y estudiantes'}
              {user.role === 'ADMIN' && 'Vista general del sistema'}
            </p>
          </div>

          {/* Profile card */}
          <div className="flex items-center gap-3 rounded-xl border border-[#c9beab] bg-[#ede7d9] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900/10 text-stone-700 font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-800">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
            <span className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              user.role === 'ADMIN'
                ? 'border-purple-500/30 bg-purple-50 text-purple-700'
                : user.role === 'INSTRUCTOR'
                ? 'border-stone-700/30 bg-stone-900/10 text-stone-700'
                : 'border-emerald-500/30 bg-emerald-50 text-emerald-700'
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
