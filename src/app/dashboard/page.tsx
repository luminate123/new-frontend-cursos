'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Clock3, Trophy, TrendingUp, Play, XCircle, CheckCircle,
} from 'lucide-react';
import { CourseCard } from '@/components/courses/CourseCard';
import { useAuthStore } from '@/lib/store/auth.store';
import { getMyEnrollments } from '@/lib/api/courses';
import { InstructorPanel } from '@/components/instructor/InstructorPanel';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { StatTile } from '@/components/ui/stat-tile';
import { Button } from '@/components/ui/button';
import type { Enrollment } from '@/lib/types';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Enrollment['status'] }) {
  if (status === 'APPROVED') return (
    <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
      <CheckCircle className="h-3 w-3" /> Aprobado
    </span>
  );
  if (status === 'PENDING') return (
    <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning-foreground">
      <Clock3 className="h-3 w-3" /> Pendiente
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
      <XCircle className="h-3 w-3" /> Rechazado
    </span>
  );
}

// Mismo adaptador que en el panel de administración: render común, el color
// que pasaba cada llamada se ignora.
function StatCard({
  label, value, icon,
}: {
  label: string; value: number; icon: React.ElementType;
  color?: string; bg?: string;
}) {
  return <StatTile label={label} value={value} icon={icon} />;
}

// ─── Student view ─────────────────────────────────────────────────────────────

function StudentView() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'todos' | 'progreso' | 'completados'>('todos');

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
        <StatCard label="Cursos aprobados" value={approved.length} icon={BookOpen} color="text-foreground" bg="bg-muted border-border" />
        <StatCard label="En progreso" value={inProgress.length} icon={TrendingUp} color="text-foreground" bg="bg-muted border-border" />
        <StatCard label="Completados" value={completed.length} icon={Trophy} color="text-success" bg="bg-success/10 border-success/20" />
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-warning-foreground" />
            <h2 className="text-lg font-bold">Solicitudes pendientes</h2>
            <span className="rounded-full bg-warning/10 border border-warning/20 px-2 py-0.5 text-xs text-warning-foreground">
              {pending.length}
            </span>
          </div>
          <div className="grid gap-3">
            {pending.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-secondary">
                    {enrollment.course?.thumbnail
                      ? <img src={enrollment.course.thumbnail} alt="" className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><BookOpen className="h-5 w-5" /></div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{enrollment.course?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Solicitado el {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES', { timeZone: 'America/Lima' })}
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
            <XCircle className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-bold">Solicitudes rechazadas</h2>
          </div>
          <div className="grid gap-3">
            {rejected.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between rounded-xl border border-destructive/20 bg-card px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-secondary">
                    {enrollment.course?.thumbnail
                      ? <img src={enrollment.course.thumbnail} alt="" className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><BookOpen className="h-5 w-5" /></div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{enrollment.course?.title}</p>
                    {enrollment.rejectionReason && (
                      <p className="text-xs text-destructive/70">{enrollment.rejectionReason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={enrollment.status} />
                  <Link href={`/cursos/${enrollment.course?.slug}`}>
                    <Button size="sm" variant="outline" className="border-border text-xs text-muted-foreground hover:text-foreground">
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
            <Play className="h-5 w-5 text-foreground" />
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
          {/* Pestañas sobre la rejilla: el alumno separa lo que tiene entre
              manos de lo ya terminado sin cambiar de pantalla. */}
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-border">
            <div className="flex gap-6">
              {([
                ['todos', `Todos (${approved.length})`],
                ['progreso', `En progreso (${inProgress.length})`],
                ['completados', `Completados (${completed.length})`],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`-mb-px border-b-2 pb-2.5 text-sm font-bold transition-colors ${
                    tab === key
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Link href="/cursos" className="pb-2.5 text-sm font-semibold text-foreground hover:underline">
              Explorar más →
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(tab === 'progreso' ? inProgress : tab === 'completados' ? completed : approved).map((enrollment) => (
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
          <div className="rounded-2xl border border-border bg-card p-12 text-center mb-10">
            <div className="mb-4 text-5xl">🎓</div>
            <h3 className="text-lg font-semibold text-foreground">Aún no tienes cursos</h3>
            <p className="mt-1 text-sm text-muted-foreground">Explora nuestro catálogo y solicita inscripción</p>
            <Link href="/cursos">
              <Button className="mt-6 bg-navy hover:bg-navy-800 font-semibold shadow-lg shadow-navy/20">Explorar cursos</Button>
            </Link>
          </div>
        )
      )}

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/cursos" className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-border hover:bg-muted hover:-translate-y-0.5">
          <BookOpen className="mb-3 h-6 w-6 text-foreground" />
          <h3 className="font-semibold text-foreground group-hover:text-foreground transition-colors">Explorar catálogo</h3>
          <p className="mt-1 text-xs text-muted-foreground">Descubre nuevos cursos</p>
        </Link>
        <div className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-border hover:bg-muted">
          <TrendingUp className="mb-3 h-6 w-6 text-muted-foreground" />
          <h3 className="font-semibold text-foreground group-hover:text-foreground transition-colors">Mi progreso</h3>
          <p className="mt-1 text-xs text-muted-foreground">{approved.length} curso{approved.length !== 1 ? 's' : ''} activo{approved.length !== 1 ? 's' : ''}</p>
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
    <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-mono">
              {new Date().toLocaleDateString('es-ES', { timeZone: 'America/Lima', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-1 text-3xl font-black">
              Hola,{' '}
              <span className="bg-gradient-to-r from-navy-800 to-navy-600 bg-clip-text text-transparent">
                {user.firstName}
              </span>{' '}
              👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.role === 'STUDENT' && 'Continúa aprendiendo donde lo dejaste'}
              {user.role === 'INSTRUCTOR' && 'Gestiona tus cursos y estudiantes'}
              {user.role === 'ADMIN' && 'Vista general del sistema'}
            </p>
          </div>

          {/* Profile card */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <span className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              user.role === 'ADMIN'
                ? 'border-ai-500/30 bg-ai-50 text-ai-700'
                : user.role === 'INSTRUCTOR'
                ? 'border-border bg-muted text-foreground'
                : 'border-success/30 bg-success/10 text-success'
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
  );
}
