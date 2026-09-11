import { apiFetch } from '../api';
import type { Course } from '../types';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentMethod = 'BCP_SOLES' | 'INTERBANK' | 'OTHER';

export interface BankAccount {
  type: PaymentMethod;
  label: string;
  number: string;
}

export interface BankInfo {
  holder: string;
  bank: string;
  currency: string;
  accounts: BankAccount[];
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  operationNumber: string | null;
  declaredPaidAt: string | null;
  status: PaymentStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  // Solo en la cola del admin (GET /payments).
  reviewer?: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
  enrollment: {
    id: string;
    status: string;
    course?: Pick<Course, 'id' | 'title' | 'slug' | 'thumbnail' | 'price'>;
    user?: { id: string; firstName: string; lastName: string; email: string };
  };
}

export interface PaymentsResponse {
  data: Payment[];
  meta: { total: number; page: number; limit: number; lastPage: number };
}

export interface Revenue {
  currency: string;
  totalRevenue: number;
  sales: number;
  avgTicket: number;
  pendingCount: number;
  pendingAmount: number;
  series: { period: string; revenue: number; sales: number }[];
  byCourse: { courseId: string; title: string; line: string; revenue: number; sales: number }[];
}

export interface CheckoutData {
  receiptKey: string;
  method?: PaymentMethod;
  operationNumber?: string;
  declaredPaidAt?: string;
}

// Los comprobantes son capturas o vouchers: 10 MB sobra y evita subidas absurdas.
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
const RECEIPT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'En revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BCP_SOLES: 'Transferencia o depósito BCP',
  INTERBANK: 'Transferencia interbancaria (CCI)',
  OTHER: 'Otro medio',
};

export function getBankInfo(): Promise<BankInfo> {
  return apiFetch<BankInfo>('/payments/bank-info');
}

/**
 * Sube el comprobante a R2 y devuelve solo su key: a diferencia del material
 * de clase, el comprobante no tiene URL pública porque lleva datos bancarios.
 */
export async function uploadReceipt(file: File): Promise<string> {
  if (!RECEIPT_TYPES.includes(file.type)) {
    throw new Error('El comprobante debe ser una imagen (PNG, JPG, WEBP) o un PDF');
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    throw new Error('El comprobante supera el límite de 10 MB');
  }

  const { uploadUrl, key } = await apiFetch<{ uploadUrl: string; key: string }>(
    '/uploads/presign/receipt',
    {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
    },
  );

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) throw new Error('Error al subir el comprobante');

  return key;
}

export function checkout(courseId: string, data: CheckoutData): Promise<Payment> {
  return apiFetch<Payment>(`/courses/${courseId}/checkout`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMyPayments(): Promise<Payment[]> {
  return apiFetch<Payment[]>('/payments/my');
}

/** URL temporal (5 min) para ver el comprobante. */
export function getReceiptUrl(paymentId: string): Promise<{ url: string }> {
  return apiFetch<{ url: string }>(`/payments/${paymentId}/receipt`);
}

// ─── Administración ─────────────────────────────────────────────────────────

export function getPayments(params: {
  status?: PaymentStatus;
  page?: number;
  limit?: number;
} = {}): Promise<PaymentsResponse> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  return apiFetch<PaymentsResponse>(`/payments${suffix}`);
}

export function approvePayment(id: string): Promise<Payment> {
  return apiFetch<Payment>(`/payments/${id}/approve`, { method: 'PATCH' });
}

export function rejectPayment(id: string, reason: string): Promise<Payment> {
  return apiFetch<Payment>(`/payments/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export function getRevenue(range: { from?: string; to?: string } = {}): Promise<Revenue> {
  const qs = new URLSearchParams();
  if (range.from) qs.set('from', range.from);
  if (range.to) qs.set('to', range.to);
  const suffix = qs.toString() ? `?${qs}` : '';
  return apiFetch<Revenue>(`/admin/revenue${suffix}`);
}
