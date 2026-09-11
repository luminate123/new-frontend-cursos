'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Check,
  Copy,
  FileText,
  Loader2,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { getCourse, formatPEN } from '@/lib/api/courses';
import {
  getBankInfo,
  uploadReceipt,
  checkout,
  MAX_RECEIPT_BYTES,
  PAYMENT_METHOD_LABELS,
  type BankInfo,
  type PaymentMethod,
} from '@/lib/api/payments';
import type { Course } from '@/lib/types';

const inputCls =
  'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20';

function CopyableAccount({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('No se pudo copiar. Selecciona el número manualmente.');
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm font-semibold tabular-nums">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copiar ${label}`}
        className="shrink-0 rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand-600"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function InscripcionContent({ slug }: { slug: string }) {
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [bank, setBank] = useState<BankInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('BCP_SOLES');
  const [operationNumber, setOperationNumber] = useState('');
  const [declaredPaidAt, setDeclaredPaidAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getCourse(slug), getBankInfo()])
      .then(([c, b]) => {
        setCourse(c);
        setBank(b);
      })
      .catch(() => toast.error('No se pudo cargar la información de inscripción'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Libera el object URL de la vista previa al cambiarla o desmontar.
  useEffect(() => {
    if (!file || file.type === 'application/pdf') {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (picked.size > MAX_RECEIPT_BYTES) {
      toast.error('El comprobante supera el límite de 10 MB');
      return;
    }
    setFile(picked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    if (!file) {
      toast.error('Adjunta la captura o el voucher de tu pago');
      return;
    }

    setSubmitting(true);
    try {
      const receiptKey = await uploadReceipt(file);
      await checkout(course.id, {
        receiptKey,
        method,
        operationNumber: operationNumber.trim() || undefined,
        declaredPaidAt: declaredPaidAt || undefined,
      });
      toast.success('Comprobante enviado. Te avisaremos cuando sea validado.');
      router.push('/dashboard/mis-pagos');
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      toast.error(
        message ||
          (err as { message?: string })?.message ||
          'No se pudo registrar tu inscripción',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-muted-foreground">No encontramos este programa.</p>
        <Link href="/cursos" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const price = Number(course.price);

  if (price <= 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-muted-foreground">
          Este programa es gratuito: puedes solicitar tu inscripción directamente.
        </p>
        <Link
          href={`/cursos/${course.slug}`}
          className="mt-4 inline-block text-sm text-brand-600 hover:underline"
        >
          Ir al programa
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href={`/cursos/${course.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al programa
      </Link>

      <h1 className="mt-5 text-3xl font-black tracking-tight">Inscripción</h1>
      <p className="mt-1 text-muted-foreground">{course.title}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── Paso 1: pago, Paso 2: comprobante ─────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Datos bancarios */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                1
              </span>
              <h2 className="font-semibold">Realiza el pago</h2>
            </div>

            {bank && bank.accounts.length > 0 ? (
              <>
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>
                    {bank.bank} · a nombre de{' '}
                    <span className="font-medium text-foreground">{bank.holder}</span>
                  </span>
                </div>
                <div className="space-y-2">
                  {bank.accounts.map((account) => (
                    <CopyableAccount
                      key={account.type}
                      label={account.label}
                      value={account.number}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Las cuentas de pago no están configuradas. Escríbenos para coordinar tu inscripción.
              </p>
            )}

            <p className="mt-4 rounded-lg bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              Transfiere exactamente{' '}
              <span className="font-semibold text-foreground">{formatPEN(price)}</span> y guarda el
              voucher o la captura de la operación.
            </p>
          </section>

          {/* Comprobante */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                2
              </span>
              <h2 className="font-semibold">Adjunta tu comprobante</h2>
            </div>

            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={pickFile}
                className="sr-only"
              />
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-8 text-center transition-colors hover:border-brand/50 hover:bg-muted/50">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {file ? 'Cambiar archivo' : 'Selecciona la captura o el voucher'}
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP o PDF · hasta 10 MB
                </span>
              </div>
            </label>

            {file && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3">
                {preview ? (
                  <img
                    src={preview}
                    alt="Vista previa del comprobante"
                    className="h-20 w-20 shrink-0 rounded-lg border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label="Quitar comprobante"
                  className="rounded-md p-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="method" className="mb-1.5 block text-xs font-medium">
                  Medio de pago
                </label>
                <select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className={inputCls}
                >
                  {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                    <option key={m} value={m}>
                      {PAYMENT_METHOD_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="operation" className="mb-1.5 block text-xs font-medium">
                  N.º de operación <span className="text-muted-foreground">(opcional)</span>
                </label>
                <input
                  id="operation"
                  value={operationNumber}
                  onChange={(e) => setOperationNumber(e.target.value)}
                  placeholder="Ej. 00123456"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="paidAt" className="mb-1.5 block text-xs font-medium">
                  Fecha del pago <span className="text-muted-foreground">(opcional)</span>
                </label>
                <input
                  id="paidAt"
                  type="date"
                  value={declaredPaidAt}
                  onChange={(e) => setDeclaredPaidAt(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          <Button
            type="submit"
            size="lg"
            disabled={submitting || !file}
            className="w-full bg-brand font-semibold text-white hover:bg-brand-600 sm:w-auto sm:px-10"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar comprobante'
            )}
          </Button>
        </form>

        {/* ── Resumen ────────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-muted-foreground">Resumen</h2>

            <p className="mt-3 font-semibold leading-snug">{course.title}</p>
            {course.academicHours > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {course.academicHours} horas académicas
              </p>
            )}

            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total a pagar</span>
              <span className="text-2xl font-black">{formatPEN(price)}</span>
            </div>

            <div className="mt-5 flex gap-2.5 rounded-lg bg-muted px-3 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Tu comprobante lo revisa el administrador. Solo él y tú pueden verlo. Cuando se
                valide, el programa aparecerá en tu panel.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function InscripcionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <RoleGuard allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
        <InscripcionContent slug={slug} />
      </RoleGuard>
    </div>
  );
}
