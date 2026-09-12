'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CourseRow } from '@/components/courses/CourseRow';
import { Button } from '@/components/ui/button';
import {
  getCourses,
  getMyEnrollments,
  LINE_LABELS,
  LEVEL_LABELS,
  LEVEL_DESCRIPTIONS,
  DISCIPLINE_LABELS,
} from '@/lib/api/courses';
import { useAuthStore } from '@/lib/store/auth.store';
import type {
  CourseLine, Discipline, CourseLevel, CoursesResponse, Enrollment,
} from '@/lib/types';

const LINES = Object.entries(LINE_LABELS) as [CourseLine, string][];
const LEVELS = Object.entries(LEVEL_LABELS) as [CourseLevel, string][];
const DISCIPLINES = Object.entries(DISCIPLINE_LABELS) as [Discipline, string][];

/**
 * Catálogo con el formato de una lista de resultados: filtros en una columna
 * a la izquierda y los programas en filas horizontales a la derecha. La
 * rejilla de tarjetas se quedó solo para "Mis cursos" del panel, donde el
 * alumno reconoce por imagen y no compara entre opciones.
 */

/** Grupo de filtros con casillas. Un filtro, un valor: seleccionar sustituye. */
function FilterGroup<T extends string>({
  title,
  options,
  value,
  onChange,
  describe,
}: {
  title: string;
  options: [T, string][];
  value: T | '';
  onChange: (v: T | '') => void;
  describe?: (v: T) => string | undefined;
}) {
  return (
    <div className="border-b border-border py-4">
      <p className="mb-3 text-sm font-bold text-foreground">{title}</p>
      <div className="space-y-2">
        {options.map(([val, label]) => (
          <label key={val} className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={value === val}
              onChange={() => onChange(value === val ? '' : val)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
            />
            <span className="text-muted-foreground">
              {label}
              {describe?.(val) && (
                <span className="block text-xs text-muted-foreground/70">{describe(val)}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function CursosPage() {
  const { isAuthenticated } = useAuthStore();

  const [data, setData] = useState<CoursesResponse | null>(null);
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, Enrollment>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [line, setLine] = useState<CourseLine | ''>('');
  const [discipline, setDiscipline] = useState<Discipline | ''>('');
  const [level, setLevel] = useState<CourseLevel | ''>('');
  const [sort, setSort] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setEnrollmentMap({});
      return;
    }
    getMyEnrollments()
      .then((list) => {
        const map: Record<string, Enrollment> = {};
        list.forEach((e) => {
          map[e.courseId] = e;
        });
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

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const clearFilters = () => {
    setSearch('');
    setLine('');
    setDiscipline('');
    setLevel('');
    setPage(1);
  };
  const hasFilters = !!(search || line || discipline || level);

  // ponytail: el orden se aplica sobre la página actual, no en el backend.
  // Si el catálogo pasa de unas decenas de programas, mover a la query.
  const courses = [...(data?.data ?? [])].sort((a, b) => {
    if (sort === 'price_asc') return Number(a.price) - Number(b.price);
    if (sort === 'price_desc') return Number(b.price) - Number(a.price);
    return b.enrollmentCount - a.enrollmentCount;
  });

  const filterPanel = (
    <>
      <FilterGroup
        title="Línea de formación"
        options={LINES}
        value={line}
        onChange={(v) => {
          setLine(v);
          setPage(1);
        }}
      />
      <FilterGroup
        title="Nivel"
        options={LEVELS}
        value={level}
        onChange={(v) => {
          setLevel(v);
          setPage(1);
        }}
        describe={(v) => LEVEL_DESCRIPTIONS[v]}
      />
      <FilterGroup
        title="Profesión"
        options={DISCIPLINES}
        value={discipline}
        onChange={(v) => {
          setDiscipline(v);
          setPage(1);
        }}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Cabecera ────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-black tracking-tight">Programas KORE Academy</h1>
          <p className="mt-1 text-muted-foreground">
            {data
              ? `${data.meta.total} programa${data.meta.total !== 1 ? 's' : ''} disponible${data.meta.total !== 1 ? 's' : ''}`
              : 'Cargando catálogo...'}
          </p>

          <div className="relative mt-5 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por programa, tema o competencia..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filtros + resultados ────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Barra de control */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 lg:hidden"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtrar
          </Button>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Ordenar por</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-9 border border-border bg-card px-2 text-sm text-foreground focus:border-brand focus:outline-none"
            >
              <option value="popular">Más populares</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>
          </label>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
              <X className="h-3.5 w-3.5" /> Limpiar filtros
            </Button>
          )}

          <p className="ml-auto text-sm font-bold text-foreground">
            {data?.meta.total ?? 0} resultado{(data?.meta.total ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Columna de filtros */}
          <aside className="hidden w-64 shrink-0 lg:block">{filterPanel}</aside>

          {/* Panel de filtros en móvil */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 bg-background p-4 lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-bold">Filtros</p>
                <button onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto">{filterPanel}</div>
              <Button className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
                Ver {data?.meta.total ?? 0} resultados
              </Button>
            </div>
          )}

          {/* Resultados */}
          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-5 border-b border-border py-4">
                    <div className="aspect-video w-60 shrink-0 animate-pulse bg-secondary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse bg-secondary" />
                      <div className="h-3 w-full animate-pulse bg-secondary" />
                      <div className="h-3 w-1/3 animate-pulse bg-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length > 0 ? (
              <>
                <div className="border-t border-border">
                  {courses.map((course) => (
                    <CourseRow
                      key={course.id}
                      course={course}
                      enrollmentStatus={enrollmentMap[course.id]?.status}
                    />
                  ))}
                </div>

                {data && data.meta.lastPage > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ← Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: data.meta.lastPage }, (_, i) => i + 1)
                        .filter(
                          (p) => p === 1 || p === data.meta.lastPage || Math.abs(p - page) <= 1,
                        )
                        .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === 'ellipsis' ? (
                            <span key={`e${i}`} className="px-2 text-muted-foreground">
                              …
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setPage(p as number)}
                              className={`h-9 w-9 border text-sm font-medium transition-colors ${
                                page === p
                                  ? 'border-navy bg-navy text-white'
                                  : 'border-border text-foreground hover:bg-muted'
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
                    >
                      Siguiente →
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center border border-border bg-card py-20 text-center">
                <Search className="mb-4 h-10 w-10 text-border" />
                <h3 className="text-lg font-bold">No se encontraron programas</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  {hasFilters
                    ? 'Prueba con otros filtros o términos de búsqueda'
                    : 'Aún no hay programas publicados. Vuelve pronto.'}
                </p>
                {hasFilters && (
                  <Button variant="outline" className="mt-5 gap-2" onClick={clearFilters}>
                    <X className="h-4 w-4" /> Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
