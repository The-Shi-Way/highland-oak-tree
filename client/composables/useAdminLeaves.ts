import { useAuthStore } from '~/stores/auth';
import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import type { ILeafListResponse } from '~/composables/useLeaves';
import type { ILeafDetail } from '~/composables/useLeaf';

function authHeaders(): Record<string, string> {
  const store = useAuthStore();
  return store.accessToken ? { Authorization: `Bearer ${store.accessToken}` } : {};
}

function apiBase(): string {
  const config = useRuntimeConfig();
  return config.public.apiBase as string;
}

export function useAdminLeafList(page: Ref<number>) {
  return useQuery({
    queryKey: ['admin-leaves', page],
    queryFn: async (): Promise<ILeafListResponse> => {
      return await $fetch<ILeafListResponse>(
        `${apiBase()}/leaves/admin/all?page=${page.value}&limit=20`,
        { headers: authHeaders() },
      );
    },
  });
}

export async function fetchAdminLeaf(id: string): Promise<ILeafDetail> {
  return await $fetch<ILeafDetail>(`${apiBase()}/leaves/admin/${id}`, {
    headers: authHeaders(),
  });
}

export async function createLeaf(data: {
  title: string;
  body: Record<string, unknown>;
  leafType: string;
  growth?: string;
  vines?: string[];
  excerpt?: string;
  featuredImage?: string;
}): Promise<ILeafDetail> {
  return await $fetch<ILeafDetail>(`${apiBase()}/leaves`, {
    method: 'POST',
    headers: authHeaders(),
    body: data,
  });
}

export async function updateLeaf(
  id: string,
  data: {
    title?: string;
    body?: Record<string, unknown>;
    leafType?: string;
    growth?: string;
    vines?: string[];
    excerpt?: string;
    featuredImage?: string;
  },
): Promise<ILeafDetail> {
  return await $fetch<ILeafDetail>(`${apiBase()}/leaves/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: data,
  });
}

export async function publishLeaf(id: string): Promise<void> {
  await $fetch(`${apiBase()}/leaves/${id}/publish`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function unpublishLeaf(id: string): Promise<void> {
  await $fetch(`${apiBase()}/leaves/${id}/unpublish`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function deleteLeaf(id: string): Promise<void> {
  await $fetch(`${apiBase()}/leaves/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function runMigration(): Promise<{ postsConverted: number; poemsConverted: number }> {
  return await $fetch<{ postsConverted: number; poemsConverted: number }>(
    `${apiBase()}/leaves/admin/migrate`,
    { method: 'POST', headers: authHeaders() },
  );
}
