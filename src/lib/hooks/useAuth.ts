import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login as apiLogin, register as apiRegister, logout as apiLogout, me as apiMe } from '../api';
import { useAuthStore } from '../store/auth.store';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiLogin(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (dto: { email: string; password: string; firstName: string; lastName: string }) =>
      apiRegister(dto),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiLogout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

export function useMe() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const user = await apiMe();
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      setAuth(user, token ?? '');
      return user;
    },
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useHydrate() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);

  return useQuery({
    queryKey: ['hydrate'],
    queryFn: async () => {
      try {
        const user = await apiMe();
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token) {
          setAuth(user, token);
        } else {
          clearAuth();
        }
        return user;
      } catch {
        clearAuth();
        return null;
      }
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('accessToken'),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}