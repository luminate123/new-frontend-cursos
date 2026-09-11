'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, Loader2, Search } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';

export default function VerificarPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [going, setGoing] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setGoing(true);
    router.push(`/verificar/${encodeURIComponent(clean)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="mx-auto max-w-lg px-4 py-20">
        <div className="text-center">
          <div className="mx-auto mb-5 inline-flex rounded-2xl border border-border bg-card p-3">
            <BadgeCheck className="h-6 w-6 text-brand-600" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Verificar certificado</h1>
          <p className="mt-2 text-muted-foreground">
            Ingresa el código impreso en el certificado para comprobar su autenticidad.
          </p>
        </div>

        <form onSubmit={submit} className="mt-9 space-y-3">
          <label htmlFor="code" className="block text-sm font-medium">
            Código de verificación
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="KORE-2026-A7F3K2"
              autoComplete="off"
              spellCheck={false}
              className="h-12 w-full rounded-xl border border-border bg-card pl-9 pr-4 font-mono text-sm tracking-wider text-foreground placeholder-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!code.trim() || going}
            className="w-full bg-brand font-semibold text-white hover:bg-brand-600"
          >
            {going ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verificar
          </Button>
        </form>

        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          También puedes escanear el código QR del certificado.{' '}
          <Link href="/cursos" className="text-brand-600 hover:underline">
            Ver programas
          </Link>
        </p>
      </div>
    </div>
  );
}
