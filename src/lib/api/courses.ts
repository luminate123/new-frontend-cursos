import { apiFetch } from '../api';
import type { Course, CoursesResponse, CourseFilters, Enrollment, Comment, LessonResource } from '../types';

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
  line?: string;
  discipline?: string;
  academicHours?: number;
  competencies?: string[];
  hasFormalEvaluation?: boolean;
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
  resources?: LessonResource[];
}

// Max upload size for downloadable material (server bucket is shared/billed).
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB

// Uploads a file to Cloudflare R2 via a presigned URL and returns its public URL.
export async function uploadResource(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('El archivo supera el límite de 100 MB');
  }
  const { uploadUrl, publicUrl } = await apiFetch<{ uploadUrl: string; publicUrl: string }>(
    '/uploads/presign',
    {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream' }),
    },
  );
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!res.ok) throw new Error('Error al subir el archivo');
  return publicUrl;
}

// Deletes a previously uploaded resource from Cloudflare R2.
export async function deleteResource(url: string): Promise<void> {
  await apiFetch<void>('/uploads', { method: 'DELETE', body: JSON.stringify({ url }) });
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
  ESSENTIALS: 'Essentials',
  PROFESSIONAL: 'Professional',
  ADVANCED: 'Advanced',
  EXECUTIVE: 'Executive',
};

// Qué es cada nivel, para el tooltip y los filtros del catalogo.
export const LEVEL_DESCRIPTIONS: Record<string, string> = {
  ESSENTIALS: 'Cursos cortos de entrada',
  PROFESSIONAL: 'Programas de especialización',
  ADVANCED: 'Programas avanzados',
  EXECUTIVE: 'Para gerentes y directivos',
};

// Progresión visual: del navy claro al navy profundo segun sube el nivel.
export const LEVEL_COLORS: Record<string, string> = {
  ESSENTIALS: 'text-navy-600 bg-navy-50 border-navy-300/50',
  PROFESSIONAL: 'text-navy-700 bg-navy-100 border-navy-300/60',
  ADVANCED: 'text-navy-50 bg-navy-700 border-navy-700',
  EXECUTIVE: 'text-navy-50 bg-navy-950 border-navy-950',
};

export const LINE_LABELS: Record<string, string> = {
  KORE_AI: 'KORE AI',
  KORE_PROFESSIONAL: 'KORE Professional',
};

export const LINE_DESCRIPTIONS: Record<string, string> = {
  KORE_AI: 'Inteligencia Artificial aplicada',
  KORE_PROFESSIONAL: 'Especialización por profesión',
};

// El cian identifica la línea KORE AI; nunca se usa como color de acción.
export const LINE_COLORS: Record<string, string> = {
  KORE_AI: 'text-ai-700 bg-ai-50 border-ai-500/25',
  KORE_PROFESSIONAL: 'text-brand-700 bg-brand-50 border-brand-500/25',
};

export const DISCIPLINE_LABELS: Record<string, string> = {
  TRANSVERSAL: 'Todas las profesiones',
  INGENIERIA: 'Ingeniería',
  ADMINISTRACION: 'Administración',
  CONTABILIDAD: 'Contabilidad',
  ECONOMIA: 'Economía',
  DERECHO: 'Derecho',
  EDUCACION: 'Educación',
  SALUD: 'Salud',
  MARKETING: 'Marketing',
  RRHH: 'Recursos Humanos',
  FINANZAS: 'Finanzas',
  TECNOLOGIA: 'Tecnología',
  GESTION_PUBLICA: 'Gestión Pública',
  ARQUITECTURA: 'Arquitectura',
  COMUNICACION: 'Comunicación',
};

// Modelo de formación KORE: COMPRENDER -> APLICAR -> CREAR
export const PHASE_LABELS: Record<string, string> = {
  LEARN: 'KORE LEARN',
  APPLY: 'KORE APPLY',
  CREATE: 'KORE CREATE',
};

export const PHASE_SUBTITLES: Record<string, string> = {
  LEARN: 'Comprender el conocimiento',
  APPLY: 'Aplicarlo a situaciones profesionales',
  CREATE: 'Crear soluciones y proyectos',
};

export function formatAcademicHours(hours: number): string {
  return hours > 0 ? `${hours} h académicas` : '';
}

export function formatPEN(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(amount));
}
