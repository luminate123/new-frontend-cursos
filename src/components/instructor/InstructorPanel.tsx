'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Users, CheckCircle, XCircle, Eye, Pencil, Plus, Award,
  TrendingUp, Wallet, Inbox,
} from 'lucide-react';
import {
  getMyCourses,
  getCourseEnrollments,
  approveEnrollment,
  rejectEnrollment,
} from '@/lib/api/courses';
import { Button } from '@/components/ui/button';
import { StatTile } from '@/components/ui/stat-tile';
import { toast } from 'sonner';
import { issueCertificate } from '@/lib/api/certificates';
import type { Course, Enrollment } from '@/lib/types';

/**
 * Panel del instructor.
 *
 * La bandeja de solicitudes se separa por *quién tiene que actuar*, no por el
 * estado interno del registro: "Pendiente" a secas no decía si la solicitud
 * esperaba al instructor (programa gratuito) o a administración validando el
 * comprobante (programa de pago), que son dos situaciones opuestas.
 */

type CourseEnrollments = { course: Course; enrollments: Enrollment[] };

/** Una solicitud junto al programa al que pertenece, para listarla plana. */
type Request = { enrollment: Enrollment; course: Course };

type Tab = 'revisar' | 'pago' | 'estudiantes' | 'rechazadas';

const TABS: { key: Tab; label: string; empty: string }[] = [
  {
    key: 'revisar',
    label: 'Por revisar',
    empty: 'No tienes solicitudes esperando tu aprobación.',
  },
  {
    key: 'pago',
    label: 'Pagos por confirmar',
    empty: 'No hay comprobantes esperando tu confirmación.',
  },
  {
    key: 'estudiantes',
    label: 'Estudiantes',
    empty: 'Todavía no tienes estudiantes con acceso.',
  },
  {
    key: 'rechazadas',
    label: 'Rechazadas',
    empty: 'No has rechazado ninguna solicitud.',
  },
];

function fullName(e: Enrollment) {
  return e.user ? `${e.user.firstName} ${e.user.lastName}` : 'Usuario';
}

function requestedOn(e: Enrollment) {
  return new Date(e.enrolledAt).toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function InstructorPanel() {
  const [courseData, setCourseData] = useState<CourseEnrollments[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('revisar');

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyCourses();
        const withEnrollments = await Promise.all(
          res.data.map(async (course) => {
            try {
              return { course, enrollments: await getCourseEnrollments(course.id) };
            } catch {
              return { course, enrollments: [] };
            }
          }),
        );
        setCourseData(withEnrollments);
      } catch {
        toast.error('Error cargando datos');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /** Todas las inscripciones de todos los programas, en una sola lista. */
  const all = useMemo<Request[]>(
    () =>
      courseData.flatMap(({ course, enrollments }) =>
        enrollments.map((enrollment) => ({ enrollment, course })),
      ),
    [courseData],
  );

  // El precio del programa decide quién resuelve la solicitud: en los
  // gratuitos el instructor; en los de pago, administración con el comprobante.
  const buckets = useMemo(
    () => ({
      revisar: all.filter(
        (r) => r.enrollment.status === 'PENDING' && Number(r.course.price) === 0,
      ),
      pago: all.filter(
        (r) => r.enrollment.status === 'PENDING' && Number(r.course.price) > 0,
      ),
      estudiantes: all.filter((r) => r.enrollment.status === 'APPROVED'),
      rechazadas: all.filter((r) => r.enrollment.status === 'REJECTED'),
    }),
    [all],
  );

  const patchEnrollment = (enrollmentId: string, patch: Partial<Enrollment>) =>
    setCourseData((prev) =>
      prev.map((cd) => ({
        ...cd,
        enrollments: cd.enrollments.map((e) =>
          e.id === enrollmentId ? { ...e, ...patch } : e,
        ),
      })),
    );

  const handleApprove = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    try {
      patchEnrollment(enrollmentId, await approveEnrollment(enrollmentId));
      toast.success('Inscripción aprobada');
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (enrollmentId: string) => {
    const reason = window.prompt('Motivo del rechazo (opcional):') ?? undefined;
    setActionLoading(enrollmentId);
    try {
      patchEnrollment(enrollmentId, await rejectEnrollment(enrollmentId, reason || undefined));
      toast.success('Solicitud rechazada');
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Error');
    } finally {
      setActionLoading(null);
    }
  };

  // El certificado se emite cuando el alumno llega al 100%. El backend es
  // idempotente: si ya existe, devuelve el mismo en vez de emitir otro.
  const handleIssueCertificate = async (
    enrollmentId: string,
    courseId: string,
    studentId: string,
  ) => {
    setActionLoading(enrollmentId);
    try {
      const certificate = await issueCertificate(courseId, studentId);
      toast.success(`Certificado emitido: ${certificate.code}`);
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'No se pudo emitir el certificado');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse border border-border bg-card" />
        ))}
      </div>
    );
  }

  const visible = buckets[tab];
  const tabMeta = TABS.find((t) => t.key === tab)!;

  return (
    <div className="space-y-10">
      {/* ── Resumen ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Mis programas" value={courseData.length} icon={BookOpen} />
        <StatTile
          label="Estudiantes con acceso"
          value={buckets.estudiantes.length}
          icon={Users}
        />
        <StatTile
          label="Esperan tu aprobación"
          value={buckets.revisar.length}
          icon={Inbox}
          hint={
            buckets.pago.length > 0
              ? `${buckets.pago.length} con comprobante por confirmar`
              : undefined
          }
        />
      </div>

      {/* ── Solicitudes y estudiantes ──────────────────────────────── */}
      <section>
        <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-bold">Solicitudes y estudiantes</h2>
          <Link href="/dashboard/instructor/ingresos">
            <Button variant="outline" size="sm" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Mis ingresos
            </Button>
          </Link>
        </div>

        {/* Pestañas por quién debe actuar */}
        <div className="flex flex-wrap gap-6 border-b border-border">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 pb-2.5 text-sm font-bold transition-colors ${
                tab === key
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label} ({buckets[key].length})
            </button>
          ))}
        </div>

        {/* Aclaración de qué se está viendo y quién resuelve */}
        <p className="mt-3 text-sm text-muted-foreground">
          {tab === 'revisar' &&
            'Programas gratuitos: tú decides si das acceso. Apruébalas o recházalas aquí.'}
          {tab === 'pago' &&
            'Programas de pago: el alumno ya subió su comprobante. Ábrelo, confirma que el dinero llegó a tu cuenta y el acceso se activa solo.'}
          {tab === 'estudiantes' &&
            'Alumnos con acceso al aula. Puedes emitir su certificado cuando lleguen al 100 %.'}
          {tab === 'rechazadas' && 'Solicitudes que rechazaste. El alumno puede volver a solicitarlas.'}
        </p>

        {visible.length === 0 ? (
          <div className="mt-4 border border-border bg-card p-10 text-center">
            <Inbox className="mx-auto mb-3 h-8 w-8 text-border" />
            <p className="text-sm text-muted-foreground">{tabMeta.empty}</p>
          </div>
        ) : (
          <div className="mt-4 border border-border bg-card">
            {visible.map(({ enrollment, course }) => (
              <div
                key={enrollment.id}
                className="flex flex-wrap items-center gap-4 border-b border-border px-5 py-4 last:border-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                  {enrollment.user?.firstName?.[0]?.toUpperCase() ?? '?'}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {fullName(enrollment)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{course.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Solicitado el {requestedOn(enrollment)}
                  </p>
                  {tab === 'rechazadas' && enrollment.rejectionReason && (
                    <p className="mt-1 text-xs text-destructive">
                      Motivo: {enrollment.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Acciones, solo donde el instructor realmente decide */}
                {tab === 'revisar' && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 bg-success text-white hover:brightness-95"
                      disabled={actionLoading === enrollment.id}
                      onClick={() => handleApprove(enrollment.id)}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Dar acceso
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                      disabled={actionLoading === enrollment.id}
                      onClick={() => handleReject(enrollment.id)}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Rechazar
                    </Button>
                  </div>
                )}

                {tab === 'pago' && (
                  <Link href="/dashboard/instructor/pagos" className="shrink-0">
                    <Button size="sm" className="h-8 gap-1.5 bg-navy hover:bg-navy-800">
                      <Wallet className="h-3.5 w-3.5" />
                      Revisar comprobante
                    </Button>
                  </Link>
                )}

                {tab === 'estudiantes' && (
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {enrollment.progressPercentage}% completado
                    </span>
                    {enrollment.progressPercentage >= 100 && enrollment.user && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5"
                        disabled={actionLoading === enrollment.id}
                        onClick={() =>
                          handleIssueCertificate(enrollment.id, course.id, enrollment.user!.id)
                        }
                      >
                        <Award className="h-3.5 w-3.5" />
                        Emitir certificado
                      </Button>
                    )}
                  </div>
                )}

                {tab === 'rechazadas' && (
                  <span className="flex shrink-0 items-center gap-1.5 border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                    <XCircle className="h-3.5 w-3.5" />
                    Rechazada
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Mis programas ─────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Mis programas</h2>
          <Link href="/dashboard/instructor/cursos/nuevo">
            <Button className="gap-1.5 bg-navy font-semibold hover:bg-navy-800">
              <Plus className="h-4 w-4" />
              Nuevo programa
            </Button>
          </Link>
        </div>

        {courseData.length === 0 ? (
          <div className="border border-border bg-card p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-border" />
            <h3 className="text-lg font-bold">Aún no tienes programas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea el primero para empezar a recibir estudiantes.
            </p>
            <Link href="/dashboard/instructor/cursos/nuevo">
              <Button className="mt-6 bg-navy hover:bg-navy-800">Crear programa</Button>
            </Link>
          </div>
        ) : (
          <div className="border border-border bg-card">
            {courseData.map(({ course, enrollments }) => {
              const active = enrollments.filter((e) => e.status === 'APPROVED').length;
              const waiting = enrollments.filter((e) => e.status === 'PENDING').length;

              return (
                <div
                  key={course.id}
                  className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
                >
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="h-12 w-20 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-20 shrink-0 items-center justify-center bg-secondary">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{course.title}</p>
                      {!course.isPublished && (
                        <span className="shrink-0 border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          Borrador
                        </span>
                      )}
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {Number(course.price) === 0 ? 'Gratuito' : 'De pago'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {active} estudiante{active !== 1 ? 's' : ''}
                      {waiting > 0 && (
                        <span className="text-warning-foreground">
                          {' '}
                          · {waiting} solicitud{waiting !== 1 ? 'es' : ''} sin resolver
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/dashboard/instructor/cursos/${course.id}`}
                      className="border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                      title="Editar programa"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/cursos/${course.slug}`}
                      className="border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                      title="Ver ficha pública"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
