import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';

export interface ILeafListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  leafType: string;
  season: string;
  growth: string;
  vines: string[];
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface ILeafListResponse {
  leaves: ILeafListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ITrunkResponse {
  feed: ILeafListItem[];
  seeds: ILeafListItem[];
  total: number;
  page: number;
  limit: number;
}

interface ILeafFilters {
  growth?: string;
  season?: string;
  vine?: string;
}

function buildParams(page: Ref<number>, filters?: Ref<ILeafFilters>): string {
  const params = new URLSearchParams();
  params.set('page', String(page.value));
  params.set('limit', '12');
  if (filters?.value.growth) params.set('growth', filters.value.growth);
  if (filters?.value.season) params.set('season', filters.value.season);
  if (filters?.value.vine) params.set('vine', filters.value.vine);
  return params.toString();
}

export function useLeafList(
  leafType: Ref<string>,
  page: Ref<number>,
  filters?: Ref<ILeafFilters>,
) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['leaves', 'branch', leafType, page, filters],
    queryFn: async (): Promise<ILeafListResponse> => {
      return await $fetch<ILeafListResponse>(
        `${apiBase}/leaves/branch/${leafType.value}?${buildParams(page, filters)}`,
      );
    },
  });
}

export function useVineLeaves(vine: Ref<string>, page: Ref<number>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: computed(() => ['leaves', 'vine', vine.value, page.value]),
    queryFn: async (): Promise<ILeafListResponse> => {
      const params = new URLSearchParams();
      params.set('page', String(page.value));
      params.set('limit', '12');
      return await $fetch<ILeafListResponse>(
        `${apiBase}/leaves/vine/${encodeURIComponent(vine.value)}?${params.toString()}`,
      );
    },
    enabled: computed(() => !!vine.value),
  });
}

export function useForestFloor(page: Ref<number>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['leaves', 'forest-floor', page],
    queryFn: async (): Promise<ILeafListResponse> => {
      const params = new URLSearchParams();
      params.set('page', String(page.value));
      params.set('limit', '12');
      return await $fetch<ILeafListResponse>(
        `${apiBase}/leaves/forest-floor?${params.toString()}`,
      );
    },
  });
}

export function useCanopy(page: Ref<number>, filters?: Ref<ILeafFilters>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['leaves', 'canopy', page, filters],
    queryFn: async (): Promise<ILeafListResponse> => {
      return await $fetch<ILeafListResponse>(
        `${apiBase}/leaves/canopy?${buildParams(page, filters)}`,
      );
    },
  });
}

export function useTrunkFeed(page: Ref<number>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['leaves', 'trunk', page],
    queryFn: async (): Promise<ITrunkResponse> => {
      const params = new URLSearchParams();
      params.set('page', String(page.value));
      params.set('limit', '12');
      return await $fetch<ITrunkResponse>(
        `${apiBase}/leaves?${params.toString()}`,
      );
    },
  });
}
