import { useQuery } from '@tanstack/vue-query';
import { useAuthStore } from '~/stores/auth';

export type LeafType = 'prose' | 'blossom' | 'fruit' | 'seed';

export interface IDashboardStats {
  leaves: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    byType: Record<LeafType, number>;
  };
  media: { total: number };
}

export interface IRecentItem {
  id: string;
  title: string;
  leafType: LeafType;
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
