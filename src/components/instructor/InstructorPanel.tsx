'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Users, CheckCircle, XCircle, Clock3,
  ChevronDown, ChevronRight, Eye, Pencil, Plus, Award, TrendingUp,
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

type CourseEnrollments = { course: Course; enrollments: Enrollment[]; open: boolean };
type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const FILTER_LABELS: Record<FilterStatus, string> = {
  ALL: 'Todos',
  PENDING: 'Pendientes',
  APPROVED: 'Aprobados',
  REJECTED: 'Rechazados',
};

export function InstructorPanel() {
  const [courseData, setCourseData] = useState<CourseEnrollments[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // Arranca en "Todos": con el filtro en Pendientes, un instructor sin
  // solicitudes abría el curso y lo veía vacío, como si no tuviera alumnos.
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyCourses();
        const withEnrollments = await Promise.all(
          res.data.map(async (course) => {
            try {
              const enrollments = await getCourseEnrollments(course.id);
              return { course, enrollments, open: false };
            } catch {
              return { course, enrollments: [], open: false };
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

  const toggleCourse = (courseId: string) => {
    setCourseData((prev) =>
      prev.map((cd) => (cd.course.id === courseId ? { ...cd, open: !cd.open } : cd)),
    );
  };

  const handleApprove = async (enrollmentId: string, courseId: string) => {
    setActionLoading(enrollmentId);
    try {
      const updated = await approveEnrollment(enrollmentId);
      setCourseData((prev) =>
        prev.map((cd) =>
          cd.course.id === courseId
            ? { ...cd, enrollments: cd.enrollments.map((e) => (e.id === enrollmentId ? { ...e, ...updated } : e)) }
            : cd,
        ),
      );
      toast.success('Inscripción aprobada');
    } catch (err: any) {
      toast.error(err?.message || 'Error');
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

  const handleReject = async (enrollmentId: string, courseId: string) => {
    const reason = window.prompt('Motivo del rechazo (opcional):') ?? undefined;
    setActionLoading(enrollmentId);
    try {
      const updated = await rejectEnrollment(enrollmentId, reason || undefined);
      setCourseData((prev) =>
        prev.map((cd) =>
          cd.course.id === courseId
            ? { ...cd, enrollments: cd.enrollments.map((e) => (e.id === enrollmentId ? { ...e, ...updated } : e)) }
            : cd,
        ),
      );
      toast.success('Solicitud rechazada');
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  const totalStudents = courseData.reduce(
    (acc, cd) => acc + cd.enrollments.filter((e) => e.status === 'APPROVED').length, 0,
  );
  const pendingCount = courseData.reduce(
    (acc, cd) => acc + cd.enrollments.filter((e) => e.status === 'PENDING').length, 0,
  );

  return (
    <div>
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Mis cursos" value={courseData.length} icon={BookOpen} />
        <StatTile label="Estudiantes activos" value={totalStudents} icon={Users} />
        <StatTile
          label="Solicitudes pendientes"
          value={pendingCount}
          icon={Clock3}
          hint={pendingCount > 0 ? 'Requieren tu revisión' : undefined}
        />
      </div>

      {/* Toolbar: filter + new course button */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          {(Object.keys(FILTER_LABELS) as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === s
                  ? s === 'PENDING'
                    ? 'border-warning/50 bg-warning/10 text-warning-foreground'
                    : s === 'APPROVED'
                    ? 'border-success/50 bg-success/10 text-success'
                    : s === 'REJECTED'
                    ? 'border-destructive/50 bg-destructive/10 text-destructive'
                    : 'border-border bg-muted text-foreground'
                  : 'border-border text-muted-foreground hover:border-border'
              }`}
            >
              {FILTER_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/instructor/ingresos">
            <Button variant="outline" size="sm" className="gap-1.5 text-sm">
              <TrendingUp className="h-4 w-4" />
              Mis ingresos
            </Button>
          </Link>
          <Link href="/dashboard/instructor/cursos/nuevo">
            <Button className="bg-navy hover:bg-navy-800 font-semibold text-sm shadow-lg shadow-navy/20">
              <Plus className="mr-1.5 h-4 w-4" />
              Nuevo curso
            </Button>
          </Link>
        </div>
      </div>

      {/* Course list */}
      {courseData.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground">Sin cursos aún</h3>
          <p className="mt-1 text-sm text-muted-foreground">Crea tu primer curso para comenzar</p>
          <Link href="/dashboard/instructor/cursos/nuevo">
            <Button className="mt-6 bg-navy hover:bg-navy-800 shadow-lg shadow-navy/20">Crear curso</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courseData.map(({ course, enrollments, open }) => {
            const filtered =
              filterStatus === 'ALL'
                ? enrollments
                : enrollments.filter((e) => e.status === filterStatus);
            const pending = enrollments.filter((e) => e.status === 'PENDING').length;

            return (
              <div key={course.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Course header */}
                <button
                  onClick={() => toggleCourse(course.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="h-10 w-14 shrink-0 rounded-md bg-secondary flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">{course.title}</p>
                        {!course.isPublished && (
                          <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            Borrador
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {enrollments.filter((e) => e.status === 'APPROVED').length} estudiantes
                        {pending > 0 && (
                          <span className="ml-2 text-warning-foreground font-medium">
                            · {pending} pendiente{pending !== 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/instructor/cursos/${course.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/cursos/${course.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      title="Ver curso"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {open ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Enrollments */}
                {open && (
                  <div className="border-t border-border">
                    {filtered.length === 0 ? (
                      <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                        No hay solicitudes{filterStatus !== 'ALL' ? ` con estado "${filterStatus.toLowerCase()}"` : ''}
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {filtered.map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="flex items-center justify-between px-5 py-3 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                                {enrollment.user?.firstName?.[0] ?? '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {enrollment.user
                                    ? `${enrollment.user.firstName} ${enrollment.user.lastName}`
                                    : 'Usuario'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{enrollment.user?.email}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES', { timeZone: 'America/Lima',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {enrollment.status === 'PENDING' && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning-foreground">
                                  <Clock3 className="h-3 w-3" /> Pendiente
                                </span>
                              )}
                              {enrollment.status === 'APPROVED' && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                                  <CheckCircle className="h-3 w-3" /> Aprobado · {enrollment.progressPercentage}%
                                </span>
                              )}
                              {enrollment.status === 'REJECTED' && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                                  <XCircle className="h-3 w-3" /> Rechazado
                                </span>
                              )}

                              {enrollment.status === 'APPROVED' &&
                                enrollment.progressPercentage >= 100 &&
                                enrollment.user && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 gap-1 px-2.5 text-xs"
                                    disabled={actionLoading === enrollment.id}
                                    onClick={() =>
                                      handleIssueCertificate(
                                        enrollment.id,
                                        course.id,
                                        enrollment.user!.id,
                                      )
                                    }
                                  >
                                    <Award className="h-3.5 w-3.5" />
                                    Emitir certificado
                                  </Button>
                                )}

                              {enrollment.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-success hover:bg-success h-7 px-2.5 text-xs"
                                    disabled={actionLoading === enrollment.id}
                                    onClick={() => handleApprove(enrollment.id, course.id)}
                                  >
                                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                    Aprobar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive/30 text-destructive hover:bg-destructive/10 h-7 px-2.5 text-xs"
                                    disabled={actionLoading === enrollment.id}
                                    onClick={() => handleReject(enrollment.id, course.id)}
                                  >
                                    <XCircle className="mr-1 h-3.5 w-3.5" />
                                    Rechazar
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
