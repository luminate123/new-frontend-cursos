'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CourseCard } from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import {
  getCourses,
  getMyEnrollments,
  LINE_LABELS,
  LINE_DESCRIPTIONS,
  LEVEL_LABELS,
  LEVEL_DESCRIPTIONS,
  DISCIPLINE_LABELS,
} from '@/lib/api/courses';
import { useAuthStore } from '@/lib/store/auth.store';
import type {
  Course, CourseLine, Discipline, CourseLevel, CoursesResponse, Enrollment,
} from '@/lib/types';

const LINES = Object.entries(LINE_LABELS) as [CourseLine, string][];
const LEVELS = Object.entries(LEVEL_LABELS) as [CourseLevel, string][];
const DISCIPLINES = Object.entries(DISCIPLINE_LABELS) as [Discipline, string][];

const selectCls =
  'h-10 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white transition-colors focus:border-brand/60 focus:outline-none';
const chipCls =
  'flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-foreground';

export default function CursosPage() {
  const { isAuthenticated } = useAuthStore();

  const [data, setData] = useState<CoursesResponse | null>(null);
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, Enrollment>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [line, setLine] = useState<CourseLine | ''>('');
  const [discipline, setDiscipline] = useState<Discipline | ''>('');
  const [level, setLevel] = useState<CourseLevel | ''>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) { setEnrollmentMap({}); return; }
    getMyEnrollments()
      .then((list) => {
        const map: Record<string, Enrollment> = {};
        list.forEach((e) => { map[e.courseId] = e; });
        setEnrollmentMap(map);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = { page: String(page), limit: '12' };
      if (search) filters.search = search;
      if (line) filters.line = line;
      if (discipline) filters.discipline = discipline;
      if (level) filters.level = level;
      setData(await getCourses(filters));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [search, line, discipline, level, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const clearFilters = () => {
    setSearch(''); setLine(''); setDiscipline(''); setLevel(''); setPage(1);
  };
  const hasFilters = search || line || discipline || level;

  return (
    <div className="min-h-screen bg-background text-navy">
      <Navbar />

      {/* ── Hero header ─────────────────────────────────────────────── */}
      <div className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black tracking-tight text-white">
              Programas{' '}
              <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                KORE Academy
              </span>
            </h1>
            <p className="mt-2 text-white/60">
              {data ? (
                <>
                  <span className="font-semibold text-white">{data.meta.total}</span> programas disponibles
                  {isAuthenticated && Object.keys(enrollmentMap).length > 0 && (
                    <> · <span className="text-white font-medium">{Object.keys(enrollmentMap).length} con solicitud activa</span></>
                  )}
                </>
              ) : 'Cargando catálogo...'}
            </p>
          </div>

          {/* ── Search + filters ──────────────────────────────────────── */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por programa, tema o competencia..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-10 w-full rounded-xl border border-white/20 bg-white/10 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Línea de negocio */}
            <select
              value={line}
              onChange={(e) => { setLine(e.target.value as CourseLine | ''); setPage(1); }}
              aria-label="Línea"
              className={selectCls}
            >
              <option value="" className="bg-white text-navy">Todas las líneas</option>
              {LINES.map(([val, label]) => (
                <option key={val} value={val} className="bg-white text-navy">{label}</option>
              ))}
            </select>

            {/* Nivel académico */}
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value as CourseLevel | ''); setPage(1); }}
              aria-label="Nivel"
              className={selectCls}
            >
              <option value="" className="bg-white text-navy">Todos los niveles</option>
              {LEVELS.map(([val, label]) => (
                <option key={val} value={val} className="bg-white text-navy">
                  {label} — {LEVEL_DESCRIPTIONS[val]}
                </option>
              ))}
            </select>

            {/* Profesión destino */}
            <select
              value={discipline}
              onChange={(e) => { setDiscipline(e.target.value as Discipline | ''); setPage(1); }}
              aria-label="Profesión"
              className={selectCls}
            >
              <option value="" className="bg-white text-navy">Todas las profesiones</option>
              {DISCIPLINES.map(([val, label]) => (
                <option key={val} value={val} className="bg-white text-navy">{label}</option>
              ))}
            </select>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white/60 hover:text-white gap-1.5">
                <X className="h-3.5 w-3.5" /> Limpiar
              </Button>
            )}
          </div>

          {/* Accesos por línea, solo cuando no hay filtros */}
          {!hasFilters && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {LINES.map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => { setLine(val); setPage(1); }}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left transition-colors hover:border-white/35 hover:bg-white/10"
                >
                  <div className="text-sm font-semibold text-white">{label}</div>
                  <div className="mt-0.5 text-xs text-white/55">{LINE_DESCRIPTIONS[val]}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Active filter chips ──────────────────────────────────────── */}
      {hasFilters && (
        <div className="border-b border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Filtros activos:</span>
            {search && (
              <span className={chipCls}>
                "{search}"
                <button onClick={() => setSearch('')}><X className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button>
              </span>
            )}
            {line && (
              <span className={chipCls}>
                {LINE_LABELS[line]}
                <button onClick={() => setLine('')} aria-label="Quitar filtro de línea">
                  <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </span>
            )}
            {discipline && (
              <span className={chipCls}>
                {DISCIPLINE_LABELS[discipline]}
                <button onClick={() => setDiscipline('')} aria-label="Quitar filtro de profesión">
                  <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </span>
            )}
            {level && (
              <span className={chipCls}>
                {LEVEL_LABELS[level]}
                <button onClick={() => setLevel('')}><X className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Course grid ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card animate-pulse">
                <div className="aspect-video bg-secondary rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-20 rounded bg-secondary" />
                  <div className="h-4 w-3/4 rounded bg-secondary" />
                  <div className="h-3 w-full rounded bg-secondary" />
                  <div className="h-3 w-1/2 rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <p className="mb-5 text-sm text-muted-foreground">
              {data.meta.total} resultado{data.meta.total !== 1 ? 's' : ''}
              {hasFilters ? ' para tu búsqueda' : ''}
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.data.map((course) => {
                const enrollment = enrollmentMap[course.id];
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    enrollmentStatus={enrollment?.status}
                    showProgress={enrollment?.status === 'APPROVED'}
                    progressPercentage={enrollment?.progressPercentage}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {data.meta.lastPage > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border-border text-navy hover:text-navy"
                >
                  ← Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: data.meta.lastPage }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === data.meta.lastPage || Math.abs(p - page) <= 1)
                    .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === 'ellipsis' ? (
                        <span key={`e${i}`} className="px-2 text-muted-foreground">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                            page === p
                              ? 'bg-brand text-white shadow-md shadow-brand/30'
                              : 'border border-border text-navy hover:border-navy/40 hover:text-navy'
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === data.meta.lastPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-border text-navy hover:text-navy"
                >
                  Siguiente →
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-2xl border border-border bg-card p-6">
              <Search className="h-10 w-10 text-border" />
            </div>
            <h3 className="text-lg font-semibold text-navy">No se encontraron cursos</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              {hasFilters
                ? 'Prueba con otros filtros o términos de búsqueda'
                : 'Aún no hay cursos publicados. Vuelve pronto.'}
            </p>
            {hasFilters && (
              <Button variant="outline" className="mt-5 border-border text-navy gap-2" onClick={clearFilters}>
                <X className="h-4 w-4" /> Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
