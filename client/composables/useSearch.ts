import { useQuery } from '@tanstack/vue-query';
import { type Ref, computed } from 'vue';

export interface ISearchResultItem {
  title: string;
  excerpt: string;
  leafType: string;
  season: string;
  growth: string;
  slug: string;
  publishedAt: string;
}

export interface ISearchResponse {
  results: ISearchResultItem[];
  total: number;
  query: string;
}

export function useSearch(query: Ref<string>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: computed(() => ['search', query.value]),
    queryFn: async (): Promise<ISearchResponse> => {
      return await $fetch<ISearchResponse>(`${apiBase}/search`, {
        params: { q: query.value },
      });
    },
    enabled: computed(() => query.value.length >= 2),
  });
}
