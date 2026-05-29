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
            className="rounded-xl border border-[#c9beab] bg-[#ede7d9] overflow-hidden"
          >
            {/* Section header */}
            <button
              onClick={() => toggle(section.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-stone-900/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900/10 border border-stone-700/20 text-xs font-bold text-stone-700">
                  {si + 1}
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm">{section.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {completedInSection}/{section.totalLessons} clases
                    {section.totalDurationSeconds > 0 && (
                      <> · {formatDuration(section.totalDurationSeconds)}</>
                    )}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Lessons */}
            {isOpen && section.lessons && section.lessons.length > 0 && (
              <div className="border-t border-[#c9beab]">
                {section.lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const canAccess = isEnrolled || lesson.isFree;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => canAccess && onLessonClick?.(lesson)}
                      disabled={!canAccess}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#c9beab]/60 last:border-0
                        ${canAccess ? 'hover:bg-stone-900/5 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                      `}
                    >
                      {/* Icon */}
                      <div className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-emerald-700" />
                        ) : canAccess ? (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full border border-[#c9beab]">
                            <Play className="h-2 w-2 text-stone-600 translate-x-px" />
                          </div>
                        ) : (
                          <Lock className="h-4 w-4 text-stone-400" />
                        )}
                      </div>

                      {/* Title */}
                      <span className={`flex-1 text-sm ${isCompleted ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                        {lesson.title}
                      </span>

                      {/* Tags */}
                      <div className="flex shrink-0 items-center gap-2">
                        {lesson.isFree && !isEnrolled && (
                          <span className="rounded-full bg-emerald-50 border border-emerald-600/20 px-1.5 py-0.5 text-[10px] text-emerald-700">
                            Preview
                          </span>
                        )}
                        {lesson.durationSeconds && (
                          <span className="text-xs text-stone-400 tabular-nums">
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
