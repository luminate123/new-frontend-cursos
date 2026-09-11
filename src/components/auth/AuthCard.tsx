import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-muted blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="mb-8 flex flex-col items-center">
          <Image src="/logo.svg" alt="Kore Training & Consulting" width={220} height={70} className="h-16 w-auto" />
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-navy/20">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
