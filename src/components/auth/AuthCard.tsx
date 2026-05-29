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
    <div className="flex min-h-screen items-center justify-center bg-[#f5f0e6] px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-stone-900/3 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="mb-8 flex flex-col items-center">
          <Image src="/image 2.svg" alt="Kore Training & Consulting" width={220} height={70} className="h-16 w-auto" />
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-[#c9beab] bg-[#ede7d9] p-8 shadow-2xl shadow-stone-900/10">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-stone-900">{title}</h2>
            <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
