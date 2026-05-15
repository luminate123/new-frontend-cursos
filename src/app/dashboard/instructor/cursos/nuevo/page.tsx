'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus, X, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { createCourse, LEVEL_LABELS, CATEGORY_LABELS } from '@/lib/api/courses';
import { toast } from 'sonner';

// ─── Reusable: Tag / list input ───────────────────────────────────────────────

function StringListInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setDraft('');
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-400">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-[#1e2d4a] bg-[#162038] px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-colors"
        />
        <Button type="button" size="sm" onClick={add} variant="outline" className="border-[#1e2d4a] text-slate-400">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span key={i} className="flex items-center gap-1 rounded-full bg-[#162038] border border-[#1e2d4a] px-2.5 py-0.5 text-xs text-slate-300">
              {v}
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}>
                <X className="h-3 w-3 text-slate-500 hover:text-red-400" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-[#1e2d4a] bg-[#162038] px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-colors';
const selectCls = inputCls + ' cursor-pointer';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NuevoCursoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    level: 'BEGINNER',
    category: 'PROGRAMMING',
    language: 'Español',
    price: '0',
    thumbnail: '',
    promoVideoUrl: '',
  });
  const [requirements, setRequirements] = useState<string[]>([]);
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title.length < 5) { toast.error('Título mínimo 5 caracteres'); return; }
    if (form.description.length < 20) { toast.error('Descripción mínimo 20 caracteres'); return; }

    setSaving(true);
    try {
      const course = await createCourse({
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        thumbnail: form.thumbnail || undefined,
        promoVideoUrl: form.promoVideoUrl || undefined,
        level: form.level,
        category: form.category,
        language: form.language,
        price: parseFloat(form.price) || 0,
        requirements,
        whatYouLearn,
        tags,
      });
      toast.success('Curso creado. Ahora agrega el contenido.');
      router.push(`/dashboard/instructor/cursos/${course.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Error al crear curso');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-300">Nuevo curso</span>
        </div>

        <h1 className="mb-1 text-2xl font-black">Crear nuevo curso</h1>
        <p className="mb-8 text-sm text-slate-500">Completa la información básica. Luego agregas secciones y clases.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-6 space-y-5">
            <h2 className="font-semibold text-slate-200">Información básica</h2>

            <Field label="Título del curso" required>
              <input value={form.title} onChange={set('title')} placeholder="Ej: Introducción a React con TypeScript" className={inputCls} />
              <p className="mt-1 text-[11px] text-slate-600">{form.title.length}/5+ caracteres requeridos</p>
            </Field>

            <Field label="Descripción corta">
              <input value={form.shortDescription} onChange={set('shortDescription')} placeholder="Una línea que resume el curso (se ve en la tarjeta)" className={inputCls} />
            </Field>

            <Field label="Descripción completa" required>
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={5}
                placeholder="Describe qué aprenderán los estudiantes, el enfoque del curso, etc."
                className={inputCls + ' resize-none'}
              />
              <p className="mt-1 text-[11px] text-slate-600">{form.description.length}/20+ caracteres requeridos</p>
            </Field>
          </div>

          {/* Classification */}
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-6 space-y-5">
            <h2 className="font-semibold text-slate-200">Clasificación</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nivel">
                <select value={form.level} onChange={set('level')} className={selectCls}>
                  {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>

              <Field label="Categoría">
                <select value={form.category} onChange={set('category')} className={selectCls}>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>

              <Field label="Idioma">
                <input value={form.language} onChange={set('language')} placeholder="Español" className={inputCls} />
              </Field>

              <Field label="Precio (USD)">
                <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0" className={inputCls} />
                <p className="mt-1 text-[11px] text-slate-600">0 = gratis</p>
              </Field>
            </div>
          </div>

          {/* Media */}
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-6 space-y-5">
            <h2 className="font-semibold text-slate-200">Multimedia (opcional)</h2>

            <Field label="URL de portada (imagen)">
              <input value={form.thumbnail} onChange={set('thumbnail')} placeholder="https://..." className={inputCls} />
            </Field>

            <Field label="Video promocional (YouTube URL)">
              <input value={form.promoVideoUrl} onChange={set('promoVideoUrl')} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
            </Field>
          </div>

          {/* Content lists */}
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-6 space-y-5">
            <h2 className="font-semibold text-slate-200">Contenido del curso</h2>

            <StringListInput
              label="Qué aprenderán los estudiantes"
              values={whatYouLearn}
              onChange={setWhatYouLearn}
              placeholder="Ej: Crear componentes reutilizables con React"
            />

            <StringListInput
              label="Requisitos previos"
              values={requirements}
              onChange={setRequirements}
              placeholder="Ej: Conocimiento básico de JavaScript"
            />

            <StringListInput
              label="Tags"
              values={tags}
              onChange={setTags}
              placeholder="Ej: react, typescript, frontend"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="border-[#1e2d4a] text-slate-400 hover:text-slate-200">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 font-semibold min-w-36 shadow-lg shadow-blue-600/20">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {saving ? 'Creando...' : 'Crear curso →'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
