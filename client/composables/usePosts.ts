import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';

export interface IPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string[];
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

export interface IPostListResponse {
  data: IPostListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IPostDetail extends IPostListItem {
  body: Record<string, unknown>;
  updatedAt: string;
}

export function usePostList(page: Ref<number>, tag?: Ref<string | undefined>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['posts', page, tag],
    queryFn: async (): Promise<IPostListResponse> => {
      const params = new URLSearchParams();
      params.set('page', String(page.value));
      params.set('limit', '10');
      if (tag?.value) {
        params.set('tag', tag.value);
      }
      const res = await $fetch<IPostListResponse>(`${apiBase}/posts?${params.toString()}`);
      return res;
    },
  });
}

export function usePostBySlug(slug: Ref<string>) {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: computed(() => ['post', slug.value]),
    queryFn: async (): Promise<IPostDetail> => {
      return await $fetch<IPostDetail>(`${apiBase}/posts/${slug.value}`);
    },
    enabled: computed(() => !!slug.value),
  });
}
