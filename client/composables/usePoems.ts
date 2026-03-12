import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';

export interface IPoemListItem {
  id: string;
  title: string;
  theme: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface IPoemDetail extends IPoemListItem {
  body: Record<string, unknown>;
  displayOrder: number;
  updatedAt: string;
}

export function usePoemList() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['poems'],
    queryFn: async (): Promise<IPoemListItem[]> => {
      return await $fetch<IPoemListItem[]>(`${apiBase}/poems`);
    },
  });
}

export function usePoemById(id: Ref<string>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: computed(() => ['poem', id.value]),
    queryFn: async (): Promise<IPoemDetail> => {
      return await $fetch<IPoemDetail>(`${apiBase}/poems/${id.value}`);
    },
    enabled: computed(() => !!id.value),
  });
}
