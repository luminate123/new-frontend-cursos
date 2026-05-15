import { AuthResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}/api${endpoint}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const hasRefreshToken =
      typeof window !== 'undefined' && !!localStorage.getItem('refreshToken');

    if (hasRefreshToken) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryResponse = await fetch(url, { ...options, headers });
        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ message: 'Request failed' }));
          throw error;
        }
        return retryResponse.json();
      }
      // Tenía refresh token pero falló = sesión expirada, redirigir
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw { message: 'Session expired', statusCode: 401 };
    }

    // Sin refresh token = credenciales incorrectas, devolver error al caller
    const error = await response.json().catch(() => ({ message: 'Credenciales incorrectas' }));
    throw error;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw error;
  }

  return response.json();
}

async function tryRefresh(): Promise<boolean> {
  try {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refreshToken')
      : null;
    if (!refreshToken) return false;

    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data: { accessToken: string; refreshToken: string } = await response.json();
    setAccessToken(data.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return true;
  } catch {
    return false;
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(data.accessToken);
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  return data;
}

export async function register(dto: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  setAccessToken(data.accessToken);
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = typeof window !== 'undefined'
    ? localStorage.getItem('refreshToken')
    : null;
  if (refreshToken) {
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  setAccessToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refreshToken');
  }
}

export async function me(): Promise<AuthResponse['user']> {
  return apiFetch<AuthResponse['user']>('/auth/me');
}