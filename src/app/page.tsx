import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Compass,
  GraduationCap,
  Layers,
  Lightbulb,
  RefreshCw,
  ScaleIcon,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { HomeRedirect } from '@/components/auth/HomeRedirect';

// Líneas educativas del plan estratégico (KORE AI y KORE Professional).
// KORE Consulting no aparece: esta plataforma es la academia.
const LINES = [
  {
    name: 'KORE AI',
    tagline: 'Inteligencia Artificial aplicada',
    description:
      'Programas de IA generativa, prompt engineering, análisis de datos, automatización y agentes, con uso ético y responsable.',
    href: '/cursos?line=KORE_AI',
    icon: BrainCircuit,
    accent: 'text-ai-700',
    ring: 'border-ai-500/25 bg-ai-50',
  },
  {
    name: 'KORE Professional',
    tagline: 'Especialización por profesión',
    description:
      'Programas de especialización para ingeniería, administración, derecho, salud, RRHH, finanzas y otras disciplinas, con la IA como componente transversal.',
    href: '/cursos?line=KORE_PROFESSIONAL',
    icon: GraduationCap,
    accent: 'text-brand-700',
    ring: 'border-brand-500/25 bg-brand-50',
  },
];

// Arquitectura académica: 4 niveles, no una lista plana de cursos.
const LEVELS = [
  { n: '01', name: 'Essentials', description: 'Cursos cortos de entrada', href: '/cursos?level=ESSENTIALS' },
  { n: '02', name: 'Professional', description: 'Programas de especialización', href: '/cursos?level=PROFESSIONAL' },
  { n: '03', name: 'Advanced', description: 'Programas avanzados', href: '/cursos?level=ADVANCED' },
  { n: '04', name: 'Executive', description: 'Gerentes, directivos y líderes', href: '/cursos?level=EXECUTIVE' },
];

// Modelo de formación KORE.
const MODEL = [
  {
    tag: 'KORE LEARN',
    title: 'Comprender',
    description: 'El marco conceptual y los límites de lo que vas a usar.',
    icon: Compass,
  },
  {
    tag: 'KORE APPLY',
    title: 'Aplicar',
    description: 'El conocimiento puesto a trabajar en situaciones profesionales reales.',
    icon: Target,
  },
  {
    tag: 'KORE CREATE',
    title: 'Crear',
    description: 'Un proyecto propio: la evidencia de la competencia desarrollada.',
    icon: Lightbulb,
  },
];

// Diferenciales del plan estratégico (sección 11).
const DIFFERENTIALS = [
  {
    icon: Target,
    title: 'Formación aplicada',
    description: 'Cada programa termina en un entregable, no en un examen de teoría.',
  },
  {
    icon: Layers,
    title: 'IA transversal',
    description: 'La IA se aplica a tu profesión, no se estudia como una carrera aparte.',
  },
  {
    icon: BadgeCheck,
    title: 'Certificado verificable',
    description: 'Código único y verificación pública en línea de cada certificado emitido.',
  },
  {
    icon: RefreshCw,
    title: 'Actualización permanente',
    description: 'Los programas se revisan conforme evolucionan las tecnologías.',
  },
  {
    icon: ScaleIcon,
    title: 'Formación ética',
    description: 'Uso responsable, seguro y centrado en las personas.',
  },
  {
    icon: GraduationCap,
    title: 'Especialización real',
    description: 'Programas de 40 a 120 horas académicas, no solo cursos introductorios.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HomeRedirect />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-card">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-navy/5 blur-3xl" />
          <div className="absolute top-24 right-1/4 h-[360px] w-[360px] rounded-full bg-brand-200/25 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:py-28">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Consultoría · Asesoría · Educación Profesional
          </div>

          <div className="mb-9 flex justify-center">
            <Image
              src="/logo.svg"
              alt="KORE Group"
              width={320}
              height={100}
              className="h-16 w-auto sm:h-20"
              priority
            />
          </div>

          <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">
            Transformamos conocimiento
            <br />
            en{' '}
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              capacidades
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Programas de especialización y formación en inteligencia artificial aplicada
            para profesionales que necesitan resolver problemas reales en su campo.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/cursos">
              <Button size="lg" className="bg-brand px-8 font-semibold text-white shadow-lg shadow-brand/25 hover:bg-brand-600">
                Ver programas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/registro">
              <Button
                size="lg"
                variant="outline"
                className="border-navy/25 text-navy hover:border-navy/50 hover:bg-navy/5"
              >
                Crear cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Líneas educativas ────────────────────────────────────────────── */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Dos líneas de formación</h2>
            <p className="mt-2 text-muted-foreground">
              La inteligencia artificial atraviesa ambas; ninguna se agota en ella.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {LINES.map((line) => (
              <Link
                key={line.name}
                href={line.href}
                className="group rounded-2xl border border-border bg-card p-7 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className={`mb-5 inline-flex rounded-xl border p-2.5 ${line.ring}`}>
                  <line.icon className={`h-5 w-5 ${line.accent}`} />
                </div>
                <h3 className="text-xl font-bold">{line.name}</h3>
                <p className={`mt-1 text-sm font-medium ${line.accent}`}>{line.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{line.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                  Ver programas
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Arquitectura académica ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Cuatro niveles de progresión</h2>
          <p className="mt-2 text-muted-foreground">
            Desde un curso corto hasta un programa para dirección.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((level) => (
            <Link
              key={level.name}
              href={level.href}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-navy/25 hover:shadow-card"
            >
              <span className="font-mono text-xs font-semibold text-brand-600">{level.n}</span>
              <h3 className="mt-2 text-lg font-bold">{level.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{level.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Modelo de formación ──────────────────────────────────────────── */}
      <section className="border-y border-border bg-navy">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Modelo de formación KORE
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Comprender <span className="text-white/30">→</span> Aplicar{' '}
              <span className="text-white/30">→</span> Crear
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {MODEL.map((step, i) => (
              <div
                key={step.tag}
                className="relative rounded-2xl border border-white/12 bg-white/5 p-7"
              >
                <div className="mb-5 inline-flex rounded-xl bg-brand/15 p-2.5">
                  <step.icon className="h-5 w-5 text-brand-400" />
                </div>
                <p className="font-mono text-xs font-semibold tracking-wide text-brand-400">
                  {step.tag}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
                <span className="absolute right-6 top-6 font-mono text-4xl font-black text-white/8">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diferenciales ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Qué hace distinto un programa KORE</h2>
          <p className="mt-2 text-muted-foreground">
            No es un catálogo de cursos: es una ruta de desarrollo profesional.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIALS.map((d) => (
            <div key={d.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 inline-flex rounded-xl bg-muted p-2.5">
                <d.icon className="h-5 w-5 text-navy" />
              </div>
              <h3 className="font-semibold">{d.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Verificación de certificados ─────────────────────────────────── */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-xl font-bold">¿Recibiste un certificado KORE?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada certificado lleva un código único verificable en línea.
            </p>
          </div>
          <Link href="/verificar">
            <Button variant="outline" className="border-navy/25 text-navy hover:bg-navy/5">
              <BadgeCheck className="mr-2 h-4 w-4" />
              Verificar certificado
            </Button>
          </Link>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-navy/12 bg-gradient-to-br from-navy/6 via-card to-brand-50 p-12 text-center sm:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-200/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-black sm:text-4xl">
              Da el siguiente paso en tu{' '}
              <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                especialización
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg leading-relaxed text-muted-foreground">
              Revisa el catálogo, elige tu nivel y solicita tu inscripción.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/cursos">
                <Button size="lg" className="bg-brand px-8 font-semibold text-white hover:bg-brand-600">
                  Ver catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-navy">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-bold text-white">KORE Group</p>
              <p className="mt-0.5 text-xs text-white/50">
                Transformamos conocimiento en capacidades.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/60">
              <Link href="/cursos" className="hover:text-white">Programas</Link>
              <Link href="/verificar" className="hover:text-white">Verificar certificado</Link>
              <Link href="/login" className="hover:text-white">Iniciar sesión</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
