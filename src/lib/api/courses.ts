import { apiFetch } from '../api';
import type { Course, CoursesResponse, CourseFilters, Enrollment, Comment } from '../types';

export async function getCourses(filters: CourseFilters = {}): Promise<CoursesResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  const qs = params.toString();
  return apiFetch<CoursesResponse>(`/courses${qs ? `?${qs}` : ''}`);
}

export async function getCourse(slugOrId: string): Promise<Course> {
  return apiFetch<Course>(`/courses/${slugOrId}`);
}

export async function getMyCourses(filters: CourseFilters = {}): Promise<CoursesResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  const qs = params.toString();
  return apiFetch<CoursesResponse>(`/courses/instructor/my${qs ? `?${qs}` : ''}`);
}

// ─── Student enrollment ───────────────────────────────────────────────────────

export async function requestEnrollment(courseId: string): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/courses/${courseId}/enroll`, { method: 'POST' });
}

export async function cancelEnrollment(courseId: string): Promise<void> {
  return apiFetch<void>(`/courses/${courseId}/enroll`, { method: 'DELETE' });
}

// Keep old name as alias for backward compat
export const enrollCourse = requestEnrollment;
export const unenrollCourse = cancelEnrollment;

export async function getMyEnrollments(): Promise<Enrollment[]> {
  return apiFetch<Enrollment[]>('/enrollments/my');
}

export async function getEnrollment(courseId: string): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/courses/${courseId}/enrollment`);
}

export async function getProgress(courseId: string): Promise<string[]> {
  return apiFetch<string[]>(`/courses/${courseId}/progress`);
}

export async function completeLesson(lessonId: string): Promise<{ progressPercentage: number }> {
  return apiFetch<{ progressPercentage: number }>(`/lessons/${lessonId}/complete`, {
    method: 'POST',
  });
}

// ─── Instructor enrollment management ────────────────────────────────────────

export async function getCourseEnrollments(
  courseId: string,
  status?: string,
): Promise<Enrollment[]> {
  const qs = status ? `?status=${status}` : '';
  return apiFetch<Enrollment[]>(`/courses/${courseId}/enrollments${qs}`);
}

export async function approveEnrollment(enrollmentId: string): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/enrollments/${enrollmentId}/approve`, { method: 'POST' });
}

export async function rejectEnrollment(enrollmentId: string, reason?: string): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/enrollments/${enrollmentId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
}

export async function manualEnrollStudent(
  courseId: string,
  studentId: string,
): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/courses/${courseId}/enrollments/student/${studentId}`, {
    method: 'POST',
  });
}

// ─── Instructor course CRUD ───────────────────────────────────────────────────

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  promoVideoUrl?: string;
  level?: string;
  category?: string;
  language?: string;
  price?: number;
  requirements?: string[];
  whatYouLearn?: string[];
  tags?: string[];
}

export async function createCourse(data: CreateCourseData): Promise<Course> {
  return apiFetch<Course>('/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateCourse(id: string, data: Partial<CreateCourseData>): Promise<Course> {
  return apiFetch<Course>(`/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function publishCourse(id: string): Promise<Course> {
  return apiFetch<Course>(`/courses/${id}/publish`, { method: 'PATCH' });
}

export async function deleteCourse(id: string): Promise<void> {
  return apiFetch<void>(`/courses/${id}`, { method: 'DELETE' });
}

// ─── Instructor section CRUD ──────────────────────────────────────────────────

export interface CreateSectionData { title: string; description?: string; order?: number }

export async function createSection(courseId: string, data: CreateSectionData): Promise<import('../types').Section> {
  return apiFetch<import('../types').Section>(`/courses/${courseId}/sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateSection(courseId: string, sectionId: string, data: Partial<CreateSectionData>): Promise<import('../types').Section> {
  return apiFetch<import('../types').Section>(`/courses/${courseId}/sections/${sectionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteSection(courseId: string, sectionId: string): Promise<void> {
  return apiFetch<void>(`/courses/${courseId}/sections/${sectionId}`, { method: 'DELETE' });
}

// ─── Instructor lesson CRUD ───────────────────────────────────────────────────

export interface CreateLessonData {
  title: string;
  description?: string;
  youtubeUrl: string;
  order?: number;
  durationSeconds?: number;
  isFree?: boolean;
  notes?: string;
}

export async function createLesson(sectionId: string, data: CreateLessonData): Promise<import('../types').Lesson> {
  return apiFetch<import('../types').Lesson>(`/sections/${sectionId}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateLesson(sectionId: string, lessonId: string, data: Partial<CreateLessonData>): Promise<import('../types').Lesson> {
  return apiFetch<import('../types').Lesson>(`/sections/${sectionId}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteLesson(sectionId: string, lessonId: string): Promise<void> {
  return apiFetch<void>(`/sections/${sectionId}/lessons/${lessonId}`, { method: 'DELETE' });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function getComments(courseId: string): Promise<Comment[]> {
  return apiFetch<Comment[]>(`/courses/${courseId}/comments`);
}

export async function postComment(courseId: string, content: string, parentId?: string): Promise<Comment> {
  return apiFetch<Comment>(`/courses/${courseId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, ...(parentId ? { parentId } : {}) }),
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
};

export const CATEGORY_LABELS: Record<string, string> = {
  PROGRAMMING: 'Programación',
  DESIGN: 'Diseño',
  BUSINESS: 'Negocios',
  MARKETING: 'Marketing',
  PHOTOGRAPHY: 'Fotografía',
  MUSIC: 'Música',
  HEALTH: 'Salud',
  OTHER: 'Otro',
};

export const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'text-emerald-700 bg-emerald-50 border-emerald-600/20',
  INTERMEDIATE: 'text-amber-700 bg-amber-50 border-amber-600/20',
  ADVANCED: 'text-red-700 bg-red-50 border-red-600/20',
};

export const CATEGORY_COLORS: Record<string, string> = {
  PROGRAMMING: 'text-stone-700 bg-stone-900/8 border-stone-700/20',
  DESIGN: 'text-purple-700 bg-purple-50 border-purple-600/20',
  BUSINESS: 'text-orange-700 bg-orange-50 border-orange-600/20',
  MARKETING: 'text-pink-700 bg-pink-50 border-pink-600/20',
  PHOTOGRAPHY: 'text-cyan-700 bg-cyan-50 border-cyan-600/20',
  MUSIC: 'text-violet-700 bg-violet-50 border-violet-600/20',
  HEALTH: 'text-green-700 bg-green-50 border-green-600/20',
  OTHER: 'text-stone-600 bg-stone-900/5 border-stone-500/20',
};
