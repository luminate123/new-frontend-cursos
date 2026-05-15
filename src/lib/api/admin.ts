import { apiFetch } from '../api';

export interface AdminStats {
  users: {
    total: number;
    students: number;
    instructors: number;
    admins: number;
  };
  courses: {
    total: number;
    published: number;
    drafts: number;
  };
  enrollments: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  topCourses: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    studentCount: number;
  }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/users/stats');
}
