import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';

export interface IChirpListItem {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  status: string;
  expiresAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IChirpListResponse {
  chirps: IChirpListItem[];
  total: number;
  page: number;
  limit: number;
}

export function useChirpList(page: Ref<number>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['chirps', page],
    queryFn: async (): Promise<IChirpListResponse> => {
      return await $fetch<IChirpListResponse>(
        `${apiBase}/chirps?page=${page.value}&limit=20`,
      );
    },
  });
}
