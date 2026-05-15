'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, BookOpen, Users, Globe, CheckCircle, Play, ArrowLeft, Loader2, XCircle, Clock3 } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { CourseRoadmap } from '@/components/courses/CourseRoadmap';
import { LevelBadge, CategoryBadge, StarRating } from '@/components/courses/CourseBadges';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  getCourse,
  requestEnrollment,
  cancelEnrollment,
  getEnrollment,
  getProgress,
  completeLesson,
  formatDuration,
  getYoutubeThumbnail,
} from '@/lib/api/courses';
import { useAuthStore } from '@/lib/store/auth.store';
import { toast } from 'sonner';
import type { Course, Enrollment, Lesson } from '@/lib/types';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const c = await getCourse(slug);
        setCourse(c);
        if (isAuthenticated) {
          try {
            const [enr, ids] = await Promise.all([
              getEnrollment(c.id),
              getProgress(c.id),
            ]);
            setEnrollment(enr);
            setCompletedIds(ids);
          } catch {
            // Not enrolled, ok
          }
        }
      } catch (err: any) {
        console.error('[CourseDetail] load error:', err);
        router.push('/cursos');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, isAuthenticated]);

  const handleRequestEnrollment = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setEnrolling(true);
    try {
      const enr = await requestEnrollment(course!.id);
      setEnrollment(enr);
      toast.success('¡Solicitud enviada! Espera la aprobación del instructor.');
    } catch (err: any) {
      toast.error(err?.message || 'Error al solicitar inscripción');
    } finally {
      setEnrolling(false);
    }
  };

  const handleCancelRequest = async () => {
    setCancelling(true);
    try {
      await cancelEnrollment(course!.id);
      setEnrollment(null);
      toast.success('Solicitud cancelada');
    } catch (err: any) {
      toast.error(err?.message || 'Error al cancelar');
    } finally {
      setCancelling(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setActiveLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplete = async () => {
    if (!activeLesson) return;
    try {
      const { progressPercentage } = await completeLesson(activeLesson.id);
      setCompletedIds((prev) => [...new Set([...prev, activeLesson.id])]);
      setEnrollment((prev) => prev ? { ...prev, progressPercentage } : prev);
      toast.success('Clase marcada como completada');
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14]">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-10 w-48 rounded bg-[#162038] animate-pulse mb-6" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-video rounded-xl bg-[#162038] animate-pulse" />
              <div className="h-8 w-3/4 rounded bg-[#162038] animate-pulse" />
              <div className="h-4 w-full rounded bg-[#162038] animate-pulse" />
            </div>
            <div className="h-96 rounded-xl bg-[#162038] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const enrollmentStatus = enrollment?.status ?? null;
  const isApproved = enrollmentStatus === 'APPROVED';
  const isPending = enrollmentStatus === 'PENDING';
  const isRejected = enrollmentStatus === 'REJECTED';

  const isOwnCourse = isAuthenticated && !!user && course.instructorId === user.id;
  const canWatchActive = isApproved || (activeLesson?.isFree ?? false);

  const thumbnail = course.thumbnail ||
    (course.sections?.[0]?.lessons?.[0]?.youtubeVideoId
      ? getYoutubeThumbnail(course.sections[0].lessons[0].youtubeVideoId!)
      : null);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      <Navbar />

      {/* Video player */}
      {activeLesson && activeLesson.youtubeVideoId && canWatchActive && (
        <div className="border-b border-[#1e2d4a] bg-[#0e1525]">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Reproduciendo</p>
                <h3 className="font-semibold text-slate-100">{activeLesson.title}</h3>
              </div>
              <div className="flex gap-2">
                {isApproved && !completedIds.includes(activeLesson.id) && (
                  <Button size="sm" onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                    Marcar completada
                  </Button>
                )}
                {!isApproved && activeLesson.isFree && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-400">
                    Vista previa gratuita
                  </span>
                )}
                <Button size="sm" variant="outline" onClick={() => setActiveLesson(null)} className="border-[#1e2d4a] text-slate-400 text-xs">
                  Cerrar
                </Button>
              </div>
            </div>
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeLesson.youtubeVideoId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            {activeLesson.description && (
              <p className="mt-3 text-sm text-slate-400">{activeLesson.description}</p>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back */}
        <Link href="/cursos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a cursos
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ── Main content ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero */}
            <div>
              {!activeLesson && thumbnail && (
                <div className="mb-6 aspect-video overflow-hidden rounded-2xl bg-[#162038]">
                  <img src={thumbnail} alt={course.title} className="h-full w-full object-cover" />
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                <CategoryBadge category={course.category} />
                <LevelBadge level={course.level} />
                {course.language && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#1e2d4a] px-2 py-0.5 text-xs text-slate-400">
                    <Globe className="h-3 w-3" />
                    {course.language.toUpperCase()}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-black text-slate-100">{course.title}</h1>

              {course.shortDescription && (
                <p className="mt-2 text-lg text-slate-400">{course.shortDescription}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {course.ratingCount > 0 && (
                  <StarRating rating={course.rating} count={course.ratingCount} />
                )}
                {course.enrollmentCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrollmentCount.toLocaleString()} estudiantes
                  </span>
                )}
                {course.totalLessons > 0 && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.totalLessons} clases
                  </span>
                )}
                {course.totalDurationSeconds > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(course.totalDurationSeconds)}
                  </span>
                )}
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-400">
                    {course.instructor.firstName[0]}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Instructor</p>
                    <p className="text-sm font-medium text-slate-300">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Rejection notice */}
            {isRejected && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                  <div>
                    <p className="font-semibold text-red-400">Solicitud rechazada</p>
                    {enrollment?.rejectionReason && (
                      <p className="mt-1 text-sm text-red-300/70">{enrollment.rejectionReason}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-500">Puedes volver a solicitar la inscripción.</p>
                  </div>
                </div>
              </div>
            )}

            {/* What you'll learn */}
            {course.whatYouLearn?.length > 0 && (
              <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-6">
                <h2 className="text-lg font-bold mb-4">Lo que aprenderás</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold mb-3">Descripción</h2>
              <p className="text-slate-400 leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">Requisitos</h2>
                <ul className="space-y-1.5">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Roadmap */}
            {course.sections?.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Contenido del curso</h2>
                  <span className="text-sm text-slate-500">
                    {course.sections.length} secciones · {course.totalLessons} clases
                  </span>
                </div>
                <CourseRoadmap
                  sections={course.sections}
                  completedLessonIds={completedIds}
                  isEnrolled={isApproved}
                  onLessonClick={handleLessonClick}
                />
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-[#1e2d4a] bg-[#0e1525] overflow-hidden">
              {thumbnail && (
                <div className="aspect-video bg-[#162038]">
                  <img src={thumbnail} alt={course.title} className="h-full w-full object-cover" />
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-100">
                    {Number(course.price) === 0 ? (
                      <span className="text-emerald-400">Gratis</span>
                    ) : (
                      `$${Number(course.price).toFixed(2)}`
                    )}
                  </span>
                </div>

                {/* Progress */}
                {isApproved && enrollment && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Tu progreso</span>
                      <span className="font-semibold text-blue-400">{enrollment.progressPercentage}%</span>
                    </div>
                    <Progress value={enrollment.progressPercentage} />
                    <p className="text-xs text-slate-600">
                      {completedIds.length} de {course.totalLessons} clases completadas
                    </p>
                  </div>
                )}

                {/* CTA */}
                {isOwnCourse ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                    <BookOpen className="h-4 w-4 text-blue-400" />
                    <p className="text-sm font-medium text-blue-400">Eres el instructor</p>
                  </div>
                ) : isApproved ? (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20"
                    onClick={() => {
                      const firstLesson = course.sections?.[0]?.lessons?.[0];
                      if (firstLesson) handleLessonClick(firstLesson);
                    }}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {completedIds.length > 0 ? 'Continuar' : 'Empezar'}
                  </Button>
                ) : isPending ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
                      <Clock3 className="h-4 w-4 shrink-0 text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-amber-400">Solicitud pendiente</p>
                        <p className="text-xs text-slate-500">El instructor revisará tu solicitud</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-[#1e2d4a] text-slate-400 hover:text-red-400 hover:border-red-500/30 text-sm"
                      onClick={handleCancelRequest}
                      disabled={cancelling}
                    >
                      {cancelling ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                      Cancelar solicitud
                    </Button>
                  </div>
                ) : isRejected ? (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20"
                    onClick={handleRequestEnrollment}
                    disabled={enrolling}
                  >
                    {enrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Volver a solicitar
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20"
                    onClick={handleRequestEnrollment}
                    disabled={enrolling}
                  >
                    {enrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {enrolling
                      ? 'Enviando...'
                      : Number(course.price) === 0
                      ? 'Solicitar inscripción gratis'
                      : 'Solicitar inscripción'}
                  </Button>
                )}

                {!isAuthenticated && (
                  <p className="text-center text-xs text-slate-500">
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Inicia sesión</Link>
                    {' '}para inscribirte
                  </p>
                )}

                {/* Course info */}
                <div className="space-y-2 border-t border-[#1e2d4a] pt-4 text-sm">
                  {course.totalLessons > 0 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />Clases</span>
                      <span className="text-slate-300">{course.totalLessons}</span>
                    </div>
                  )}
                  {course.totalDurationSeconds > 0 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />Duración</span>
                      <span className="text-slate-300">{formatDuration(course.totalDurationSeconds)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" />Idioma</span>
                    <span className="text-slate-300">{course.language?.toUpperCase()}</span>
                  </div>
                  {course.enrollmentCount > 0 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />Estudiantes</span>
                      <span className="text-slate-300">{course.enrollmentCount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {course.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 border-t border-[#1e2d4a] pt-4">
                    {course.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#162038] px-2 py-0.5 text-xs text-slate-500 border border-[#1e2d4a]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
