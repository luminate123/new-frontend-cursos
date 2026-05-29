import Link from 'next/link';
import Image from 'next/image';
import { Code2, Zap, Shield, Globe, BookOpen, ArrowRight, Play, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { HomeRedirect } from '@/components/auth/HomeRedirect';

const STATS = [
  { label: 'Estudiantes', value: '10,000+', color: 'text-stone-800' },
  { label: 'Cursos', value: '100+', color: 'text-stone-800' },
  { label: 'Instructores', value: '50+', color: 'text-stone-800' },
  { label: 'Horas de contenido', value: '500+', color: 'text-stone-800' },
];

const FEATURES = [
  {
    icon: Code2,
    title: 'Cursos técnicos de calidad',
    description: 'Contenido creado por profesionales activos en la industria.',
    gradient: 'from-stone-800/8 to-stone-700/4',
    border: 'border-stone-700/20',
    iconBg: 'bg-stone-800/10',
    iconColor: 'text-stone-700',
  },
  {
    icon: Zap,
    title: 'Aprende a tu ritmo',
    description: 'Accede desde cualquier dispositivo. Sin fechas límite.',
    gradient: 'from-stone-700/8 to-stone-800/4',
    border: 'border-stone-700/20',
    iconBg: 'bg-stone-800/10',
    iconColor: 'text-stone-700',
  },
  {
    icon: Shield,
    title: 'Certificados verificables',
    description: 'Demuestra tus habilidades con certificados de finalización.',
    gradient: 'from-stone-800/8 to-stone-700/4',
    border: 'border-stone-700/20',
    iconBg: 'bg-stone-800/10',
    iconColor: 'text-stone-700',
  },
  {
    icon: Globe,
    title: 'Comunidad global',
    description: 'Conecta con miles de estudiantes y mentores.',
    gradient: 'from-stone-700/8 to-stone-800/4',
    border: 'border-stone-700/20',
    iconBg: 'bg-stone-800/10',
    iconColor: 'text-stone-700',
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
    <div className="min-h-screen bg-[#f5f0e6] text-stone-900">
      <HomeRedirect />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[1000px] rounded-full bg-stone-800/4 blur-3xl" />
          <div className="absolute top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-stone-700/3 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-stone-700/3 blur-3xl" />
        </div>

        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(26,18,8,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(26,18,8,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-28 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-stone-700/20 bg-stone-900/8 px-5 py-2 text-sm text-stone-700">
            <Zap className="h-3.5 w-3.5 text-stone-700" />
            <span>La plataforma de aprendizaje tech #1</span>
            <Star className="h-3 w-3 text-stone-700 fill-stone-700" />
          </div>

          {/* Logo hero */}
          <div className="mb-8 flex justify-center">
            <Image src="/image 2.svg" alt="Kore Training & Consulting" width={320} height={100} className="h-20 w-auto" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight md:text-7xl">
            Domina las{' '}
            <span className="bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 bg-clip-text text-transparent">
              tecnologías
            </span>
            <br />
            del futuro
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-stone-600">
            Aprende programación, diseño y negocios con instructores expertos.
            Cursos prácticos, proyectos reales, comunidad activa.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/cursos">
              <Button size="lg" className="bg-stone-900 hover:bg-stone-800 text-[#f5f0e6] font-semibold px-8 shadow-lg shadow-stone-900/20">
                Explorar cursos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="lg" variant="outline" className="border-[#c9beab] text-stone-700 hover:border-stone-700/50 hover:text-stone-900 hover:bg-stone-900/5">
                <Play className="mr-2 h-4 w-4" />
                Crear cuenta gratis
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-stone-500">
            <div className="flex -space-x-1.5">
              {['A', 'B', 'C', 'D'].map((l) => (
                <div key={l} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#f5f0e6] bg-stone-900/15 text-[10px] font-bold text-stone-700">
                  {l}
                </div>
              ))}
            </div>
            <span>+10,000 estudiantes ya aprendiendo</span>
          </div>

          {/* Code card */}
          <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-[#c9beab] bg-[#ede7d9] p-5 text-left font-mono text-sm shadow-2xl shadow-stone-900/10">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-stone-500">main.ts</span>
            </div>
            <div className="space-y-1 text-xs leading-relaxed">
              <p><span className="text-purple-600">const</span> <span className="text-stone-700">skills</span> <span className="text-stone-500">=</span> <span className="text-stone-700">await</span> KoreTraining.<span className="text-amber-700">learn</span>{'({'}</p>
              <p className="pl-4"><span className="text-emerald-700">courses</span>: [<span className="text-orange-700">&apos;React&apos;</span>, <span className="text-orange-700">&apos;NestJS&apos;</span>, <span className="text-orange-700">&apos;DevOps&apos;</span>],</p>
              <p className="pl-4"><span className="text-emerald-700">instructor</span>: <span className="text-orange-700">&apos;expert&apos;</span>,</p>
              <p className="pl-4"><span className="text-emerald-700">practice</span>: <span className="text-stone-700">true</span>,</p>
              <p>{'}'});</p>
              <p className="mt-2 text-stone-400">{'// ✓ Career unlocked 🚀'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="border-y border-[#c9beab] bg-[#ede7d9]/60">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="mt-1 text-sm text-stone-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-stone-900">Explora por categoría</h2>
          <p className="mt-2 text-stone-500">Encuentra el área que te apasiona</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-[#c9beab] bg-[#ede7d9] p-5 text-center transition-all duration-200 hover:border-stone-700/30 hover:bg-stone-900/5 hover:-translate-y-1"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-stone-600 group-hover:text-stone-900 transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-t border-[#c9beab]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-stone-900">¿Por qué Kore Training?</h2>
            <p className="mt-2 text-stone-500">Todo lo que necesitas para crecer profesionalmente</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group rounded-2xl border ${f.border} bg-gradient-to-br ${f.gradient} p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/10`}
              >
                <div className={`mb-4 inline-flex rounded-xl p-2.5 ${f.iconBg}`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted section ──────────────────────────────────────────────── */}
      <section className="border-t border-[#c9beab] bg-[#ede7d9]/40">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-stone-500">Tecnologías que enseñamos</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {['React', 'Node.js', 'TypeScript', 'NestJS', 'Python', 'Docker', 'AWS', 'PostgreSQL'].map((tech) => (
              <span key={tech} className="rounded-full border border-[#c9beab] bg-[#ede7d9] px-4 py-1.5 text-sm font-medium text-stone-600">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-stone-700/20 bg-gradient-to-br from-stone-800/8 via-[#ede7d9] to-stone-700/5 p-14 text-center">
          {/* Glow effects */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-stone-800/8 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-stone-700/8 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-700/20 bg-stone-900/8 px-4 py-1.5 text-sm text-stone-700">
              <Users className="h-3.5 w-3.5" />
              <span>Únete a la comunidad</span>
            </div>
            <h2 className="text-4xl font-black text-stone-900">
              Empieza a aprender{' '}
              <span className="bg-gradient-to-r from-stone-800 to-stone-700 bg-clip-text text-transparent">
                hoy mismo
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-stone-600 leading-relaxed">
              Únete a miles de estudiantes que ya están construyendo su futuro.
              Registro gratuito, sin tarjeta de crédito.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/registro">
                <Button size="lg" className="bg-stone-900 hover:bg-stone-800 text-[#f5f0e6] font-semibold px-8 shadow-lg shadow-stone-900/20">
                  Comenzar gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cursos">
                <Button size="lg" variant="outline" className="border-[#c9beab] text-stone-700 hover:border-stone-700/50 hover:text-stone-900">
                  Ver todos los cursos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#c9beab] py-10">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <Image src="/image 2.svg" alt="Kore Training & Consulting" width={120} height={38} className="h-8 w-auto" />
          <p className="text-sm text-stone-500">© 2026 Kore Training & Consulting. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-sm text-stone-500">
            <Link href="/cursos" className="hover:text-stone-700 transition-colors">Cursos</Link>
            <Link href="/login" className="hover:text-stone-700 transition-colors">Iniciar sesión</Link>
            <Link href="/registro" className="hover:text-stone-700 transition-colors">Registro</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
