'use client';

import { useState } from 'react';
import { ChevronDown, Play, Lock, CheckCircle } from 'lucide-react';
import type { Section, Lesson, LearningPhase } from '@/lib/types';
import { formatDuration, PHASE_LABELS, PHASE_SUBTITLES } from '@/lib/api/courses';

interface CourseRoadmapProps {
  sections: Section[];
  completedLessonIds?: string[];
  isEnrolled?: boolean;
  onLessonClick?: (lesson: Lesson) => void;
}

/**
 * Agrupa las secciones consecutivas que comparten fase del modelo KORE
 * (COMPRENDER → APLICAR → CREAR). Un curso Essentials sin fases declaradas
 * cae en un único grupo sin cabecera, igual que antes.
 */
function groupByPhase(sections: Section[]) {
  const groups: { phase: LearningPhase | null; sections: Section[] }[] = [];
  for (const section of sections) {
    const last = groups[groups.length - 1];
    if (last && last.phase === section.phase) last.sections.push(section);
    else groups.push({ phase: section.phase, sections: [section] });
  }
  return groups;
}

export function CourseRoadmap({
  sections,
  completedLessonIds = [],
  isEnrolled = false,
  onLessonClick,
}: CourseRoadmapProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.length > 0 ? [sections[0].id] : []),
  );

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const groups = groupByPhase(sections);
  let sectionNumber = 0;

  return (
    <div className="space-y-5">
      {groups.map((group, gi) => (
        <div key={group.phase ?? `g${gi}`} className="space-y-2">
          {group.phase && (
            <div className="flex items-baseline gap-2 px-1">
              <span className="font-mono text-xs font-semibold tracking-wide text-brand-600">
                {PHASE_LABELS[group.phase]}
              </span>
              <span className="text-xs text-muted-foreground">
                {PHASE_SUBTITLES[group.phase]}
              </span>
            </div>
          )}

          {group.sections.map((section) => {
            const isOpen = openSections.has(section.id);
            const completedInSection =
              section.lessons?.filter((l) => completedLessonIds.includes(l.id)).length ?? 0;
            sectionNumber += 1;

            return (
              <div key={section.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <button
                  onClick={() => toggle(section.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold text-muted-foreground">
                      {sectionNumber}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{section.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {completedInSection}/{section.totalLessons} clases
                        {section.totalDurationSeconds > 0 && (
                          <> · {formatDuration(section.totalDurationSeconds)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && section.lessons && section.lessons.length > 0 && (
                  <div className="border-t border-border">
                    {section.lessons.map((lesson) => {
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      const canAccess = isEnrolled || lesson.isFree;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => canAccess && onLessonClick?.(lesson)}
                          disabled={!canAccess}
                          className={`flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 ${
                            canAccess ? 'cursor-pointer hover:bg-muted' : 'cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className="shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : canAccess ? (
                              <div className="flex h-4 w-4 items-center justify-center rounded-full border border-border">
                                <Play className="h-2 w-2 translate-x-px text-muted-foreground" />
                              </div>
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          <span
                            className={`flex-1 text-sm ${
                              isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                            }`}
                          >
                            {lesson.title}
                          </span>

                          <div className="flex shrink-0 items-center gap-2">
                            {lesson.isFree && !isEnrolled && (
                              <span className="rounded-full border border-ai-500/25 bg-ai-50 px-1.5 py-0.5 text-[10px] text-ai-700">
                                Vista previa
                              </span>
                            )}
                            {lesson.durationSeconds && (
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {formatDuration(lesson.durationSeconds)}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
