'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock3, Loader2, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { formatPEN, LINE_LABELS } from '@/lib/api/courses';
import { getRevenue, type Revenue } from '@/lib/api/payments';

const inputCls =
  'h-9 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground focus:border-brand/60 focus:outline-none';

/** Etiqueta legible de un periodo YYYY-MM. */
function periodLabel(period: string) {
  const [y, m] = period.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-black tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * Ingresos aprobados por mes. Una sola serie, así que no lleva leyenda: el
 * título la nombra. Barras finas con extremo redondeado ancladas al eje, 2px de
 * separación, grid recesivo, y tooltip por barra.
 */
function MonthlyBars({ series, currency }: { series: Revenue['series']; currency: string }) {
  if (series.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Todavía no hay ingresos registrados.
      </p>
    );
  }

  const max = Math.max(...series.map((s) => s.revenue));
  // Etiquetar cada barra amontona los números: solo el mes de mayor ingreso.
  const peak = series.reduce((a, b) => (b.revenue > a.revenue ? b : a));

  return (
    <div>
      <div className="flex h-56 items-end gap-[2px] border-b border-chart-grid">
        {series.map((point) => {
          const heightPct = max > 0 ? (point.revenue / max) * 100 : 0;
          return (
            <div
              key={point.period}
              className="group relative flex flex-1 flex-col justify-end"
              style={{ height: '100%' }}
            >
              {/* Zona sensible completa: el hover no depende del alto de la barra */}
              <div
                className="w-full rounded-t bg-chart-1 transition-opacity group-hover:opacity-80"
                style={{ height: `${Math.max(heightPct, point.revenue > 0 ? 2 : 0)}%` }}
              />
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-card-hover group-hover:block"
              >
                <p className="font-semibold">{periodLabel(point.period)}</p>
                <p className="tabular-nums text-muted-foreground">
                  {formatPEN(point.revenue)} · {point.sales}{' '}
                  {point.sales === 1 ? 'venta' : 'ventas'}
                </p>
              </div>
              {point.period === peak.period && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {formatPEN(point.revenue)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-[2px]">
        {series.map((point) => (
          <span
            key={point.period}
            className="flex-1 truncate text-center text-[10px] text-muted-foreground"
          >
            {periodLabel(point.period)}
          </span>
        ))}
      </div>

      {/* Vista de tabla: el contraste de la barra queda por debajo de 3:1, así
          que los valores tienen que estar disponibles como texto. */}
      <details className="mt-4">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          Ver los datos en tabla
        </summary>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 font-medium">Mes</th>
              <th className="py-1.5 text-right font-medium">Ingreso ({currency})</th>
              <th className="py-1.5 text-right font-medium">Ventas</th>
            </tr>
          </thead>
          <tbody>
            {series.map((point) => (
              <tr key={point.period} className="border-b border-border/60">
                <td className="py-1.5">{periodLabel(point.period)}</td>
                <td className="py-1.5 text-right tabular-nums">{formatPEN(point.revenue)}</td>
                <td className="py-1.5 text-right tabular-nums">{point.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function IngresosContent() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState<Revenue | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getRevenue({ from: from || undefined, to: to || undefined }));
    } catch {
      toast.error('No se pudieron cargar los ingresos');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const maxCourseRevenue = data?.byCourse.length
    ? Math.max(...data.byCourse.map((c) => c.revenue))
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Panel
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Ingresos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Solo cuentan los pagos aprobados, por su fecha de validación.
          </p>
        </div>

        {/* Filtros en una sola fila, encima de los datos */}
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="from" className="mb-1 block text-xs text-muted-foreground">
              Desde
            </label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="to" className="mb-1 block text-xs text-muted-foreground">
              Hasta
            </label>
            <input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={inputCls}
            />
          </div>
          {(from || to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFrom('');
                setTo('');
              }}
            >
              Limpiar
            </Button>
          )}
          <Link href="/dashboard/admin/pagos">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Receipt className="h-3.5 w-3.5" />
              Revisar pagos
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No hay datos para mostrar.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Ingreso total"
              value={formatPEN(data.totalRevenue)}
              hint={`${data.sales} ${data.sales === 1 ? 'venta' : 'ventas'}`}
              icon={Wallet}
            />
            <StatTile label="Ticket promedio" value={formatPEN(data.avgTicket)} icon={TrendingUp} />
            <StatTile
              label="Por revisar"
              value={String(data.pendingCount)}
              hint={`${formatPEN(data.pendingAmount)} en cola`}
              icon={Clock3}
            />
            <StatTile
              label="Programas vendidos"
              value={String(data.byCourse.length)}
              hint="programas con al menos una venta"
              icon={Receipt}
            />
          </div>

          <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold">Ingreso aprobado por mes</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">En soles (S/)</p>
            <div className="mt-8">
              <MonthlyBars series={data.series} currency={data.currency} />
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-sm font-semibold">Ingreso por programa</h2>

            {data.byCourse.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Todavía no hay ventas registradas.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="py-2 font-medium">Programa</th>
                      <th className="py-2 font-medium">Línea</th>
                      <th className="py-2 text-right font-medium">Ventas</th>
                      <th className="py-2 text-right font-medium">Ingreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byCourse.map((course) => (
                      <tr key={course.courseId} className="border-b border-border/60">
                        <td className="max-w-xs py-2.5">
                          <p className="truncate font-medium">{course.title}</p>
                          <div
                            className="mt-1.5 h-1 rounded-full bg-chart-1"
                            style={{
                              width: `${
                                maxCourseRevenue > 0
                                  ? Math.max((course.revenue / maxCourseRevenue) * 100, 2)
                                  : 0
                              }%`,
                            }}
                          />
                        </td>
                        <td className="py-2.5 text-xs text-muted-foreground">
                          {LINE_LABELS[course.line] ?? course.line}
                        </td>
                        <td className="py-2.5 text-right tabular-nums">{course.sales}</td>
                        <td className="py-2.5 text-right font-semibold tabular-nums">
                          {formatPEN(course.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default function AdminIngresosPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <IngresosContent />
    </RoleGuard>
  );
}
