import Link from 'next/link';
import { BookOpen, Clock, Users, Clock3, CheckCircle, XCircle, Lock, Play } from 'lucide-react';
import type { Course, EnrollmentStatus } from '@/lib/types';
import { formatDuration, getYoutubeThumbnail } from '@/lib/api/courses';
import { LevelBadge, CategoryBadge, StarRating } from './CourseBadges';

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
  progressPercentage?: number;
  enrollmentStatus?: EnrollmentStatus;
}

function EnrollmentBadge({ status }: { status: EnrollmentStatus }) {
  if (status === 'APPROVED') return (
    <span className="flex items-center gap-1 rounded-full border border-emerald-600/40 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 backdrop-blur-sm">
      <CheckCircle className="h-3 w-3" /> Inscrito
    </span>
  );
  if (status === 'PENDING') return (
    <span className="flex items-center gap-1 rounded-full border border-amber-600/40 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 backdrop-blur-sm">
      <Clock3 className="h-3 w-3" /> Pendiente
    </span>
  );
  return (
    <span className="flex items-center gap-1 rounded-full border border-red-600/40 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 backdrop-blur-sm">
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
      <div className="h-full rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-stone-700/40 hover:shadow-xl hover:shadow-stone-900/8 hover:-translate-y-1">
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
              <BookOpen className="h-12 w-12 text-stone-400" />
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button on hover (if enrolled) */}
          {enrollmentStatus === 'APPROVED' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900/90 shadow-lg shadow-stone-900/50 backdrop-blur-sm">
                <Play className="h-5 w-5 text-background ml-0.5" />
              </div>
            </div>
          )}

          {/* Price badge */}
          <div className="absolute top-2.5 right-2.5">
            {Number(course.price) === 0 ? (
              <span className="rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow backdrop-blur-sm">
                GRATIS
              </span>
            ) : (
              <span className="rounded-full border border-border bg-background/90 px-2.5 py-0.5 text-[11px] font-bold text-stone-800 backdrop-blur-sm">
                ${Number(course.price).toFixed(2)}
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
                <Lock className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={course.category} />
            <LevelBadge level={course.level} />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-stone-900 leading-snug line-clamp-2 group-hover:text-stone-700 transition-colors text-sm">
            {course.title}
          </h3>

          {/* Short description */}
          {course.shortDescription && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{course.shortDescription}</p>
          )}

          {/* Instructor */}
          {course.instructor && (
            <p className="text-xs text-stone-500">
              por <span className="text-stone-700 font-medium">{course.instructor.firstName} {course.instructor.lastName}</span>
            </p>
          )}

          {/* Rating */}
          {course.ratingCount > 0 && (
            <StarRating rating={course.rating} count={course.ratingCount} />
          )}

          {/* Progress bar */}
          {showProgress && enrollmentStatus === 'APPROVED' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-500">
                <span>Progreso</span>
                <span className="font-semibold text-stone-700">{progressPercentage}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-stone-800 to-stone-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats footer */}
          <div className="flex items-center gap-3 border-t border-border pt-2.5 text-xs text-stone-500">
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
                {course.enrollmentCount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
