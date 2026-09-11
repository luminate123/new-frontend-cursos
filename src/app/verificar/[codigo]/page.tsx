'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import {
  verifyCertificate,
  CERTIFICATE_TYPE_LABELS,
  type CertificateVerification,
} from '@/lib/api/certificates';

type State =
  | { kind: 'loading' }
  | { kind: 'found'; data: CertificateVerification }
  | { kind: 'notFound' }
  | { kind: 'error' };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Lima', // se renderiza en Cloudflare, que corre en UTC
  });

function ResultCard({ data }: { data: CertificateVerification }) {
  const revoked = !data.valid;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div
        className={`flex items-center gap-3 px-6 py-4 ${
          revoked ? 'bg-destructive/10' : 'bg-success/10'
        }`}
      >
        {revoked ? (
          <XCircle className="h-6 w-6 shrink-0 text-destructive" />
        ) : (
          <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
        )}
        <div>
          <p className={`font-bold ${revoked ? 'text-destructive' : 'text-success'}`}>
            {revoked ? 'Certificado anulado' : 'Certificado válido'}
          </p>
          <p className="text-xs text-muted-foreground">
            {revoked
              ? `Anulado el ${data.revokedAt ? fmtDate(data.revokedAt) : '—'}`
              : 'Emitido por KORE Group'}
          </p>
        </div>
      </div>

      <dl className="divide-y divide-border">
        <div className="px-6 py-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Otorgado a
          </dt>
          <dd className="mt-1 text-lg font-bold">{data.studentName}</dd>
        </div>

        <div className="px-6 py-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Programa
          </dt>
          <dd className="mt-1 font-semibold leading-snug">{data.courseTitle}</dd>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="px-6 py-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tipo
            </dt>
            <dd className="mt-1 text-sm">{CERTIFICATE_TYPE_LABELS[data.type]}</dd>
          </div>
          <div className="px-6 py-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Horas académicas
            </dt>
            <dd className="mt-1 text-sm tabular-nums">{data.academicHours || '—'}</dd>
          </div>
        </div>

        {data.competencies.length > 0 && (
          <div className="px-6 py-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Competencias desarrolladas
            </dt>
            <dd className="mt-2">
              <ul className="space-y-1.5">
                {data.competencies.map((competency) => (
                  <li key={competency} className="flex gap-2 text-sm">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                    {competency}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="px-6 py-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Emitido el
            </dt>
            <dd className="mt-1 text-sm">{fmtDate(data.issuedAt)}</dd>
          </div>
          <div className="px-6 py-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Código
            </dt>
            <dd className="mt-1 font-mono text-sm font-semibold tracking-wider">{data.code}</dd>
          </div>
        </div>
      </dl>

      <p className="border-t border-border bg-muted/50 px-6 py-3 text-xs leading-relaxed text-muted-foreground">
        Este certificado acredita la participación del titular en un programa de formación de KORE
        Group. No constituye un grado ni un título con reconocimiento oficial.
      </p>
    </div>
  );
}

export default function VerificarCodigoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = use(params);
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    verifyCertificate(decodeURIComponent(codigo))
      .then((data) => setState({ kind: 'found', data }))
      .catch((err: { statusCode?: number }) =>
        setState({ kind: err?.statusCode === 404 ? 'notFound' : 'error' }),
      );
  }, [codigo]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="mx-auto max-w-xl px-4 py-12">
        <Link
          href="/verificar"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Verificar otro código
        </Link>

        <h1 className="mt-4 text-2xl font-black tracking-tight">Verificación de certificado</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {decodeURIComponent(codigo)}
        </p>

        <div className="mt-7">
          {state.kind === 'loading' && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {state.kind === 'found' && <ResultCard data={state.data} />}

          {state.kind === 'notFound' && (
            <div className="rounded-2xl border border-border bg-card py-14 text-center">
              <XCircle className="mx-auto h-9 w-9 text-destructive" />
              <p className="mt-4 font-semibold">No existe un certificado con ese código</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Revisa que lo hayas copiado completo, incluyendo los guiones.
              </p>
            </div>
          )}

          {state.kind === 'error' && (
            <div className="rounded-2xl border border-border bg-card py-14 text-center">
              <AlertTriangle className="mx-auto h-9 w-9 text-warning" />
              <p className="mt-4 font-semibold">No pudimos completar la verificación</p>
              <p className="mt-1 text-sm text-muted-foreground">Intenta de nuevo en unos minutos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
