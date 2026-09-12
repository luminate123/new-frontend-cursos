'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, Inbox, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatPEN } from '@/lib/api/courses';
import {
  approvePayment,
  rejectPayment,
  getReceiptUrl,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type Payment,
  type PaymentStatus,
  type PaymentsResponse,
} from '@/lib/api/payments';

/**
 * Cola de revisión de comprobantes. La usan el instructor (sus programas: él
 * cobra, él confirma que el dinero entró) y el administrador (supervisión de
 * toda la academia). Cambia de dónde salen los datos, no cómo se revisan.
 */

const TABS: { value: PaymentStatus; label: string }[] = [
  { value: 'PENDING', label: 'Por revisar' },
  { value: 'APPROVED', label: 'Aprobados' },
  { value: 'REJECTED', label: 'Rechazados' },
];

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function PaymentRow({
  payment,
  onReviewed,
  readOnly,
}: {
  payment: Payment;
  onReviewed: () => void;
  readOnly?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const student = payment.enrollment?.user;
  const course = payment.enrollment?.course;

  const viewReceipt = async () => {
    try {
      const { url } = await getReceiptUrl(payment.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('No se pudo abrir el comprobante');
    }
  };

  const approve = async () => {
    setBusy(true);
    try {
      await approvePayment(payment.id);
      toast.success('Pago confirmado. El alumno ya tiene acceso al programa.');
      onReviewed();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'No se pudo aprobar el pago');
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (reason.trim().length < 5) {
      toast.error('Explica el motivo del rechazo (mínimo 5 caracteres)');
      return;
    }
    setBusy(true);
    try {
      await rejectPayment(payment.id, reason.trim());
      toast.success('Comprobante rechazado. El alumno puede enviar otro.');
      setRejecting(false);
      setReason('');
      onReviewed();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'No se pudo rechazar el pago');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{course?.title ?? 'Programa'}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {student ? `${student.firstName} ${student.lastName}` : 'Alumno'}
            {student?.email && <span className="text-xs"> · {student.email}</span>}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {fmtDateTime(payment.createdAt)} · {PAYMENT_METHOD_LABELS[payment.method]}
            {payment.operationNumber && <> · Op. {payment.operationNumber}</>}
            {payment.declaredPaidAt && (
              <>
                {' '}
                · pagado el{' '}
                {new Date(payment.declaredPaidAt).toLocaleDateString('es-PE', {
                  timeZone: 'America/Lima',
                })}
              </>
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xl font-black tabular-nums">{formatPEN(payment.amount)}</p>
          {course && Number(course.price) !== Number(payment.amount) && (
            <p className="mt-0.5 text-xs text-warning-foreground">
              Precio actual: {formatPEN(Number(course.price))}
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {PAYMENT_STATUS_LABELS[payment.status]}
          </p>
          {payment.reviewer && payment.reviewedAt && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              por {payment.reviewer.firstName} {payment.reviewer.lastName} ·{' '}
              {fmtDateTime(payment.reviewedAt)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button size="sm" variant="outline" onClick={viewReceipt} className="gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          Ver comprobante
        </Button>

        {readOnly && payment.status === 'PENDING' && (
          <p className="text-xs text-muted-foreground">
            Lo confirma el instructor del programa.
          </p>
        )}

        {!readOnly && payment.status === 'PENDING' && !rejecting && (
          <>
            <Button
              size="sm"
              onClick={approve}
              disabled={busy}
              className="gap-1.5 bg-success font-semibold text-white hover:brightness-95"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Confirmar pago y dar acceso
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRejecting(true)}
              disabled={busy}
              className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <X className="h-3.5 w-3.5" />
              Rechazar
            </Button>
          </>
        )}

        {payment.status === 'REJECTED' && payment.rejectionReason && (
          <p className="text-xs text-muted-foreground">
            Motivo: <span className="text-foreground">{payment.rejectionReason}</span>
          </p>
        )}
      </div>

      {rejecting && (
        <div className="mt-3 space-y-2 border border-destructive/25 bg-destructive/5 p-3">
          <label htmlFor={`reason-${payment.id}`} className="block text-xs font-medium">
            Motivo del rechazo (lo verá el alumno)
          </label>
          <textarea
            id={`reason-${payment.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Ej. El monto transferido no coincide con el precio del programa."
            className="w-full resize-none border border-border bg-card px-3 py-2 text-sm focus:border-destructive/50 focus:outline-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={reject}
              disabled={busy}
              className="bg-destructive font-semibold text-white hover:brightness-95"
            >
              Confirmar rechazo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setRejecting(false);
                setReason('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

export function PaymentReviewList({
  fetcher,
  emptyHint,
  readOnly,
}: {
  fetcher: (params: { status: PaymentStatus; page: number; limit: number }) => Promise<PaymentsResponse>;
  emptyHint?: string;
  /** Supervisión: se ve todo, no se confirma nada. */
  readOnly?: boolean;
}) {
  const [status, setStatus] = useState<PaymentStatus>('PENDING');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetcher({ status, page, limit: 20 }));
    } catch {
      toast.error('No se pudieron cargar los pagos');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetcher, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <div className="mt-6 flex gap-6 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-bold transition-colors ${
              status === tab.value
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="mt-8 border border-dashed border-border py-16 text-center">
          <Inbox className="mx-auto h-9 w-9 text-border" />
          <p className="mt-4 font-medium">Nada por aquí</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {emptyHint ?? 'No hay pagos con este estado.'}
          </p>
        </div>
      ) : (
        <>
          <p className="mt-5 text-xs text-muted-foreground">
            {data.meta.total} {data.meta.total === 1 ? 'pago' : 'pagos'}
          </p>
          <ul className="mt-3 space-y-3">
            {data.data.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                onReviewed={load}
                readOnly={readOnly}
              />
            ))}
          </ul>

          {data.meta.lastPage > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {data.meta.lastPage}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= data.meta.lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
