'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock3, CheckCircle, XCircle, Loader2, Receipt, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatPEN } from '@/lib/api/courses';
import {
  getMyPayments,
  getReceiptUrl,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type Payment,
  type PaymentStatus,
} from '@/lib/api/payments';

const STATUS_STYLE: Record<PaymentStatus, string> = {
  PENDING: 'border-warning/30 bg-warning/10 text-foreground',
  APPROVED: 'border-success/30 bg-success/10 text-success',
  REJECTED: 'border-destructive/30 bg-destructive/10 text-destructive',
};

const STATUS_ICON: Record<PaymentStatus, typeof Clock3> = {
  PENDING: Clock3,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}
    >
      <Icon className="h-3 w-3" />
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Lima',
  });

export default function MisPagosPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    getMyPayments()
      .then(setPayments)
      .catch(() => {
        toast.error('No se pudieron cargar tus pagos');
        setPayments([]);
      });
  }, []);

  // El comprobante se abre por URL temporal, nunca por un enlace permanente.
  const viewReceipt = async (id: string) => {
    try {
      const { url } = await getReceiptUrl(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('No se pudo abrir el comprobante');
    }
  };

  if (!payments) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-black tracking-tight">Mis pagos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Estado de los comprobantes que enviaste para tus inscripciones.
      </p>

      {payments.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border py-16 text-center">
          <Receipt className="mx-auto h-9 w-9 text-border" />
          <p className="mt-4 font-medium">Todavía no registraste pagos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige un programa del catálogo para inscribirte.
          </p>
          <Link href="/cursos">
            <Button className="mt-6 bg-brand font-semibold text-white hover:bg-brand-600">
              Ver programas
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {payments.map((payment) => {
            const course = payment.enrollment?.course;
            return (
              <li key={payment.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">
                      {course?.title ?? 'Programa'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Enviado el {fmtDate(payment.createdAt)} ·{' '}
                      {PAYMENT_METHOD_LABELS[payment.method]}
                      {payment.operationNumber && <> · Op. {payment.operationNumber}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold tabular-nums">{formatPEN(payment.amount)}</span>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>

                {payment.status === 'REJECTED' && payment.rejectionReason && (
                  <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2.5">
                    <p className="text-xs font-medium text-destructive">Motivo del rechazo</p>
                    <p className="mt-0.5 text-sm">{payment.rejectionReason}</p>
                    {course && (
                      <Link
                        href={`/cursos/${course.slug}/inscripcion`}
                        className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline"
                      >
                        Enviar un nuevo comprobante
                      </Link>
                    )}
                  </div>
                )}

                {payment.status === 'APPROVED' && course && (
                  <Link
                    href={`/cursos/${course.slug}/classroom`}
                    className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
                  >
                    Ir al programa
                  </Link>
                )}

                <button
                  onClick={() => viewReceipt(payment.id)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver mi comprobante
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
