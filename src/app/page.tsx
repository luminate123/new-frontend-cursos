import Link from 'next/link';
import Image from 'next/image';
import { Code2, Zap, Shield, Globe, BookOpen, ArrowRight, Play, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { HomeRedirect } from '@/components/auth/HomeRedirect';

const STATS = [
  { label: 'Estudiantes', value: '10,000+', color: 'text-[#0F1E3C]' },
  { label: 'Cursos', value: '100+', color: 'text-[#0F1E3C]' },
  { label: 'Instructores', value: '50+', color: 'text-[#0F1E3C]' },
  { label: 'Horas de contenido', value: '500+', color: 'text-[#0F1E3C]' },
];

const FEATURES = [
  {
    icon: Code2,
    title: 'Cursos técnicos de calidad',
    description: 'Contenido creado por profesionales activos en la industria.',
    gradient: 'from-[#0F1E3C]/8 to-[#0F1E3C]/4',
    border: 'border-[#0F1E3C]/15',
    iconBg: 'bg-[#0F1E3C]/10',
    iconColor: 'text-[#0F1E3C]',
  },
  {
    icon: Zap,
    title: 'Aprende a tu ritmo',
    description: 'Accede desde cualquier dispositivo. Sin fechas límite.',
    gradient: 'from-[#0F1E3C]/6 to-[#0F1E3C]/3',
    border: 'border-[#0F1E3C]/15',
    iconBg: 'bg-[#0F1E3C]/10',
    iconColor: 'text-[#0F1E3C]',
  },
  {
    icon: Shield,
    title: 'Certificados verificables',
    description: 'Demuestra tus habilidades con certificados de finalización.',
    gradient: 'from-[#0F1E3C]/8 to-[#0F1E3C]/4',
    border: 'border-[#0F1E3C]/15',
    iconBg: 'bg-[#0F1E3C]/10',
    iconColor: 'text-[#0F1E3C]',
  },
  {
    icon: Globe,
    title: 'Comunidad global',
    description: 'Conecta con miles de estudiantes y mentores.',
    gradient: 'from-[#0F1E3C]/6 to-[#0F1E3C]/3',
    border: 'border-[#0F1E3C]/15',
    iconBg: 'bg-[#0F1E3C]/10',
    iconColor: 'text-[#0F1E3C]',
  },
];

const CATEGORIES = [
  { label: 'Programación', emoji: '💻', href: '/cursos?category=PROGRAMMING' },
  { label: 'Diseño', emoji: '🎨', href: '/cursos?category=DESIGN' },
  { label: 'Negocios', emoji: '📈', href: '/cursos?category=BUSINESS' },
  { label: 'Marketing', emoji: '📣', href: '/cursos?category=MARKETING' },
  { label: 'Fotografía', emoji: '📷', href: '/cursos?category=PHOTOGRAPHY' },
  { label: 'Música', emoji: '🎵', href: '/cursos?category=MUSIC' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-[#0F1E3C]">
      <HomeRedirect />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[1000px] rounded-full bg-[#0F1E3C]/5 blur-3xl" />
          <div className="absolute top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-[#0F1E3C]/3 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-[#0F1E3C]/3 blur-3xl" />
        </div>

        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,30,60,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(15,30,60,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-28 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#0F1E3C]/20 bg-[#0F1E3C]/8 px-5 py-2 text-sm text-[#0F1E3C]">
            <Zap className="h-3.5 w-3.5 text-[#0F1E3C]" />
            <span>La plataforma de aprendizaje tech #1</span>
            <Star className="h-3 w-3 text-[#0F1E3C] fill-[#0F1E3C]" />
          </div>

          {/* Logo hero */}
          <div className="mb-8 flex justify-center">
            <Image src="/logo.svg" alt="Kore Training & Consulting" width={320} height={100} className="h-20 w-auto" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight md:text-7xl">
            Domina las{' '}
            <span className="bg-gradient-to-r from-[#0F1E3C] via-[#1B3461] to-[#0F1E3C] bg-clip-text text-transparent">
              tecnologías
            </span>
            <br />
            del futuro
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-[#4B5563]">
            Aprende programación, diseño y negocios con instructores expertos.
            Cursos prácticos, proyectos reales, comunidad activa.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/cursos">
              <Button size="lg" className="bg-[#F97316] hover:bg-[#EA6D0E] text-white font-semibold px-8 shadow-lg shadow-[#F97316]/30">
                Ver Catálogo de Cursos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="lg" variant="outline" className="border-[#0F1E3C]/30 text-[#0F1E3C] hover:border-[#0F1E3C]/60 hover:text-[#0F1E3C] hover:bg-[#0F1E3C]/5">
                <Play className="mr-2 h-4 w-4" />
                Crear cuenta gratis
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-[#4B5563]">
            <div className="flex -space-x-1.5">
              {['A', 'B', 'C', 'D'].map((l) => (
                <div key={l} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0F1E3C]/15 text-[10px] font-bold text-[#0F1E3C]">
                  {l}
                </div>
              ))}
            </div>
            <span>+10,000 estudiantes ya aprendiendo</span>
          </div>

        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="mt-1 text-sm text-[#4B5563]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-[#0F1E3C]">Explora por categoría</h2>
          <p className="mt-2 text-[#4B5563]">Encuentra el área que te apasiona</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card p-5 text-center transition-all duration-200 hover:border-[#0F1E3C]/20 hover:bg-[#0F1E3C]/5 hover:-translate-y-1"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-[#4B5563] group-hover:text-[#0F1E3C] transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-[#0F1E3C]">¿Por qué Kore Training?</h2>
            <p className="mt-2 text-[#4B5563]">Todo lo que necesitas para crecer profesionalmente</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group rounded-2xl border ${f.border} bg-gradient-to-br ${f.gradient} p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0F1E3C]/10`}
              >
                <div className={`mb-4 inline-flex rounded-xl p-2.5 ${f.iconBg}`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-[#0F1E3C]">{f.title}</h3>
                <p className="mt-2 text-sm text-[#4B5563] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted section ──────────────────────────────────────────────── */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-[#4B5563]">Tecnologías que enseñamos</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {['React', 'Node.js', 'TypeScript', 'NestJS', 'Python', 'Docker', 'AWS', 'PostgreSQL'].map((tech) => (
              <span key={tech} className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-[#0F1E3C]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-[#0F1E3C]/15 bg-gradient-to-br from-[#0F1E3C]/8 via-card to-[#0F1E3C]/4 p-14 text-center">
          {/* Glow effects */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#0F1E3C]/8 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#0F1E3C]/6 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0F1E3C]/20 bg-[#0F1E3C]/8 px-4 py-1.5 text-sm text-[#0F1E3C]">
              <Users className="h-3.5 w-3.5" />
              <span>Únete a la comunidad</span>
            </div>
            <h2 className="text-4xl font-black text-[#0F1E3C]">
              Empieza a aprender{' '}
              <span className="bg-gradient-to-r from-[#0F1E3C] to-[#1B3461] bg-clip-text text-transparent">
                hoy mismo
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[#4B5563] leading-relaxed">
              Únete a miles de estudiantes que ya están construyendo su futuro.
              Registro gratuito, sin tarjeta de crédito.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/registro">
                <Button size="lg" className="bg-[#F97316] hover:bg-[#EA6D0E] text-white font-semibold px-8 shadow-lg shadow-[#F97316]/30">
                  Comenzar gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cursos">
                <Button size="lg" variant="outline" className="border-[#0F1E3C]/30 text-[#0F1E3C] hover:border-[#0F1E3C]/60 hover:text-[#0F1E3C]">
                  Ver todos los cursos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#0F1E3C] py-10">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <Image src="/logo.svg" alt="Kore Training & Consulting" width={120} height={38} className="h-8 w-auto brightness-0 invert" />
          <p className="text-sm text-white/60">© 2026 Kore Training & Consulting. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-sm text-white/60">
            <Link href="/cursos" className="hover:text-white transition-colors">Cursos</Link>
            <Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link>
            <Link href="/registro" className="hover:text-white transition-colors">Registro</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
