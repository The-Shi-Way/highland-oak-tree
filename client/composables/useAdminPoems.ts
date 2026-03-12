import { useAuthStore } from '~/stores/auth';
import type { IPoemDetail } from '~/composables/usePoems';

function authHeaders(): Record<string, string> {
  const store = useAuthStore();
  return store.accessToken ? { Authorization: `Bearer ${store.accessToken}` } : {};
}

function apiBase(): string {
  const config = useRuntimeConfig();
  return config.public.apiBase as string;
}

export async function fetchPoem(id: string): Promise<IPoemDetail> {
  return await $fetch<IPoemDetail>(`${apiBase()}/poems/${id}`, {
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
