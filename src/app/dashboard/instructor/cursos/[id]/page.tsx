'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight, Eye, Globe, Loader2, Plus, Save, Trash2, X,
  ChevronDown, ChevronUp, GripVertical, BookOpen, Play, Lock, Pencil, Check,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import {
  getCourse, updateCourse, publishCourse,
  createSection, updateSection, deleteSection,
  createLesson, updateLesson, deleteLesson,
  LEVEL_LABELS, CATEGORY_LABELS,
  type CreateLessonData,
} from '@/lib/api/courses';
import { toast } from 'sonner';
import type { Course, Section, Lesson } from '@/lib/types';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-lg border border-[#1e2d4a] bg-[#162038] px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-colors';
const selectCls = inputCls + ' cursor-pointer';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Lesson form ────────────────────────────────────────────────────────────────

function LessonForm({
  sectionId,
  lesson,
  onSave,
  onCancel,
}: {
  sectionId: string;
  lesson?: Lesson;
  onSave: (l: Lesson) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateLessonData>({
    title: lesson?.title ?? '',
    description: lesson?.description ?? '',
    youtubeUrl: lesson?.youtubeUrl ?? '',
    durationSeconds: lesson?.durationSeconds ?? undefined,
    isFree: lesson?.isFree ?? false,
    notes: lesson?.notes ?? '',
  });

  const set = (k: keyof CreateLessonData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Título requerido'); return; }
    if (!form.youtubeUrl.trim()) { toast.error('URL de YouTube requerida'); return; }
    if (!/(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(form.youtubeUrl)) {
      toast.error('URL de YouTube inválida');
      return;
    }
    setSaving(true);
    try {
      let saved: Lesson;
      if (lesson) {
        saved = await updateLesson(sectionId, lesson.id, form);
      } else {
        saved = await createLesson(sectionId, form);
      }
      onSave(saved);
      toast.success(lesson ? 'Clase actualizada' : 'Clase agregada');
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#1e2d4a] bg-[#0e1525] p-4 space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {lesson ? 'Editar clase' : 'Nueva clase'}
      </p>

      <Field label="Título" required>
        <input value={form.title} onChange={set('title')} placeholder="Ej: Variables y tipos de datos" className={inputCls} />
      </Field>

      <Field label="URL de YouTube" required>
        <input value={form.youtubeUrl} onChange={set('youtubeUrl')} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Descripción (opcional)">
          <input value={form.description ?? ''} onChange={set('description')} placeholder="Breve descripción..." className={inputCls} />
        </Field>

        <Field label="Duración (segundos)">
          <input
            type="number"
            min="1"
            value={form.durationSeconds ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, durationSeconds: parseInt(e.target.value) || undefined }))}
            placeholder="600"
            className={inputCls}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isFree}
          onChange={(e) => setForm((p) => ({ ...p, isFree: e.target.checked }))}
          className="h-4 w-4 rounded border-slate-600 accent-blue-500"
        />
        <span className="text-sm text-slate-400">Clase gratuita (previa del curso)</span>
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <Button size="sm" variant="outline" className="border-[#1e2d4a] text-slate-400 text-xs" onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs shadow-sm shadow-blue-600/20" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
          {lesson ? 'Guardar cambios' : 'Agregar clase'}
        </Button>
      </div>
    </div>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────

function SectionBlock({
  section,
  courseId,
  onUpdate,
  onDelete,
}: {
  section: Section & { lessons: Lesson[] };
  courseId: string;
  onUpdate: (s: Section & { lessons: Lesson[] }) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [deletingSection, setDeletingSection] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<string | null>(null);

  const saveTitle = async () => {
    if (!titleDraft.trim() || titleDraft === section.title) { setEditingTitle(false); return; }
    try {
      const updated = await updateSection(courseId, section.id, { title: titleDraft });
      onUpdate({ ...section, ...updated });
      setEditingTitle(false);
      toast.success('Sección actualizada');
    } catch {
      toast.error('Error al actualizar sección');
    }
  };

  const handleDeleteSection = async () => {
    if (!confirm(`¿Eliminar sección "${section.title}" y todas sus clases?`)) return;
    setDeletingSection(true);
    try {
      await deleteSection(courseId, section.id);
      onDelete(section.id);
      toast.success('Sección eliminada');
    } catch (err: any) {
      toast.error(err?.message || 'Error');
      setDeletingSection(false);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm(`¿Eliminar clase "${lesson.title}"?`)) return;
    setDeletingLesson(lesson.id);
    try {
      await deleteLesson(section.id, lesson.id);
      onUpdate({ ...section, lessons: section.lessons.filter((l) => l.id !== lesson.id) });
      toast.success('Clase eliminada');
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    } finally {
      setDeletingLesson(null);
    }
  };

  const handleLessonSaved = (saved: Lesson) => {
    const exists = section.lessons.find((l) => l.id === saved.id);
    onUpdate({
      ...section,
      lessons: exists
        ? section.lessons.map((l) => (l.id === saved.id ? saved : l))
        : [...section.lessons, saved],
    });
    setAddingLesson(false);
    setEditingLesson(null);
  };

  return (
    <div className="rounded-xl border border-[#1e2d4a] bg-[#0e1525] overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d4a]">
        <GripVertical className="h-4 w-4 text-slate-600 shrink-0" />

        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
            className="flex-1 rounded border border-blue-500/60 bg-[#162038] px-2 py-0.5 text-sm text-slate-100 focus:outline-none"
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-slate-200">{section.title}</span>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] text-slate-600 mr-1">{section.lessons.length} clase{section.lessons.length !== 1 ? 's' : ''}</span>

          {editingTitle ? (
            <>
              <button onClick={saveTitle} className="rounded p-1 text-emerald-400 hover:bg-[#162038]">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setEditingTitle(false)} className="rounded p-1 text-slate-500 hover:bg-[#162038]">
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button onClick={() => setEditingTitle(true)} className="rounded p-1 text-slate-500 hover:bg-[#162038] hover:text-slate-300">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={handleDeleteSection}
            disabled={deletingSection}
            className="rounded p-1 text-slate-600 hover:bg-[#162038] hover:text-red-400"
          >
            {deletingSection ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>

          <button onClick={() => setOpen((v) => !v)} className="rounded p-1 text-slate-500 hover:bg-[#162038]">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Lessons */}
      {open && (
        <div className="p-3 space-y-2">
          {section.lessons.length === 0 && !addingLesson && (
            <p className="py-4 text-center text-xs text-slate-600">Sin clases aún — agrega la primera</p>
          )}

          {section.lessons.map((lesson, idx) => (
            <div key={lesson.id}>
              {editingLesson === lesson.id ? (
                <LessonForm
                  sectionId={section.id}
                  lesson={lesson}
                  onSave={handleLessonSaved}
                  onCancel={() => setEditingLesson(null)}
                />
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-[#1e2d4a] bg-[#162038]/40 px-3 py-2 group hover:border-blue-500/30 hover:bg-blue-600/5 transition-colors">
                  <span className="text-[11px] text-slate-600 w-5 shrink-0 text-right">{idx + 1}</span>
                  {lesson.isFree ? (
                    <Play className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                  )}
                  <span className="flex-1 text-sm text-slate-300 truncate">{lesson.title}</span>
                  {lesson.durationSeconds && (
                    <span className="text-[11px] text-slate-600 shrink-0">
                      {Math.floor(lesson.durationSeconds / 60)}m
                    </span>
                  )}
                  {lesson.isFree && (
                    <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">
                      Gratis
                    </span>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => setEditingLesson(lesson.id)}
                      className="rounded p-1 text-slate-500 hover:text-blue-400"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson)}
                      disabled={deletingLesson === lesson.id}
                      className="rounded p-1 text-slate-500 hover:text-red-400"
                    >
                      {deletingLesson === lesson.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add lesson form */}
          {addingLesson ? (
            <LessonForm
              sectionId={section.id}
              onSave={handleLessonSaved}
              onCancel={() => setAddingLesson(false)}
            />
          ) : (
            <button
              onClick={() => setAddingLesson(true)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-[#1e2d4a] px-3 py-2 text-xs text-slate-500 hover:border-blue-500/40 hover:text-blue-400 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar clase
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Course info tab ──────────────────────────────────────────────────────────

function StringListInput({ label, values, onChange, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    onChange([...values, t]);
    setDraft('');
  };
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <div className="flex gap-2 mb-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} className={inputCls} />
        <Button type="button" size="sm" onClick={add} variant="outline" className="border-[#1e2d4a] text-slate-400 shrink-0"><Plus className="h-4 w-4" /></Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span key={i} className="flex items-center gap-1 rounded-full bg-[#162038] border border-[#1e2d4a] px-2.5 py-0.5 text-xs text-slate-300">
              {v}
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}><X className="h-3 w-3 text-slate-500 hover:text-red-400" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'info' | 'content';

export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<(Section & { lessons: Lesson[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('content');

  const [info, setInfo] = useState({
    title: '', shortDescription: '', description: '',
    level: 'BEGINNER', category: 'PROGRAMMING',
    language: 'Español', price: '0',
    thumbnail: '', promoVideoUrl: '',
  });
  const [requirements, setRequirements] = useState<string[]>([]);
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [savingInfo, setSavingInfo] = useState(false);

  const [addingSectionTitle, setAddingSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(false);

  const load = useCallback(async () => {
    try {
      const c = await getCourse(id);
      setCourse(c);
      setInfo({
        title: c.title,
        shortDescription: c.shortDescription ?? '',
        description: c.description,
        level: c.level,
        category: c.category,
        language: c.language ?? 'Español',
        price: String(c.price ?? 0),
        thumbnail: c.thumbnail ?? '',
        promoVideoUrl: c.promoVideoUrl ?? '',
      });
      setRequirements(c.requirements ?? []);
      setWhatYouLearn(c.whatYouLearn ?? []);
      setTags(c.tags ?? []);
      setSections((c.sections ?? []).map((s) => ({ ...s, lessons: (s as any).lessons ?? [] })));
    } catch {
      toast.error('No se pudo cargar el curso');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const setInfoField = (k: keyof typeof info) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setInfo((p) => ({ ...p, [k]: e.target.value }));

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (info.title.length < 5) { toast.error('Título mínimo 5 caracteres'); return; }
    if (info.description.length < 20) { toast.error('Descripción mínimo 20 caracteres'); return; }
    setSavingInfo(true);
    try {
      const updated = await updateCourse(id, {
        title: info.title,
        description: info.description,
        shortDescription: info.shortDescription || undefined,
        thumbnail: info.thumbnail || undefined,
        promoVideoUrl: info.promoVideoUrl || undefined,
        level: info.level,
        category: info.category,
        language: info.language,
        price: parseFloat(info.price) || 0,
        requirements,
        whatYouLearn,
        tags,
      });
      setCourse(updated);
      toast.success('Información actualizada');
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleAddSection = async () => {
    if (!addingSectionTitle.trim()) { toast.error('Nombre de sección requerido'); return; }
    setSavingSection(true);
    try {
      const s = await createSection(id, { title: addingSectionTitle.trim(), order: sections.length });
      setSections((prev) => [...prev, { ...s, lessons: [] }]);
      setAddingSectionTitle('');
      setAddingSection(false);
      toast.success('Sección agregada');
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    } finally {
      setSavingSection(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!course) return;
    setTogglingPublish(true);
    try {
      const updated = await publishCourse(id);
      setCourse(updated);
      toast.success(updated.isPublished ? 'Curso publicado' : 'Curso despublicado');
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    } finally {
      setTogglingPublish(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080c14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-48 text-slate-300">{course.title}</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black">{course.title}</h1>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                course.isPublished
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-[#1e2d4a] bg-[#162038] text-slate-500'
              }`}>
                {course.isPublished ? 'Publicado' : 'Borrador'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {sections.length} secciones · {totalLessons} clases
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/cursos/${course.slug}`} target="_blank">
              <Button size="sm" variant="outline" className="border-[#1e2d4a] text-slate-400 hover:text-slate-200 text-xs gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Preview
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleTogglePublish}
              disabled={togglingPublish}
              className={course.isPublished
                ? 'border border-[#1e2d4a] bg-transparent hover:bg-[#162038] text-slate-400 text-xs'
                : 'bg-emerald-600 hover:bg-emerald-700 text-xs'}
            >
              {togglingPublish ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Globe className="mr-1.5 h-3.5 w-3.5" />}
              {course.isPublished ? 'Despublicar' : 'Publicar'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-[#1e2d4a]">
          {([['content', 'Contenido', BookOpen], ['info', 'Información', Pencil]] as const).map(([t, label, Icon]) => (
            <button
              key={t}
              onClick={() => setTab(t as Tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Content tab ────────────────────────────────────────────── */}
        {tab === 'content' && (
          <div className="space-y-4">
            {sections.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#1e2d4a] p-12 text-center">
                <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-700" />
                <p className="text-sm text-slate-500">Sin secciones aún</p>
                <p className="mt-1 text-xs text-slate-600">Agrega una sección para empezar a organizar las clases</p>
              </div>
            )}

            {sections.map((section) => (
              <SectionBlock
                key={section.id}
                section={section}
                courseId={id}
                onUpdate={(updated) =>
                  setSections((prev) => prev.map((s) => s.id === updated.id ? updated : s))
                }
                onDelete={(sid) =>
                  setSections((prev) => prev.filter((s) => s.id !== sid))
                }
              />
            ))}

            {/* Add section */}
            {addingSection ? (
              <div className="rounded-xl border border-[#1e2d4a] bg-[#0e1525] p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nueva sección</p>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={addingSectionTitle}
                    onChange={(e) => setAddingSectionTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                    placeholder="Ej: Módulo 1 - Fundamentos"
                    className={inputCls}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" className="border-[#1e2d4a] text-slate-400 text-xs" onClick={() => { setAddingSection(false); setAddingSectionTitle(''); }}>
                    Cancelar
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs shadow-sm shadow-blue-600/20" onClick={handleAddSection} disabled={savingSection}>
                    {savingSection ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                    Agregar sección
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingSection(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#1e2d4a] py-4 text-sm text-slate-500 hover:border-blue-500/40 hover:text-blue-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar sección
              </button>
            )}
          </div>
        )}

        {/* ── Info tab ───────────────────────────────────────────────── */}
        {tab === 'info' && (
          <form onSubmit={handleSaveInfo} className="space-y-5">
            <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Información básica</h3>

              <Field label="Título" required>
                <input value={info.title} onChange={setInfoField('title')} className={inputCls} />
              </Field>

              <Field label="Descripción corta">
                <input value={info.shortDescription} onChange={setInfoField('shortDescription')} placeholder="Una línea resumen..." className={inputCls} />
              </Field>

              <Field label="Descripción completa" required>
                <textarea value={info.description} onChange={setInfoField('description')} rows={5} className={inputCls + ' resize-none'} />
              </Field>
            </div>

            <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Clasificación</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nivel">
                  <select value={info.level} onChange={setInfoField('level')} className={selectCls}>
                    {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Categoría">
                  <select value={info.category} onChange={setInfoField('category')} className={selectCls}>
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Idioma">
                  <input value={info.language} onChange={setInfoField('language')} className={inputCls} />
                </Field>
                <Field label="Precio (USD)">
                  <input type="number" min="0" step="0.01" value={info.price} onChange={setInfoField('price')} className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Multimedia</h3>
              <Field label="URL portada">
                <input value={info.thumbnail} onChange={setInfoField('thumbnail')} placeholder="https://..." className={inputCls} />
              </Field>
              <Field label="Video promocional (YouTube)">
                <input value={info.promoVideoUrl} onChange={setInfoField('promoVideoUrl')} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
              </Field>
            </div>

            <div className="rounded-2xl border border-[#1e2d4a] bg-[#0e1525] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Contenido del curso</h3>
              <StringListInput label="Qué aprenderán" values={whatYouLearn} onChange={setWhatYouLearn} placeholder="Ej: Crear APIs REST con NestJS" />
              <StringListInput label="Requisitos" values={requirements} onChange={setRequirements} placeholder="Ej: JavaScript básico" />
              <StringListInput label="Tags" values={tags} onChange={setTags} placeholder="Ej: react, frontend" />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingInfo} className="bg-blue-600 hover:bg-blue-700 font-semibold min-w-36 shadow-lg shadow-blue-600/20">
                {savingInfo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {savingInfo ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
