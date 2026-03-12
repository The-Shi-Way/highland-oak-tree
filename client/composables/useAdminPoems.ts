import { useAuthStore } from '~/stores/auth';
import { useQuery } from '@tanstack/vue-query';
import type { IPoemDetail, IPoemListItem } from '~/composables/usePoems';

function authHeaders(): Record<string, string> {
  const store = useAuthStore();
  return store.accessToken ? { Authorization: `Bearer ${store.accessToken}` } : {};
}

function apiBase(): string {
  const config = useRuntimeConfig();
  return config.public.apiBase as string;
}

/** Fetches all poems (including drafts) for the admin panel. */
export function useAdminPoemList() {
  return useQuery({
    queryKey: ['admin-poems'],
    queryFn: async (): Promise<IPoemListItem[]> => {
      return await $fetch<IPoemListItem[]>(
        `${apiBase()}/poems/admin/all`,
        { headers: authHeaders() },
      );
    },
  });
}

export async function fetchPoem(id: string): Promise<IPoemDetail> {
  return await $fetch<IPoemDetail>(`${apiBase()}/poems/admin/${id}`, {
    headers: authHeaders(),
  });
}

export async function savePoem(
  id: string,
  data: { title?: string; body?: Record<string, unknown>; theme?: string },
): Promise<IPoemDetail> {
  return await $fetch<IPoemDetail>(`${apiBase()}/poems/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: data,
  });
}

export async function createPoem(data: {
  title: string;
  body: Record<string, unknown>;
}): Promise<IPoemDetail> {
  return await $fetch<IPoemDetail>(`${apiBase()}/poems`, {
    method: 'POST',
    headers: authHeaders(),
    body: data,
  });
}

export async function publishPoem(id: string): Promise<void> {
  await $fetch(`${apiBase()}/poems/${id}/publish`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function deletePoem(id: string): Promise<void> {
  await $fetch(`${apiBase()}/poems/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
