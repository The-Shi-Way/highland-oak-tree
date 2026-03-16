import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import type { IChirpListItem, IChirpListResponse } from '~/composables/useChirps';

function authHeaders(): Record<string, string> {
  const store = useAuthStore();
  return store.accessToken ? { Authorization: `Bearer ${store.accessToken}` } : {};
}

function apiBase(): string {
  const config = useRuntimeConfig();
  return config.public.apiBase as string;
}

export function useAdminChirpList(page: Ref<number>) {
  return useQuery({
    queryKey: ['chirps', 'admin', page],
    queryFn: async (): Promise<IChirpListResponse> => {
      return await $fetch<IChirpListResponse>(
        `${apiBase()}/chirps/admin/all?page=${page.value}&limit=20`,
        { headers: authHeaders() },
      );
    },
  });
}

export async function createChirp(data: {
  title: string;
  body: string;
  expiresAt?: string;
}): Promise<IChirpListItem> {
  return await $fetch<IChirpListItem>(`${apiBase()}/chirps`, {
    method: 'POST',
    headers: authHeaders(),
    body: data,
  });
}

export async function updateChirp(
  id: string,
  data: { title?: string; body?: string; expiresAt?: string | null },
): Promise<IChirpListItem> {
  return await $fetch<IChirpListItem>(`${apiBase()}/chirps/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: data,
  });
}

export async function publishChirp(id: string): Promise<IChirpListItem> {
  return await $fetch<IChirpListItem>(`${apiBase()}/chirps/${id}/publish`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function unpublishChirp(id: string): Promise<IChirpListItem> {
  return await $fetch<IChirpListItem>(`${apiBase()}/chirps/${id}/unpublish`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function pinChirp(id: string): Promise<IChirpListItem> {
  return await $fetch<IChirpListItem>(`${apiBase()}/chirps/${id}/pin`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function unpinChirp(id: string): Promise<IChirpListItem> {
  return await $fetch<IChirpListItem>(`${apiBase()}/chirps/${id}/unpin`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function deleteChirp(id: string): Promise<IChirpListItem> {
  return await $fetch<IChirpListItem>(`${apiBase()}/chirps/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
