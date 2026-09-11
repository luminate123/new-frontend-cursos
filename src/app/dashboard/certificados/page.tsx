'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Copy, Check, Loader2, Printer, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CertificateSheet } from '@/components/courses/CertificateSheet';
import {
  getMyCertificates,
  CERTIFICATE_TYPE_LABELS,
  type Certificate,
} from '@/lib/api/certificates';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Lima',
  });

function CodeCopy({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          toast.error('No se pudo copiar el código');
        }
      }}
      className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground"
    >
      {code}
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export default function CertificadosPage() {
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [open, setOpen] = useState<Certificate | null>(null);

  useEffect(() => {
    getMyCertificates()
      .then(setCertificates)
      .catch(() => {
        toast.error('No se pudieron cargar tus certificados');
        setCertificates([]);
      });
  }, []);

  if (!certificates) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Vista de impresión: solo la hoja queda visible (ver @media print).
  if (open) {
    return (
      <div className="min-h-screen bg-muted py-8">
        <div className="no-print mx-auto mb-6 flex max-w-3xl items-center justify-between px-4">
          <Button variant="ghost" onClick={() => setOpen(null)} className="gap-1.5">
            <X className="h-4 w-4" />
            Cerrar
          </Button>
          <Button
            onClick={() => window.print()}
            className="gap-1.5 bg-brand font-semibold text-white hover:bg-brand-600"
          >
            <Printer className="h-4 w-4" />
            Imprimir o guardar como PDF
          </Button>
        </div>
        <div className="px-4">
          <CertificateSheet
            code={open.code}
            studentName={open.studentName}
            courseTitle={open.courseTitle}
            academicHours={open.academicHours}
            competencies={open.competencies ?? []}
            type={open.type}
            issuedAt={open.issuedAt}
            verifyUrl={open.verifyUrl}
            revokedAt={open.revokedAt}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-black tracking-tight">Mis certificados</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cada certificado lleva un código único que cualquiera puede verificar en línea.
      </p>

      {certificates.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border py-16 text-center">
          <Award className="mx-auto h-9 w-9 text-border" />
          <p className="mt-4 font-medium">Todavía no tienes certificados</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Se emiten al completar el 100% de un programa en el que estés inscrito.
          </p>
          <Link href="/cursos">
            <Button className="mt-6 bg-brand font-semibold text-white hover:bg-brand-600">
              Ver programas
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {certificates.map((certificate) => (
            <li
              key={certificate.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{certificate.courseTitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {CERTIFICATE_TYPE_LABELS[certificate.type]}
                  {certificate.academicHours > 0 && <> · {certificate.academicHours} h académicas</>}
                  {' · '}
                  {fmtDate(certificate.issuedAt)}
                </p>
                <div className="mt-2">
                  <CodeCopy code={certificate.code} />
                </div>
                {certificate.revokedAt && (
                  <p className="mt-2 text-xs font-medium text-destructive">
                    Certificado anulado el {fmtDate(certificate.revokedAt)}
                  </p>
                )}
              </div>

              <Button variant="outline" onClick={() => setOpen(certificate)} className="gap-1.5">
                <Printer className="h-4 w-4" />
                Ver certificado
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
