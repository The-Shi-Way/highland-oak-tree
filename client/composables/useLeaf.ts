import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import type { ILeafListItem } from './useLeaves';

export interface ILeafDetail extends ILeafListItem {
  body: Record<string, unknown>;
  isForestFloor: boolean;
  updatedAt: string;
}

export function useLeafBySlug(leafType: Ref<string>, slug: Ref<string>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: computed(() => ['leaf', leafType.value, slug.value]),
    queryFn: async (): Promise<ILeafDetail> => {
      return await $fetch<ILeafDetail>(
        `${apiBase}/leaves/${leafType.value}/${slug.value}`,
      );
    },
    enabled: computed(() => !!leafType.value && !!slug.value),
  });
}

export function useRelatedLeaves(leafId: Ref<string | undefined>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: computed(() => ['leaf', 'related', leafId.value]),
    queryFn: async (): Promise<ILeafListItem[]> => {
      return await $fetch<ILeafListItem[]>(
        `${apiBase}/leaves/${leafId.value}/related`,
      );
    },
    enabled: computed(() => !!leafId.value),
  });
}
