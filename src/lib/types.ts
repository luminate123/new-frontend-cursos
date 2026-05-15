export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// ─── Courses ────────────────────────────────────────────────────────────────

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseCategory =
  | 'PROGRAMMING' | 'DESIGN' | 'BUSINESS' | 'MARKETING'
  | 'PHOTOGRAPHY' | 'MUSIC' | 'HEALTH' | 'OTHER';

export interface LessonResource {
  title: string;
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  youtubeVideoId: string | null;
  order: number;
  durationSeconds: number | null;
  isFree: boolean;
  resources: LessonResource[] | null;
  notes: string | null;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  title: string;
  description: string | null;
  order: number;
  totalLessons: number;
  totalDurationSeconds: number;
  courseId: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseInstructor {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  thumbnail: string | null;
  promoVideoUrl: string | null;
  level: CourseLevel;
  category: CourseCategory;
  language: string;
  price: number;
  isPublished: boolean;
  requirements: string[];
  whatYouLearn: string[];
  tags: string[];
  totalDurationSeconds: number;
  totalLessons: number;
  rating: number;
  ratingCount: number;
  enrollmentCount: number;
  instructorId: string;
  instructor: CourseInstructor;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  data: Course[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };
  status: EnrollmentStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  progressPercentage: number;
  completedLessons: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
  enrolledAt: string;
  updatedAt: string;
}

export interface CourseFilters {
  page?: string;
  limit?: string;
  search?: string;
  category?: CourseCategory;
  level?: CourseLevel;
  language?: string;
}