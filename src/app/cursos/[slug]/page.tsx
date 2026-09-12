'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock, BookOpen, Users, Globe, CheckCircle, Play, Loader2, XCircle, Clock3,
  ChevronRight, Award, Infinity as InfinityIcon, FileDown,
} from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { CourseRoadmap } from '@/components/courses/CourseRoadmap';
import { LevelBadge, LineBadge, DisciplineBadge, HoursBadge, StarRating } from '@/components/courses/CourseBadges';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  getCourse,
  requestEnrollment,
  cancelEnrollment,
  getEnrollment,
  getProgress,
  formatDuration,
  getYoutubeThumbnail,
  formatPEN,
  LINE_LABELS,
} from '@/lib/api/courses';
import { useAuthStore } from '@/lib/store/auth.store';
import { toast } from 'sonner';
import type { Course, Enrollment, Lesson } from '@/lib/types';

/**
 * Ficha de programa. Estructura de marketplace de cursos: banda oscura con la
 * cabecera y una tarjeta de compra flotante superpuesta a la derecha; debajo,
 * en la columna izquierda, "lo que aprenderás", el temario, los requisitos y
 * la descripción. La tarjeta se ancla sobre el hero en escritorio y baja al
 * flujo normal en móvil.
 */
export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
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
            const [enr, ids] = await Promise.all([getEnrollment(c.id), getProgress(c.id)]);
            setEnrollment(enr);
            setCompletedIds(ids);
          } catch {
            // Sin inscripción: se ve la ficha pública.
          }
        }
      } catch {
        router.push('/cursos');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, isAuthenticated]);

  // Un programa de pago necesita comprobante: se resuelve en /inscripcion.
  // Solo lo gratuito se solicita directamente desde aquí.
  const handleRequestEnrollment = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (Number(course!.price) > 0) {
      router.push(`/cursos/${slug}/inscripcion`);
      return;
    }
    setEnrolling(true);
    try {
      const enr = await requestEnrollment(course!.id);
      setEnrollment(enr);
      toast.success('¡Solicitud enviada! Espera la aprobación del instructor.');
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Error al solicitar inscripción');
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
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Error al cancelar');
    } finally {
      setCancelling(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (isApproved || isOwnCourse || lesson.isFree) {
      router.push(`/cursos/${slug}/classroom?lesson=${lesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="bg-navy">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
            <div className="mt-4 h-9 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-white/10" />
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

  const thumbnail =
    course.thumbnail ||
    (course.sections?.[0]?.lessons?.[0]?.youtubeVideoId
      ? getYoutubeThumbnail(course.sections[0].lessons[0].youtubeVideoId!)
      : null);

  const hasDownloads = course.sections?.some((s) =>
    s.lessons?.some((l) => (l.resources?.length ?? 0) > 0),
  );

  /** Tarjeta de compra. Se monta dos veces: flotante en escritorio, en flujo en móvil. */
  const purchaseCard = (
    <div className="overflow-hidden border border-border bg-card shadow-card-hover">
      {thumbnail && (
        <div className="relative aspect-video bg-secondary">
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-navy-950/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
              <Play className="ml-0.5 h-6 w-6 text-navy" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 p-5">
        <p className="text-3xl font-black tabular-nums text-foreground">
          {Number(course.price) === 0 ? 'Gratis' : formatPEN(course.price)}
        </p>

        {isApproved && enrollment && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tu progreso</span>
              <span className="font-semibold text-foreground">{enrollment.progressPercentage}%</span>
            </div>
            <Progress value={enrollment.progressPercentage} />
            <p className="text-xs text-muted-foreground">
              {completedIds.length} de {course.totalLessons} clases completadas
            </p>
          </div>
        )}

        {isOwnCourse ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 border border-border bg-muted px-4 py-3">
              <BookOpen className="h-4 w-4 text-foreground" />
              <p className="text-sm font-medium text-foreground">Eres el instructor</p>
            </div>
            <Button
              className="w-full bg-navy py-6 text-base font-bold hover:bg-navy-800"
              onClick={() => router.push(`/cursos/${slug}/classroom`)}
            >
              Ver curso
            </Button>
          </div>
        ) : isApproved ? (
          <Button
            className="w-full bg-navy py-6 text-base font-bold hover:bg-navy-800"
            onClick={() => router.push(`/cursos/${slug}/classroom`)}
          >
            {completedIds.length > 0 ? 'Continuar aprendiendo' : 'Empezar ahora'}
          </Button>
        ) : isPending ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2 border border-warning/30 bg-warning/10 px-4 py-3">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Solicitud en revisión</p>
                <p className="text-xs text-muted-foreground">
                  {Number(course.price) > 0
                    ? 'Estamos validando tu comprobante de pago'
                    : 'El instructor revisará tu solicitud'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full text-sm text-muted-foreground hover:border-destructive/30 hover:text-destructive"
              onClick={handleCancelRequest}
              disabled={cancelling}
            >
              {cancelling && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Cancelar solicitud
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-brand py-6 text-base font-bold text-white hover:bg-brand-600"
            onClick={handleRequestEnrollment}
            disabled={enrolling}
          >
            {enrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRejected
              ? 'Volver a solicitar'
              : Number(course.price) === 0
                ? 'Solicitar inscripción gratis'
                : 'Inscribirme ahora'}
          </Button>
        )}

        {!isAuthenticated && (
          <p className="text-center text-xs text-muted-foreground">
            <Link href="/login" className="font-semibold text-foreground underline">
              Inicia sesión
            </Link>{' '}
            para inscribirte
          </p>
        )}

        {/* Qué incluye: la lista de garantías del programa */}
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-sm font-bold text-foreground">Este programa incluye</p>
          {course.totalDurationSeconds > 0 && (
            <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Play className="h-4 w-4 shrink-0" />
              {formatDuration(course.totalDurationSeconds)} de video
            </p>
          )}
          {course.totalLessons > 0 && (
            <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 shrink-0" />
              {course.totalLessons} clases
            </p>
          )}
          {hasDownloads && (
            <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <FileDown className="h-4 w-4 shrink-0" />
              Material descargable
            </p>
          )}
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <InfinityIcon className="h-4 w-4 shrink-0" />
            Acceso mientras dure tu inscripción
          </p>
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Award className="h-4 w-4 shrink-0" />
            Certificado verificable al completarlo
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Cabecera oscura ─────────────────────────────────────────── */}
      <section className="bg-navy text-white">
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          {/* El hueco derecho es donde se ancla la tarjeta en escritorio */}
          <div className="lg:max-w-[62%]">
            {/* Ruta de navegación */}
            <nav className="flex flex-wrap items-center gap-1 text-xs text-white/70">
              <Link href="/cursos" className="hover:text-white hover:underline">
                Programas
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/cursos?line=${course.line}`}
                className="hover:text-white hover:underline"
              >
                {LINE_LABELS[course.line] ?? course.line}
              </Link>
            </nav>

            <h1 className="mt-3 text-3xl font-black leading-tight lg:text-4xl">{course.title}</h1>

            {course.shortDescription && (
              <p className="mt-3 text-lg text-white/85">{course.shortDescription}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/85">
              {course.ratingCount > 0 && (
                <StarRating rating={course.rating} count={course.ratingCount} />
              )}
              {course.enrollmentCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {course.enrollmentCount.toLocaleString('es-PE')} estudiantes
                </span>
              )}
              {course.totalLessons > 0 && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {course.totalLessons} clases
                </span>
              )}
              {course.totalDurationSeconds > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDuration(course.totalDurationSeconds)}
                </span>
              )}
            </div>

            {course.instructor && (
              <p className="mt-3 text-sm text-white/85">
                Creado por{' '}
                <span className="font-semibold text-white underline">
                  {course.instructor.firstName} {course.instructor.lastName}
                </span>
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
              {course.language && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {course.language}
                </span>
              )}
              {course.academicHours > 0 && (
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  {course.academicHours} horas académicas
                </span>
              )}
            </div>
          </div>

          {/* Tarjeta flotante: se superpone al hero y desborda sobre el fondo claro */}
          <aside className="absolute right-4 top-10 z-20 hidden w-[340px] lg:block">
            <div className="sticky top-20">{purchaseCard}</div>
          </aside>
        </div>
      </section>

      {/* ── Cuerpo ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* En móvil la tarjeta va aquí, antes del contenido */}
        <div className="mb-8 lg:hidden">{purchaseCard}</div>

        <div className="space-y-10 lg:max-w-[62%]">
          {isRejected && (
            <div className="border border-destructive/30 bg-destructive/10 p-5">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Solicitud rechazada</p>
                  {enrollment?.rejectionReason && (
                    <p className="mt-1 text-sm text-destructive/70">{enrollment.rejectionReason}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Puedes volver a solicitar la inscripción.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lo que aprenderás, en caja con borde */}
          {course.whatYouLearn?.length > 0 && (
            <section className="border border-border bg-card p-6">
              <h2 className="text-xl font-bold">Lo que aprenderás</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Competencias declaradas del programa */}
          {course.competencies?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold">Competencias que desarrollas</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {course.competencies.map((c) => (
                  <span
                    key={c}
                    className="border border-border bg-secondary px-3 py-1 text-sm text-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Temario */}
          {course.sections?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold">Contenido del programa</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {course.sections.length} secciones · {course.totalLessons} clases ·{' '}
                {formatDuration(course.totalDurationSeconds)} de duración total
              </p>
              <div className="mt-4">
                <CourseRoadmap
                  sections={course.sections}
                  completedLessonIds={completedIds}
                  isEnrolled={isApproved || isOwnCourse}
                  onLessonClick={handleLessonClick}
                />
              </div>
            </section>
          )}

          {/* Requisitos */}
          {course.requirements?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold">Requisitos</h2>
              <ul className="mt-3 space-y-2">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Descripción */}
          <section>
            <h2 className="text-xl font-bold">Descripción</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
              {course.description}
            </p>
          </section>

          {/* Clasificación académica */}
          <section>
            <h2 className="text-xl font-bold">Clasificación</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <LineBadge line={course.line} />
              <LevelBadge level={course.level} />
              <DisciplineBadge discipline={course.discipline} />
              <HoursBadge hours={course.academicHours} />
            </div>
          </section>

          {/* Instructor */}
          {course.instructor && (
            <section>
              <h2 className="text-xl font-bold">Instructor</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy text-xl font-bold text-white">
                  {course.instructor.firstName[0]}
                  {course.instructor.lastName[0]}
                </div>
                <div>
                  <p className="font-bold text-foreground underline">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Instructor de {LINE_LABELS[course.line] ?? course.line}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
