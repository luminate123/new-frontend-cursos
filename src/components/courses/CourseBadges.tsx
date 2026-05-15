import { LEVEL_LABELS, LEVEL_COLORS, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/api/courses';
import type { CourseLevel, CourseCategory } from '@/lib/types';

export function LevelBadge({ level }: { level: CourseLevel }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${LEVEL_COLORS[level]}`}>
      {LEVEL_LABELS[level]}
    </span>
  );
}

export function CategoryBadge({ category }: { category: CourseCategory }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[category]}`}>
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-amber-400 text-sm">★</span>
      <span className="text-sm font-medium text-slate-300">{Number(rating).toFixed(1)}</span>
      <span className="text-xs text-slate-500">({count.toLocaleString()})</span>
    </div>
  );
}
