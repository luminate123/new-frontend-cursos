'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Users, CheckCircle, XCircle, Clock3,
  ChevronDown, ChevronRight, Eye, Pencil, Plus,
} from 'lucide-react';
import {
  getMyCourses,
  getCourseEnrollments,
  approveEnrollment,
  rejectEnrollment,
} from '@/lib/api/courses';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('PENDING');

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
          <div key={i} className="h-16 rounded-xl border border-[#1e2d4a] bg-[#0e1525] animate-pulse" />
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
        {[
          { label: 'Mis cursos', value: courseData.length, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Estudiantes activos', value: totalStudents, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Solicitudes pendientes', value: pendingCount, icon: Clock3, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`flex items-center gap-4 rounded-xl border bg-[#0e1525] p-5 ${stat.bg}`}>
            <div className={`rounded-xl p-3 ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar: filter + new course button */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Filtrar:</span>
          {(Object.keys(FILTER_LABELS) as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === s
                  ? s === 'PENDING'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : s === 'APPROVED'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : s === 'REJECTED'
                    ? 'border-red-500/50 bg-red-500/10 text-red-400'
                    : 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                  : 'border-[#1e2d4a] text-slate-500 hover:border-slate-600'
              }`}
            >
              {FILTER_LABELS[s]}
            </button>
          ))}
        </div>

        <Link href="/dashboard/instructor/cursos/nuevo">
          <Button className="bg-blue-600 hover:bg-blue-700 font-semibold text-sm shadow-lg shadow-blue-600/20">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo curso
          </Button>
        </Link>
      </div>

      {/* Course list */}
      {courseData.length === 0 ? (
        <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-400">Sin cursos aún</h3>
          <p className="mt-1 text-sm text-slate-600">Crea tu primer curso para comenzar</p>
          <Link href="/dashboard/instructor/cursos/nuevo">
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">Crear curso</Button>
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
              <div key={course.id} className="rounded-xl border border-[#1e2d4a] bg-[#0e1525] overflow-hidden">
                {/* Course header */}
                <button
                  onClick={() => toggleCourse(course.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-600/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="h-10 w-14 shrink-0 rounded-md bg-[#162038] flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-slate-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-200 truncate">{course.title}</p>
                        {!course.isPublished && (
                          <span className="shrink-0 rounded-full border border-[#1e2d4a] px-1.5 py-0.5 text-[10px] text-slate-500">
                            Borrador
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {enrollments.filter((e) => e.status === 'APPROVED').length} estudiantes
                        {pending > 0 && (
                          <span className="ml-2 text-amber-400 font-medium">
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
                      className="rounded-lg border border-[#1e2d4a] p-1.5 text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/cursos/${course.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-[#1e2d4a] p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                      title="Ver curso"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {open ? (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Enrollments */}
                {open && (
                  <div className="border-t border-[#1e2d4a]">
                    {filtered.length === 0 ? (
                      <div className="px-5 py-6 text-center text-sm text-slate-600">
                        No hay solicitudes{filterStatus !== 'ALL' ? ` con estado "${filterStatus.toLowerCase()}"` : ''}
                      </div>
                    ) : (
                      <div className="divide-y divide-[#1e2d4a]">
                        {filtered.map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="flex items-center justify-between px-5 py-3 hover:bg-blue-600/5 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#162038] text-sm font-bold text-slate-400">
                                {enrollment.user?.firstName?.[0] ?? '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate">
                                  {enrollment.user
                                    ? `${enrollment.user.firstName} ${enrollment.user.lastName}`
                                    : 'Usuario'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{enrollment.user?.email}</p>
                                <p className="text-[10px] text-slate-600">
                                  {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {enrollment.status === 'PENDING' && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                                  <Clock3 className="h-3 w-3" /> Pendiente
                                </span>
                              )}
                              {enrollment.status === 'APPROVED' && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                                  <CheckCircle className="h-3 w-3" /> Aprobado · {enrollment.progressPercentage}%
                                </span>
                              )}
                              {enrollment.status === 'REJECTED' && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                                  <XCircle className="h-3 w-3" /> Rechazado
                                </span>
                              )}

                              {enrollment.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 h-7 px-2.5 text-xs"
                                    disabled={actionLoading === enrollment.id}
                                    onClick={() => handleApprove(enrollment.id, course.id)}
                                  >
                                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                    Aprobar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-7 px-2.5 text-xs"
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
