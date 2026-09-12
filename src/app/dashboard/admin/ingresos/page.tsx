'use client';

import Link from 'next/link';
import { ArrowLeft, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { RevenueView } from '@/components/revenue/RevenueView';
import { getRevenue } from '@/lib/api/payments';

/** Vista general de la academia: todos los programas, todos los instructores. */
export default function AdminIngresosPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Panel
        </Link>

        <RevenueView
          title="Ingresos de la academia"
          subtitle="Solo cuentan los pagos aprobados, por su fecha de validación."
          fetcher={getRevenue}
          actions={
            <Link href="/dashboard/admin/pagos">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Receipt className="h-3.5 w-3.5" />
                Revisar pagos
              </Button>
            </Link>
          }
        />
      </div>
    </RoleGuard>
  );
}
