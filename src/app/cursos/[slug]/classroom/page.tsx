'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  ChevronDown,
  Play,
  Lock,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import {
  getCourse,
  getEnrollment,
  getProgress,
  completeLesson,
  getComments,
  postComment,
  formatDuration,
} from '@/lib/api/courses';
import { useAuthStore } from '@/lib/store/auth.store';
import { toast } from 'sonner';
import type { Course, Enrollment, Lesson, Section, Comment } from '@/lib/types';

export default function ClassroomPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const isApproved = enrollment?.status === 'APPROVED';

  useEffect(() => {
    async function load() {
      try {
        const c = await getCourse(slug);
        setCourse(c);

        // Open all sections by default in classroom
        setOpenSections(new Set(c.sections.map((s: Section) => s.id)));

        if (isAuthenticated) {
          try {
            const [enr, ids] = await Promise.all([getEnrollment(c.id), getProgress(c.id)]);
            setEnrollment(enr);
            setCompletedIds(ids);

            if (enr.status !== 'APPROVED') {
              router.push(`/cursos/${slug}`);
              return;
            }

            // Pick lesson from query param or first lesson
            const lessonId = searchParams.get('lesson');
            let target: Lesson | null = null;
            for (const section of c.sections) {
              for (const lesson of section.lessons) {
                if (lessonId ? lesson.id === lessonId : !target) {
                  target = lesson;
                }
              }
            }
            setActiveLesson(target);
          } catch {
            router.push(`/cursos/${slug}`);
            return;
          }
        } else {
          router.push('/login');
          return;
        }

        // Load comments (public)
        setLoadingComments(true);
        try {
          const cms = await getComments(c.id);
          setComments(cms);
        } catch {
          // ignore
        } finally {
          setLoadingComments(false);
        }
      } catch {
        router.push('/cursos');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, isAuthenticated]);

  const handleLessonClick = (lesson: Lesson) => {
    if (!isApproved && !lesson.isFree) return;
    setActiveLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.replace(`/cursos/${slug}/classroom?lesson=${lesson.id}`, { scroll: false });
  };

  const handleComplete = async () => {
    if (!activeLesson) return;
    try {
      const { progressPercentage } = await completeLesson(activeLesson.id);
      setCompletedIds((prev) => [...new Set([...prev, activeLesson.id])]);
      setEnrollment((prev) => (prev ? { ...prev, progressPercentage } : prev));
      toast.success('Clase completada');
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleNextLesson = () => {
    if (!course || !activeLesson) return;
    let found = false;
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (found) {
          handleLessonClick(lesson);
          return;
        }
        if (lesson.id === activeLesson.id) found = true;
      }
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !course) return;
    setSubmittingComment(true);
    try {
      const c = await postComment(course.id, commentText.trim());
      setComments((prev) => [c, ...prev]);
      setCommentText('');
    } catch (err: any) {
      toast.error(err?.message || 'Error al publicar comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080c14]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!course || !activeLesson) return null;

  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const progressPct = enrollment?.progressPercentage ?? 0;
  const isCompleted = completedIds.includes(activeLesson.id);

  return (
    <div className="flex min-h-screen flex-col bg-[#080c14] text-slate-100">
      <Navbar />

      {/* ── Top bar: progress + back ───────────────────────────── */}
      <div className="border-b border-[#1e2d4a] bg-[#0a1020] px-4 py-2">
        <div className="mx-auto flex max-w-screen-2xl items-center gap-4">
          <Link
            href={`/cursos/${slug}`}
            className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-200">{course.title}</p>
          </div>

          {isApproved && (
            <div className="flex shrink-0 items-center gap-2">
              <Progress value={progressPct} className="w-28" />
              <span className="text-xs font-semibold text-blue-400">{progressPct}%</span>
              <span className="text-xs text-slate-600">
                {completedIds.length}/{totalLessons}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main: video + sidebar ──────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Video */}
          <div className="bg-black">
            <div className="mx-auto w-full max-w-screen-xl">
              <div className="aspect-video">
                {activeLesson.youtubeVideoId ? (
                  <iframe
                    key={activeLesson.id}
                    src={`https://www.youtube.com/embed/${activeLesson.youtubeVideoId}?autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    No hay video disponible
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lesson meta + actions */}
          <div className="border-b border-[#1e2d4a] bg-[#0e1525] px-6 py-4">
            <div className="mx-auto max-w-screen-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-100">{activeLesson.title}</h1>
                  {activeLesson.description && (
                    <p className="mt-1 text-sm text-slate-400">{activeLesson.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isApproved && !isCompleted && (
                    <Button
                      size="sm"
                      onClick={handleComplete}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                    >
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                      Marcar completada
                    </Button>
                  )}
                  {isCompleted && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle className="h-4 w-4" /> Completada
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNextLesson}
                    className="border-[#1e2d4a] text-xs text-slate-400 hover:text-slate-200"
                  >
                    Siguiente →
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Comments section ───────────────────────────────── */}
          <div className="flex-1 px-6 py-8">
            <div className="mx-auto max-w-screen-xl">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-100">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                Comentarios
                {comments.length > 0 && (
                  <span className="text-sm font-normal text-slate-500">({comments.length})</span>
                )}
              </h2>

              {/* Post form — only approved students */}
              {isApproved && (
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-400">
                      {user?.firstName?.[0] ?? '?'}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Escribe un comentario sobre el curso..."
                        rows={3}
                        maxLength={1000}
                        className="w-full resize-none rounded-xl border border-[#1e2d4a] bg-[#0e1525] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">{commentText.length}/1000</span>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={submittingComment || !commentText.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-xs"
                        >
                          {submittingComment ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Publicar
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments list */}
              {loadingComments ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Cargando comentarios...</span>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-slate-600">
                  {isApproved
                    ? 'Sé el primero en dejar un comentario.'
                    : 'No hay comentarios aún.'}
                </p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#162038] text-sm font-bold text-slate-400">
                        {comment.user?.firstName?.[0] ?? '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-slate-300">
                            {comment.user?.firstName} {comment.user?.lastName}
                          </span>
                          <span className="text-xs text-slate-600">
                            {new Date(comment.createdAt).toLocaleDateString('es', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-400">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar: sections + lessons ───────────────────────── */}
        <aside
          ref={sidebarRef}
          className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-[#1e2d4a] bg-[#0a1020] lg:flex xl:w-96"
          style={{ height: 'calc(100vh - 112px)', position: 'sticky', top: '112px' }}
        >
          {/* Sidebar header */}
          <div className="border-b border-[#1e2d4a] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contenido del curso
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              {course.sections.length} secciones · {totalLessons} clases
            </p>
          </div>

          {/* Sections */}
          <div className="flex-1 overflow-y-auto">
            {course.sections.map((section, si) => {
              const isOpen = openSections.has(section.id);
              const completedInSection = section.lessons.filter((l) =>
                completedIds.includes(l.id),
              ).length;

              return (
                <div key={section.id} className="border-b border-[#1e2d4a]">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/15 border border-blue-500/20 text-[11px] font-bold text-blue-400">
                        {si + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {section.title}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {completedInSection}/{section.lessons.length} clases
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`ml-2 h-4 w-4 shrink-0 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="bg-[#080c14]">
                      {section.lessons.map((lesson) => {
                        const done = completedIds.includes(lesson.id);
                        const isActive = activeLesson?.id === lesson.id;
                        const canAccess = isApproved || lesson.isFree;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson)}
                            disabled={!canAccess}
                            className={`flex w-full items-center gap-2.5 border-b border-[#1e2d4a]/40 px-4 py-2.5 text-left transition-colors last:border-0
                              ${isActive ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : ''}
                              ${canAccess && !isActive ? 'hover:bg-white/[0.02] cursor-pointer' : ''}
                              ${!canAccess ? 'cursor-not-allowed opacity-40' : ''}
                            `}
                          >
                            <div className="shrink-0">
                              {done ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                              ) : canAccess ? (
                                <div className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${isActive ? 'border-blue-500 bg-blue-500/20' : 'border-[#2a3a5a]'}`}>
                                  <Play className={`h-2 w-2 translate-x-px ${isActive ? 'text-blue-400' : 'text-slate-600'}`} />
                                </div>
                              ) : (
                                <Lock className="h-3.5 w-3.5 text-slate-700" />
                              )}
                            </div>
                            <span
                              className={`flex-1 truncate text-xs leading-snug ${
                                isActive
                                  ? 'font-semibold text-blue-300'
                                  : done
                                  ? 'text-slate-600 line-through'
                                  : 'text-slate-400'
                              }`}
                            >
                              {lesson.title}
                            </span>
                            {lesson.durationSeconds && (
                              <span className="shrink-0 text-[10px] text-slate-700 tabular-nums">
                                {formatDuration(lesson.durationSeconds)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
