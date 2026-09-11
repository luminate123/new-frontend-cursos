import {
  LEVEL_LABELS,
  LEVEL_COLORS,
  LINE_LABELS,
  LINE_COLORS,
  DISCIPLINE_LABELS,
} from '@/lib/api/courses';
import type { CourseLevel, CourseLine, Discipline } from '@/lib/types';

const base =
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium';

/** Nivel de la arquitectura académica KORE: Essentials → Executive. */
export function LevelBadge({ level }: { level: CourseLevel }) {
  return <span className={`${base} ${LEVEL_COLORS[level]}`}>{LEVEL_LABELS[level]}</span>;
}

/** Línea de negocio: KORE AI (cian) o KORE Professional (naranja). */
export function LineBadge({ line }: { line: CourseLine }) {
  return <span className={`${base} ${LINE_COLORS[line]}`}>{LINE_LABELS[line]}</span>;
}

/** Profesión destino. TRANSVERSAL no se muestra: no aporta nada al filtrar. */
export function DisciplineBadge({ discipline }: { discipline: Discipline }) {
  if (discipline === 'TRANSVERSAL') return null;
  return (
    <span className={`${base} border-border bg-muted text-muted-foreground`}>
      {DISCIPLINE_LABELS[discipline]}
    </span>
  );
}

/** Horas académicas declaradas. Es el dato que se imprime en el certificado. */
export function HoursBadge({ hours }: { hours: number }) {
  if (!hours) return null;
  return (
    <span className={`${base} border-border bg-muted text-muted-foreground`}>{hours} h</span>
  );
}

export function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-brand-500">★</span>
      <span className="text-sm font-medium text-foreground">{Number(rating).toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({count.toLocaleString('es-PE')})</span>
    </div>
  );
}
