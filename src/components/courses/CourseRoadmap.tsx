'use client';

import { useState } from 'react';
import { ChevronDown, Play, Lock, CheckCircle } from 'lucide-react';
import type { Section, Lesson } from '@/lib/types';
import { formatDuration } from '@/lib/api/courses';

interface CourseRoadmapProps {
  sections: Section[];
  completedLessonIds?: string[];
  isEnrolled?: boolean;
  onLessonClick?: (lesson: Lesson) => void;
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
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {sections.map((section, si) => {
        const isOpen = openSections.has(section.id);
        const completedInSection = section.lessons?.filter((l) =>
          completedLessonIds.includes(l.id),
        ).length ?? 0;

        return (
          <div
            key={section.id}
            className="rounded-xl border border-[#1e2d4a] bg-[#0e1525] overflow-hidden"
          >
            {/* Section header */}
            <button
              onClick={() => toggle(section.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-blue-600/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600/15 border border-blue-500/20 text-xs font-bold text-blue-400">
                  {si + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-100 text-sm">{section.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {completedInSection}/{section.totalLessons} clases
                    {section.totalDurationSeconds > 0 && (
                      <> · {formatDuration(section.totalDurationSeconds)}</>
                    )}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Lessons */}
            {isOpen && section.lessons && section.lessons.length > 0 && (
              <div className="border-t border-[#1e2d4a]">
                {section.lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const canAccess = isEnrolled || lesson.isFree;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => canAccess && onLessonClick?.(lesson)}
                      disabled={!canAccess}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#1e2d4a]/60 last:border-0
                        ${canAccess ? 'hover:bg-blue-600/5 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                      `}
                    >
                      {/* Icon */}
                      <div className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : canAccess ? (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full border border-[#1e2d4a]">
                            <Play className="h-2 w-2 text-slate-400 translate-x-px" />
                          </div>
                        ) : (
                          <Lock className="h-4 w-4 text-slate-600" />
                        )}
                      </div>

                      {/* Title */}
                      <span className={`flex-1 text-sm ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                        {lesson.title}
                      </span>

                      {/* Tags */}
                      <div className="flex shrink-0 items-center gap-2">
                        {lesson.isFree && !isEnrolled && (
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
                            Preview
                          </span>
                        )}
                        {lesson.durationSeconds && (
                          <span className="text-xs text-slate-600 tabular-nums">
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
  );
}
