import { useQuery } from '@tanstack/vue-query';
import { useAuthStore } from '~/stores/auth';

export interface IDashboardStats {
  posts: { total: number; published: number; draft: number; archived: number };
  poems: { total: number; published: number; draft: number };
  media: { total: number };
}

export interface IRecentItem {
  id: string;
  title: string;
  contentType: 'post' | 'poem';
  status: string;
  updatedAt: string;
}

function authHeaders(): Record<string, string> {
  const store = useAuthStore();
  return store.accessToken ? { Authorization: `Bearer ${store.accessToken}` } : {};
}

export function useDashboardStats() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<IDashboardStats> => {
      return await $fetch<IDashboardStats>(`${apiBase}/dashboard/stats`, {
        headers: authHeaders(),
      });
    },
  });
}

export function useDashboardRecent() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: async (): Promise<IRecentItem[]> => {
      return await $fetch<IRecentItem[]>(`${apiBase}/dashboard/recent`, {
        headers: authHeaders(),
      });
    },
  });
}
