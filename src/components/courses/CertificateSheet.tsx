'use client';

import { useEffect, useState } from 'react';
import { CERTIFICATE_TYPE_LABELS, type CertificateType } from '@/lib/api/certificates';

interface CertificateSheetProps {
  code: string;
  studentName: string;
  courseTitle: string;
  academicHours: number;
  competencies: string[];
  type: CertificateType;
  issuedAt: string;
  verifyUrl: string;
  revokedAt?: string | null;
}

/**
 * Hoja del certificado. Se imprime desde el navegador con Ctrl+P; el CSS de
 * `@media print` en globals.css oculta lo que no es la hoja.
 *
 * ponytail: sin librería de PDF. Si más adelante hace falta un PDF firmado o
 * enviarlo por correo, eso se genera en el backend con pdf-lib.
 */
export function CertificateSheet(props: CertificateSheetProps) {
  const {
    code,
    studentName,
    courseTitle,
    academicHours,
    competencies,
    type,
    issuedAt,
    verifyUrl,
    revokedAt,
  } = props;

  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    // Import dinámico: la librería solo se descarga en esta vista.
    let cancelled = false;
    import('qrcode')
      .then((QRCode) =>
        QRCode.toDataURL(verifyUrl, { margin: 0, width: 256, errorCorrectionLevel: 'M' }),
      )
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch(() => {
        // Sin QR el certificado sigue siendo verificable por su código.
      });
    return () => {
      cancelled = true;
    };
  }, [verifyUrl]);

  const issued = new Date(issuedAt).toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className="mx-auto w-full max-w-3xl bg-white text-navy-950 print:max-w-none">
      <div className="relative overflow-hidden rounded-2xl border-2 border-navy-950 p-8 sm:p-12 print:rounded-none print:border">
        {/* Franja de marca */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-500" />

        {revokedAt && (
          <p className="mb-6 rounded-lg border border-red-600 bg-red-50 px-3 py-2 text-center text-sm font-bold uppercase tracking-wide text-red-700">
            Certificado anulado
          </p>
        )}

        <header className="text-center">
          <p className="text-xl font-black tracking-tight">KORE GROUP</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-navy-600">
            Educación Profesional
          </p>
        </header>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.18em] text-navy-600">
          {CERTIFICATE_TYPE_LABELS[type]}
        </p>

        <p className="mt-8 text-center text-sm text-navy-600">Se otorga a</p>
        <p className="mt-1 text-center text-3xl font-black tracking-tight sm:text-4xl">
          {studentName}
        </p>

        <p className="mt-7 text-center text-sm text-navy-600">
          por haber culminado satisfactoriamente el programa
        </p>
        <p className="mt-1 text-center text-xl font-bold leading-snug">{courseTitle}</p>

        {academicHours > 0 && (
          <p className="mt-3 text-center text-sm text-navy-600">
            con una duración de{' '}
            <span className="font-semibold text-navy-950">{academicHours} horas académicas</span>
          </p>
        )}

        {competencies.length > 0 && (
          <section className="mt-9 border-t border-navy-200 pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy-600">
              Competencias desarrolladas
            </p>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {competencies.map((competency) => (
                <li key={competency} className="flex gap-2 text-sm">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                  {competency}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-10 flex items-end justify-between gap-6 border-t border-navy-200 pt-6">
          <div className="text-xs text-navy-600">
            <p>
              Emitido el <span className="font-medium text-navy-950">{issued}</span>
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em]">Código de verificación</p>
            <p className="font-mono text-sm font-bold tracking-wider text-navy-950">{code}</p>
            <p className="mt-2 max-w-xs text-[10px] leading-relaxed">
              Verifica este certificado en {verifyUrl}
            </p>
          </div>

          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt={`Código QR para verificar el certificado ${code}`}
              className="h-24 w-24 shrink-0"
            />
          )}
        </footer>
      </div>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-navy-600 print:mt-2">
        Este documento acredita la participación del titular en un programa de formación de KORE
        Group. No constituye un grado ni un título con reconocimiento oficial.
      </p>
    </article>
  );
}
