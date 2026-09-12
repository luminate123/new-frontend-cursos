'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { RevenueView } from '@/components/revenue/RevenueView';
import { getInstructorRevenue } from '@/lib/api/payments';

/**
 * Ingresos del instructor autenticado. El backend acota por el id del token,
 * así que esta página no puede pedir los de otro aunque se manipule la URL.
 *
 * Solo INSTRUCTOR: el admin tiene su propia vista general, y este endpoint le
 * respondería 403.
 */
export default function InstructorIngresosPage() {
  return (
    <RoleGuard allowedRoles={['INSTRUCTOR']}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Mi panel
        </Link>

        <RevenueView
          title="Mis ingresos"
          subtitle="Lo generado por tus programas. Solo cuentan los pagos ya validados por administración."
          fetcher={getInstructorRevenue}
          courseColumnLabel="Mi programa"
          emptyCourses="Todavía no hay ventas de tus programas."
        />
      </div>
    </RoleGuard>
  );
}
