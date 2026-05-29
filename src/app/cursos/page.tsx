'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CourseCard } from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import {
  getCourses,
  getMyEnrollments,
  CATEGORY_LABELS,
  LEVEL_LABELS,
} from '@/lib/api/courses';
import { useAuthStore } from '@/lib/store/auth.store';
import type { Course, CourseCategory, CourseLevel, CoursesResponse, Enrollment } from '@/lib/types';

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [CourseCategory, string][];
const LEVELS = Object.entries(LEVEL_LABELS) as [CourseLevel, string][];

const CATEGORY_ICONS: Record<string, string> = {
  PROGRAMMING: '💻',
  DESIGN: '🎨',
  BUSINESS: '📈',
  MARKETING: '📣',
  PHOTOGRAPHY: '📷',
  MUSIC: '🎵',
  HEALTH: '🏃',
  OTHER: '📚',
};

export default function CursosPage() {
  const { isAuthenticated } = useAuthStore();

  const [data, setData] = useState<CoursesResponse | null>(null);
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, Enrollment>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CourseCategory | ''>('');
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
      if (category) filters.category = category;
      if (level) filters.level = level;
      setData(await getCourses(filters));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [search, category, level, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const clearFilters = () => { setSearch(''); setCategory(''); setLevel(''); setPage(1); };
  const hasFilters = search || category || level;

  return (
    <div className="min-h-screen bg-background text-stone-900">
      <Navbar />

      {/* ── Hero header ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black tracking-tight">
              Explora{' '}
              <span className="bg-gradient-to-r from-stone-800 to-stone-700 bg-clip-text text-transparent">
                nuestros cursos
              </span>
            </h1>
            <p className="mt-2 text-stone-500">
              {data ? (
                <>
                  <span className="font-semibold text-stone-700">{data.meta.total}</span> cursos disponibles
                  {isAuthenticated && Object.keys(enrollmentMap).length > 0 && (
                    <> · <span className="text-stone-700 font-medium">{Object.keys(enrollmentMap).length} con solicitud activa</span></>
                  )}
                </>
              ) : 'Cargando catálogo...'}
            </p>
          </div>

          {/* ── Search + filters ──────────────────────────────────────── */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Buscar por título, tema o instructor..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-700/60 focus:outline-none focus:ring-2 focus:ring-stone-700/10 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value as CourseCategory | ''); setPage(1); }}
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-stone-700 focus:border-stone-700/60 focus:outline-none transition-colors"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIES.map(([val, label]) => (
                <option key={val} value={val}>{CATEGORY_ICONS[val]} {label}</option>
              ))}
            </select>

            {/* Level */}
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value as CourseLevel | ''); setPage(1); }}
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-stone-700 focus:border-stone-700/60 focus:outline-none transition-colors"
            >
              <option value="">Todos los niveles</option>
              {LEVELS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-stone-500 hover:text-stone-700 gap-1.5">
                <X className="h-3.5 w-3.5" /> Limpiar
              </Button>
            )}
          </div>

          {/* ── Category pills (when no filter active) ───────────────── */}
          {!category && !search && !level && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {CATEGORIES.map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => { setCategory(val); setPage(1); }}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-stone-600 hover:border-stone-700/40 hover:text-stone-900 transition-colors"
                >
                  <span>{CATEGORY_ICONS[val]}</span>
                  {label}
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
            <span className="text-xs text-stone-500">Filtros activos:</span>
            {search && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-stone-700">
                "{search}"
                <button onClick={() => setSearch('')}><X className="h-3 w-3 text-stone-500 hover:text-red-600" /></button>
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-stone-700">
                {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
                <button onClick={() => setCategory('')}><X className="h-3 w-3 text-stone-500 hover:text-red-600" /></button>
              </span>
            )}
            {level && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-stone-700">
                {LEVEL_LABELS[level]}
                <button onClick={() => setLevel('')}><X className="h-3 w-3 text-stone-500 hover:text-red-600" /></button>
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
            <p className="mb-5 text-sm text-stone-500">
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
                  className="border-border text-stone-600 hover:text-stone-900"
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
                        <span key={`e${i}`} className="px-2 text-stone-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                            page === p
                              ? 'bg-stone-900 text-background shadow-md shadow-stone-900/20'
                              : 'border border-border text-stone-600 hover:border-stone-700/40 hover:text-stone-900'
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
                  className="border-border text-stone-600 hover:text-stone-900"
                >
                  Siguiente →
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-2xl border border-border bg-card p-6">
              <Search className="h-10 w-10 text-stone-400" />
            </div>
            <h3 className="text-lg font-semibold text-stone-700">No se encontraron cursos</h3>
            <p className="mt-1 text-sm text-stone-500 max-w-xs">
              {hasFilters
                ? 'Prueba con otros filtros o términos de búsqueda'
                : 'Aún no hay cursos publicados. Vuelve pronto.'}
            </p>
            {hasFilters && (
              <Button variant="outline" className="mt-5 border-border text-stone-600 gap-2" onClick={clearFilters}>
                <X className="h-4 w-4" /> Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
