import { apiFetch } from '../api';
import type { User } from '../types';

export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export async function getUsers(page = 1, limit = 20): Promise<UsersResponse> {
  return apiFetch<UsersResponse>(`/users?page=${page}&limit=${limit}`);
}

export async function updateUserRole(
  userId: string,
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN',
): Promise<User> {
  return apiFetch<User>(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}
