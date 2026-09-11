import Link from 'next/link';
import { BookOpen, Clock, Users, Clock3, CheckCircle, XCircle, Lock, Play } from 'lucide-react';
import type { Course, EnrollmentStatus } from '@/lib/types';
import { formatDuration, getYoutubeThumbnail, formatPEN } from '@/lib/api/courses';
import { LevelBadge, LineBadge, HoursBadge, StarRating } from './CourseBadges';

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
  progressPercentage?: number;
  enrollmentStatus?: EnrollmentStatus;
}

function EnrollmentBadge({ status }: { status: EnrollmentStatus }) {
  if (status === 'APPROVED') return (
    <span className="flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success backdrop-blur-sm">
      <CheckCircle className="h-3 w-3" /> Inscrito
    </span>
  );
  if (status === 'PENDING') return (
    <span className="flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground backdrop-blur-sm">
      <Clock3 className="h-3 w-3" /> Pendiente
    </span>
  );
  return (
    <span className="flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive backdrop-blur-sm">
      <XCircle className="h-3 w-3" /> Rechazado
    </span>
  );
}

export function CourseCard({ course, showProgress, progressPercentage = 0, enrollmentStatus }: CourseCardProps) {
  const thumbnail =
    course.thumbnail ||
    (course.sections?.[0]?.lessons?.[0]?.youtubeVideoId
      ? getYoutubeThumbnail(course.sections[0].lessons[0].youtubeVideoId!)
      : null);

  return (
    <Link href={`/cursos/${course.slug}`} className="group block">
      <div className="h-full rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-navy/20 hover:shadow-xl hover:shadow-navy/8 hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-secondary overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-card">
              <BookOpen className="h-12 w-12 text-border" />
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button on hover (if enrolled) */}
          {enrollmentStatus === 'APPROVED' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/90 shadow-lg shadow-brand/50 backdrop-blur-sm">
                <Play className="h-5 w-5 text-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Price badge */}
          <div className="absolute top-2.5 right-2.5">
            {Number(course.price) === 0 ? (
              <span className="rounded-full bg-success/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow backdrop-blur-sm">
                GRATIS
              </span>
            ) : (
              <span className="rounded-full border border-border bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-navy backdrop-blur-sm">
                {formatPEN(course.price)}
              </span>
            )}
          </div>

          {/* Enrollment status (top-left) */}
          {enrollmentStatus && (
            <div className="absolute top-2.5 left-2.5">
              <EnrollmentBadge status={enrollmentStatus} />
            </div>
          )}

          {/* Lock overlay for pending */}
          {enrollmentStatus === 'PENDING' && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
              <div className="rounded-full bg-card/90 p-3 border border-border">
                <Lock className="h-5 w-5 text-warning-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <LineBadge line={course.line} />
            <LevelBadge level={course.level} />
            <HoursBadge hours={course.academicHours} />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-navy leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors text-sm">
            {course.title}
          </h3>

          {/* Short description */}
          {course.shortDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{course.shortDescription}</p>
          )}

          {/* Instructor */}
          {course.instructor && (
            <p className="text-xs text-muted-foreground">
              por <span className="text-navy font-medium">{course.instructor.firstName} {course.instructor.lastName}</span>
            </p>
          )}

          {/* Rating */}
          {course.ratingCount > 0 && (
            <StarRating rating={course.rating} count={course.ratingCount} />
          )}

          {/* Progress bar */}
          {showProgress && enrollmentStatus === 'APPROVED' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progreso</span>
                <span className="font-semibold text-navy">{progressPercentage}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats footer */}
          <div className="flex items-center gap-3 border-t border-border pt-2.5 text-xs text-muted-foreground">
            {course.totalLessons > 0 && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {course.totalLessons} clases
              </span>
            )}
            {course.totalDurationSeconds > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(course.totalDurationSeconds)}
              </span>
            )}
            {course.enrollmentCount > 0 && (
              <span className="flex items-center gap-1 ml-auto">
                <Users className="h-3 w-3" />
                {course.enrollmentCount.toLocaleString('es-PE')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
