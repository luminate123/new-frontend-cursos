import Link from 'next/link';
import { Code2, Zap, Shield, Globe, BookOpen, ArrowRight, Play, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { HomeRedirect } from '@/components/auth/HomeRedirect';

const STATS = [
  { label: 'Estudiantes', value: '10,000+', color: 'text-blue-400' },
  { label: 'Cursos', value: '100+', color: 'text-indigo-400' },
  { label: 'Instructores', value: '50+', color: 'text-blue-300' },
  { label: 'Horas de contenido', value: '500+', color: 'text-blue-400' },
];

const FEATURES = [
  {
    icon: Code2,
    title: 'Cursos técnicos de calidad',
    description: 'Contenido creado por profesionales activos en la industria.',
    gradient: 'from-blue-600/20 to-indigo-600/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-600/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Zap,
    title: 'Aprende a tu ritmo',
    description: 'Accede desde cualquier dispositivo. Sin fechas límite.',
    gradient: 'from-indigo-600/20 to-blue-600/10',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-600/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: Shield,
    title: 'Certificados verificables',
    description: 'Demuestra tus habilidades con certificados de finalización.',
    gradient: 'from-blue-600/20 to-cyan-600/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-600/20',
    iconColor: 'text-blue-300',
  },
  {
    icon: Globe,
    title: 'Comunidad global',
    description: 'Conecta con miles de estudiantes y mentores.',
    gradient: 'from-indigo-600/20 to-blue-600/10',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-600/20',
    iconColor: 'text-indigo-400',
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
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      <HomeRedirect />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[1000px] rounded-full bg-blue-600/8 blur-3xl" />
          <div className="absolute top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/6 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/6 blur-3xl" />
        </div>

        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-28 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-600/10 px-5 py-2 text-sm text-blue-300">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>La plataforma de aprendizaje tech #1</span>
            <Star className="h-3 w-3 text-blue-400 fill-blue-400" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight md:text-7xl">
            Domina las{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
              tecnologías
            </span>
            <br />
            del futuro
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-400">
            Aprende programación, diseño y negocios con instructores expertos.
            Cursos prácticos, proyectos reales, comunidad activa.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/cursos">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 shadow-lg shadow-blue-600/30">
                Explorar cursos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="lg" variant="outline" className="border-[#1e2d4a] text-slate-300 hover:border-blue-500/50 hover:text-blue-300 hover:bg-blue-600/5">
                <Play className="mr-2 h-4 w-4" />
                Crear cuenta gratis
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">
            <div className="flex -space-x-1.5">
              {['A', 'B', 'C', 'D'].map((l) => (
                <div key={l} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#080c14] bg-blue-600/30 text-[10px] font-bold text-blue-300">
                  {l}
                </div>
              ))}
            </div>
            <span>+10,000 estudiantes ya aprendiendo</span>
          </div>

          {/* Code card */}
          <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-5 text-left font-mono text-sm shadow-2xl shadow-black/50">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-slate-600">main.ts</span>
            </div>
            <div className="space-y-1 text-xs leading-relaxed">
              <p><span className="text-purple-400">const</span> <span className="text-blue-300">skills</span> <span className="text-slate-600">=</span> <span className="text-blue-400">await</span> EduTech.<span className="text-indigo-400">learn</span>{'({'}</p>
              <p className="pl-4"><span className="text-emerald-400">courses</span>: [<span className="text-amber-300">&apos;React&apos;</span>, <span className="text-amber-300">&apos;NestJS&apos;</span>, <span className="text-amber-300">&apos;DevOps&apos;</span>],</p>
              <p className="pl-4"><span className="text-emerald-400">instructor</span>: <span className="text-amber-300">&apos;expert&apos;</span>,</p>
              <p className="pl-4"><span className="text-emerald-400">practice</span>: <span className="text-blue-400">true</span>,</p>
              <p>{'}'});</p>
              <p className="mt-2 text-slate-600">{'// ✓ Career unlocked 🚀'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="border-y border-[#1e2d4a] bg-[#0e1525]/60">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-100">Explora por categoría</h2>
          <p className="mt-2 text-slate-500">Encuentra el área que te apasiona</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-5 text-center transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-600/5 hover:-translate-y-1"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-slate-400 group-hover:text-blue-400 transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-t border-[#1e2d4a]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-slate-100">¿Por qué EduTech Pro?</h2>
            <p className="mt-2 text-slate-500">Todo lo que necesitas para crecer profesionalmente</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group rounded-2xl border ${f.border} bg-gradient-to-br ${f.gradient} p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30`}
              >
                <div className={`mb-4 inline-flex rounded-xl p-2.5 ${f.iconBg}`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-slate-100">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted section ──────────────────────────────────────────────── */}
      <section className="border-t border-[#1e2d4a] bg-[#0e1525]/40">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-slate-600">Tecnologías que enseñamos</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {['React', 'Node.js', 'TypeScript', 'NestJS', 'Python', 'Docker', 'AWS', 'PostgreSQL'].map((tech) => (
              <span key={tech} className="rounded-full border border-[#1e2d4a] bg-[#0e1525] px-4 py-1.5 text-sm font-medium text-slate-400">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/15 via-[#0e1525] to-indigo-600/10 p-14 text-center">
          {/* Glow effects */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-600/10 px-4 py-1.5 text-sm text-blue-300">
              <Users className="h-3.5 w-3.5" />
              <span>Únete a la comunidad</span>
            </div>
            <h2 className="text-4xl font-black text-slate-100">
              Empieza a aprender{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                hoy mismo
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-slate-400 leading-relaxed">
              Únete a miles de estudiantes que ya están construyendo su futuro.
              Registro gratuito, sin tarjeta de crédito.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/registro">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 font-semibold px-8 shadow-lg shadow-blue-600/30">
                  Comenzar gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cursos">
                <Button size="lg" variant="outline" className="border-[#1e2d4a] text-slate-300 hover:border-blue-500/50 hover:text-blue-300">
                  Ver todos los cursos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1e2d4a] py-10">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600">
              <BookOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-100">EduTech <span className="text-blue-400">Pro</span></span>
          </div>
          <p className="text-sm text-slate-600">© 2026 EduTech Pro. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-sm text-slate-600">
            <Link href="/cursos" className="hover:text-slate-400 transition-colors">Cursos</Link>
            <Link href="/login" className="hover:text-slate-400 transition-colors">Iniciar sesión</Link>
            <Link href="/registro" className="hover:text-slate-400 transition-colors">Registro</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
