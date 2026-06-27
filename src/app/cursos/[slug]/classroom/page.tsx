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
  ThumbsUp,
  CornerDownRight,
  FileDown,
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

const AVATAR_COLORS = [
  'bg-stone-900', 'bg-violet-700', 'bg-emerald-700', 'bg-rose-700',
  'bg-amber-700', 'bg-cyan-700', 'bg-pink-700', 'bg-teal-700',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 2592000) return `hace ${Math.floor(diff / 86400)} días`;
  return `hace ${Math.floor(diff / 2592000)} meses`;
}

function CommentItem({
  comment,
  user,
  isApproved,
  replyingTo,
  replyText,
  submitting,
  onReplyOpen,
  onReplyClose,
  onReplyTextChange,
  onReplySubmit,
  isReply = false,
}: {
  comment: Comment;
  user: any;
  isApproved: boolean;
  replyingTo: string | null;
  replyText: string;
  submitting: boolean;
  onReplyOpen: (id: string) => void;
  onReplyClose: () => void;
  onReplyTextChange: (v: string) => void;
  onReplySubmit: (parentId: string) => void;
  isReply?: boolean;
}) {
  const firstName = comment.user?.firstName ?? '';
  const lastName = comment.user?.lastName ?? '';
  const initial = firstName?.[0]?.toUpperCase() ?? '?';
  const color = avatarColor(firstName || comment.userId);
  const isOpen = replyingTo === comment.id;

  return (
    <div className={`flex gap-4 ${isReply ? 'pl-14' : ''}`}>
      <div className={`relative flex shrink-0 items-center justify-center rounded-full font-bold text-white ${isReply ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'} ${color}`}>
        {initial}
        {!isReply && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`font-semibold text-stone-900 ${isReply ? 'text-xs' : 'text-sm'}`}>
            {firstName} {lastName}
          </span>
          <span className="rounded-full bg-stone-700/15 border border-stone-700/25 px-2 py-0.5 text-[10px] font-medium text-stone-600">
            Estudiante
          </span>
          <span className="text-xs text-stone-500">{timeAgo(comment.createdAt)}</span>
        </div>

        <p className={`leading-relaxed text-stone-700 ${isReply ? 'text-xs' : 'text-sm'}`}>
          {comment.content}
        </p>

        <div className="mt-2 flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors">
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          {isApproved && !isReply && (
            <button
              onClick={() => isOpen ? onReplyClose() : onReplyOpen(comment.id)}
              className="flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-600 transition-colors"
            >
              <CornerDownRight className="h-3 w-3" />
              {isOpen ? 'CANCELAR' : 'RESPONDER'}
            </button>
          )}
        </div>

        {/* Inline reply form */}
        {isOpen && (
          <div className="mt-3 flex gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(user?.firstName ?? 'U')}`}>
              {user?.firstName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <textarea
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                placeholder={`Responder a ${firstName}...`}
                rows={2}
                maxLength={1000}
                autoFocus
                className="w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-500 focus:border-stone-700/60 focus:outline-none focus:ring-1 focus:ring-stone-700/30 transition-colors"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={onReplyClose} className="border-border text-xs text-stone-600">
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={submitting || !replyText.trim()}
                  onClick={() => onReplySubmit(comment.id)}
                  className="bg-stone-900 hover:bg-stone-800 text-xs px-4"
                >
                  {submitting ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : null}
                  Responder
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 border-border pl-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                user={user}
                isApproved={isApproved}
                replyingTo={replyingTo}
                replyText={replyText}
                submitting={submitting}
                onReplyOpen={onReplyOpen}
                onReplyClose={onReplyClose}
                onReplyTextChange={onReplyTextChange}
                onReplySubmit={onReplySubmit}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClassroomPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const sidebarRef = useRef<HTMLDivElement>(null);

  const isInstructor = !!course && !!user && course.instructorId === user.id;
  const isApproved = enrollment?.status === 'APPROVED' || isInstructor;

  useEffect(() => {
    if (authLoading) return;

    async function load() {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const c = await getCourse(slug);
        setCourse(c);

        setOpenSections(new Set(c.sections.map((s: Section) => s.id)));

        const isOwner = !!user && c.instructorId === user.id;

        if (!isOwner) {
          try {
            const [enr, ids] = await Promise.all([getEnrollment(c.id), getProgress(c.id)]);
            setEnrollment(enr);
            setCompletedIds(ids);

            if (enr.status !== 'APPROVED') {
              router.push(`/cursos/${slug}`);
              return;
            }
          } catch {
            router.push(`/cursos/${slug}`);
            return;
          }
        }

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
  }, [slug, isAuthenticated, authLoading]);

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

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || !course) return;
    setSubmittingComment(true);
    try {
      const reply = await postComment(course.id, replyText.trim(), parentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), reply] }
            : c,
        ),
      );
      setReplyText('');
      setReplyingTo(null);
    } catch (err: any) {
      toast.error(err?.message || 'Error al responder');
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

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-stone-700" />
      </div>
    );
  }

  if (!course || !activeLesson) return null;

  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const progressPct = enrollment?.progressPercentage ?? 0;
  const isCompleted = completedIds.includes(activeLesson.id);

  return (
    <div className="flex min-h-screen flex-col bg-background text-stone-900">
      <Navbar />

      {/* ── Top bar: progress + back ───────────────────────────── */}
      <div className="border-b border-border bg-card px-4 py-2">
        <div className="mx-auto flex max-w-screen-2xl items-center gap-4">
          <Link
            href={`/cursos/${slug}`}
            className="flex shrink-0 items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-800">{course.title}</p>
          </div>

          {isApproved && (
            <div className="flex shrink-0 items-center gap-2">
              <Progress value={progressPct} className="w-28" />
              <span className="text-xs font-semibold text-stone-700">{progressPct}%</span>
              <span className="text-xs text-stone-400">
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
                  <div className="flex h-full items-center justify-center text-stone-500">
                    No hay video disponible
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lesson meta + actions */}
          <div className="border-b border-border bg-card px-6 py-4">
            <div className="mx-auto max-w-screen-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900">{activeLesson.title}</h1>
                  {activeLesson.description && (
                    <p className="mt-1 text-sm text-stone-600">{activeLesson.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isApproved && !isCompleted && (
                    <Button
                      size="sm"
                      onClick={handleComplete}
                      className="bg-emerald-700 hover:bg-emerald-800 text-xs"
                    >
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                      Marcar completada
                    </Button>
                  )}
                  {isCompleted && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-700">
                      <CheckCircle className="h-4 w-4" /> Completada
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNextLesson}
                    className="border-border text-xs text-stone-600 hover:text-stone-800"
                  >
                    Siguiente →
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Downloadable resources ─────────────────────────── */}
          {activeLesson.resources && activeLesson.resources.length > 0 && (
            <div className="border-b border-border bg-card px-6 py-4">
              <div className="mx-auto max-w-screen-xl">
                <h2 className="mb-3 text-sm font-semibold text-stone-700">Material descargable</h2>
                <div className="flex flex-wrap gap-2">
                  {activeLesson.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-stone-700 hover:border-stone-700/30 hover:bg-stone-900/5 transition-colors"
                    >
                      <FileDown className="h-4 w-4 shrink-0 text-stone-500" />
                      {r.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Comments section ───────────────────────────────── */}
          <div className="flex-1 px-6 py-8">
            <div className="mx-auto max-w-screen-xl">

              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
                  <MessageSquare className="h-5 w-5 text-stone-700" />
                  Comentarios
                  {comments.length > 0 && (
                    <span className="text-sm font-normal text-stone-600">({comments.length})</span>
                  )}
                </h2>
              </div>

              {/* Post form — only approved students */}
              {isApproved && (
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <div className="flex gap-4">
                    {/* Current user avatar */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColor(user?.firstName ?? 'U')}`}>
                      {user?.firstName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Escribe su comentario o pregunta..."
                        rows={3}
                        maxLength={1000}
                        className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-stone-800 placeholder:text-stone-500 focus:border-stone-700/60 focus:outline-none focus:ring-1 focus:ring-stone-700/30 transition-colors"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400">{commentText.length}/1000</span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setCommentText('')}
                            className="border-border text-xs text-stone-600 hover:text-stone-800"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={submittingComment || !commentText.trim()}
                            className="bg-stone-900 hover:bg-stone-800 text-xs px-5"
                          >
                            {submittingComment ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            Enviar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Divider */}
              {comments.length > 0 && <div className="mb-6 border-t border-border" />}

              {/* Comments list */}
              {loadingComments ? (
                <div className="flex items-center gap-2 text-stone-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Cargando comentarios...</span>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-stone-500">
                  {isApproved ? 'Sé el primero en comentar.' : 'No hay comentarios aún.'}
                </p>
              ) : (
                <div className="space-y-7">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      user={user}
                      isApproved={isApproved}
                      replyingTo={replyingTo}
                      replyText={replyText}
                      submitting={submittingComment}
                      onReplyOpen={(id) => { setReplyingTo(id); setReplyText(''); }}
                      onReplyClose={() => setReplyingTo(null)}
                      onReplyTextChange={setReplyText}
                      onReplySubmit={handleSubmitReply}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar: sections + lessons ───────────────────────── */}
        <aside
          ref={sidebarRef}
          className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-border bg-card lg:flex xl:w-96"
        >
          {/* Sidebar header */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Contenido del curso
            </p>
            <p className="mt-0.5 text-xs text-stone-400">
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
                <div key={section.id} className="border-b border-border">
                  {/* Section header — distinct bg so it stands out from lesson rows */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center justify-between bg-secondary px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-700/25 border border-stone-700/40 text-[11px] font-bold text-stone-600">
                        {si + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {section.title}
                        </p>
                        <p className="text-[11px] text-stone-600">
                          {completedInSection}/{section.lessons.length} clases
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`ml-2 h-4 w-4 shrink-0 text-stone-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="bg-background">
                      {section.lessons.map((lesson) => {
                        const done = completedIds.includes(lesson.id);
                        const isActive = activeLesson?.id === lesson.id;
                        const canAccess = isApproved || lesson.isFree;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson)}
                            disabled={!canAccess}
                            className={`flex w-full items-center gap-2.5 border-b border-border px-4 py-3 text-left transition-colors last:border-0
                              ${isActive ? 'bg-stone-900/20 border-l-2 border-l-stone-700' : ''}
                              ${canAccess && !isActive ? 'hover:bg-card cursor-pointer' : ''}
                              ${!canAccess ? 'cursor-not-allowed opacity-40' : ''}
                            `}
                          >
                            <div className="shrink-0">
                              {done ? (
                                <CheckCircle className="h-4 w-4 text-emerald-700" />
                              ) : canAccess ? (
                                <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${isActive ? 'border-stone-700 bg-stone-700/30' : 'border-stone-500 bg-stone-700/20'}`}>
                                  <Play className={`h-2 w-2 translate-x-px ${isActive ? 'text-stone-600' : 'text-stone-700'}`} />
                                </div>
                              ) : (
                                <Lock className="h-4 w-4 text-stone-500" />
                              )}
                            </div>
                            <span
                              className={`flex-1 truncate text-xs leading-snug ${
                                isActive
                                  ? 'font-semibold text-stone-900'
                                  : done
                                  ? 'text-stone-500 line-through'
                                  : 'text-stone-700'
                              }`}
                            >
                              {lesson.title}
                            </span>
                            {lesson.durationSeconds && (
                              <span className="shrink-0 text-[10px] text-stone-500 tabular-nums">
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
