import { apiFetch } from '../api';

export type CertificateType =
  | 'PARTICIPACION'
  | 'APROBACION'
  | 'ESPECIALIZACION'
  | 'COMPETENCIAS'
  | 'EJECUTIVO';

export interface Certificate {
  id: string;
  code: string;
  userId: string;
  courseId: string;
  studentName: string;
  courseTitle: string;
  academicHours: number;
  competencies: string[];
  type: CertificateType;
  issuedAt: string;
  revokedAt: string | null;
  verifyUrl: string;
}

/** Lo que devuelve la verificación pública: sin ids internos ni correo. */
export interface CertificateVerification {
  valid: boolean;
  code: string;
  studentName: string;
  courseTitle: string;
  academicHours: number;
  competencies: string[];
  type: CertificateType;
  issuedAt: string;
  revokedAt: string | null;
}

/**
 * Nombres oficiales de cada tipo. Ninguno se presenta como acreditación
 * oficial: KORE emite certificados propios, no acredita ante terceros.
 */
export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  PARTICIPACION: 'Constancia de participación',
  APROBACION: 'Constancia de aprobación',
  ESPECIALIZACION: 'Certificado de especialización',
  COMPETENCIAS: 'Certificación de competencias',
  EJECUTIVO: 'Certificado ejecutivo',
};

export function getMyCertificates(): Promise<Certificate[]> {
  return apiFetch<Certificate[]>('/certificates/my');
}

/** Endpoint público: no requiere sesión. */
export function verifyCertificate(code: string): Promise<CertificateVerification> {
  return apiFetch<CertificateVerification>(`/certificates/verify/${encodeURIComponent(code)}`);
}

export function issueCertificate(courseId: string, studentId: string): Promise<Certificate> {
  return apiFetch<Certificate>(`/certificates/issue/${courseId}/student/${studentId}`, {
    method: 'POST',
  });
}
