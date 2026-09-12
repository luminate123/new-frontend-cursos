import Link from 'next/link';
import { BookOpen, Clock, CheckCircle, Clock3, XCircle } from 'lucide-react';
import type { Course, EnrollmentStatus } from '@/lib/types';
import { formatDuration, getYoutubeThumbnail, formatPEN } from '@/lib/api/courses';
import { LevelBadge, LineBadge, StarRating } from './CourseBadges';

/**
 * Fila horizontal del catálogo: miniatura a la izquierda, contenido al centro,
 * precio alineado a la derecha. Es el formato de lista de resultados; la
 * tarjeta vertical (CourseCard) se queda para las rejillas del panel.
 */
export function CourseRow({
  course,
  enrollmentStatus,
}: {
  course: Course;
  enrollmentStatus?: EnrollmentStatus;
}) {
  const thumbnail =
    course.thumbnail ||
    (course.sections?.[0]?.lessons?.[0]?.youtubeVideoId
      ? getYoutubeThumbnail(course.sections[0].lessons[0].youtubeVideoId!)
      : null);

  return (
    <Link href={`/cursos/${course.slug}`} className="group block">
      <article className="flex gap-4 border-b border-border py-4 transition-colors hover:bg-secondary/40 sm:gap-5">
        {/* Miniatura */}
        <div className="relative aspect-video w-32 shrink-0 overflow-hidden bg-secondary sm:w-44 lg:w-60">
          {thumbnail ? (
            <img src={thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-8 w-8 text-border" />
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-bold leading-snug text-foreground group-hover:underline">
            {course.title}
          </h3>

          {course.shortDescription && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {course.shortDescription}
            </p>
          )}

          {course.instructor && (
            <p className="mt-1 text-xs text-muted-foreground">
              {course.instructor.firstName} {course.instructor.lastName}
            </p>
          )}

          {course.ratingCount > 0 && (
            <div className="mt-1">
              <StarRating rating={course.rating} count={course.ratingCount} />
            </div>
          )}

          {/* Metadatos en una línea, como el resumen de una ficha */}
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            {course.totalDurationSeconds > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(course.totalDurationSeconds)}
              </span>
            )}
            {course.totalLessons > 0 && <span>· {course.totalLessons} clases</span>}
            {course.academicHours > 0 && <span>· {course.academicHours} h académicas</span>}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <LineBadge line={course.line} />
            <LevelBadge level={course.level} />
            {enrollmentStatus === 'APPROVED' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                <CheckCircle className="h-3 w-3" /> Inscrito
              </span>
            )}
            {enrollmentStatus === 'PENDING' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground">
                <Clock3 className="h-3 w-3" /> En revisión
              </span>
            )}
            {enrollmentStatus === 'REJECTED' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                <XCircle className="h-3 w-3" /> Rechazado
              </span>
            )}
          </div>
        </div>

        {/* Precio */}
        <div className="shrink-0 text-right">
          <p className="text-base font-bold tabular-nums text-foreground">
            {Number(course.price) === 0 ? 'Gratis' : formatPEN(course.price)}
          </p>
        </div>
      </article>
    </Link>
  );
}
