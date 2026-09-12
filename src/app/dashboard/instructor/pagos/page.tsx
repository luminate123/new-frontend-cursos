'use client';

import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { PaymentReviewList } from '@/components/payments/PaymentReviewList';
import { getInstructorPayments } from '@/lib/api/payments';

/**
 * Comprobantes de los programas del instructor. El dinero entra a su cuenta,
 * así que es él quien confirma que llegó: aprobar el comprobante es lo que da
 * acceso al alumno.
 */
export default function InstructorPagosPage() {
  return (
    <RoleGuard allowedRoles={['INSTRUCTOR']}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Mi panel
            </Link>
            <h1 className="mt-3 text-2xl font-black tracking-tight">Pagos de mis programas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisa el comprobante y confirma que el dinero llegó a tu cuenta. Al confirmarlo,
              el alumno obtiene el acceso.
            </p>
          </div>
          <Link href="/dashboard/instructor/ingresos">
            <Button variant="outline" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Mis ingresos
            </Button>
          </Link>
        </div>

        <PaymentReviewList
          fetcher={getInstructorPayments}
          emptyHint="No hay comprobantes de tus programas con este estado."
        />
      </div>
    </RoleGuard>
  );
}
