import { useAuthStore } from '~/stores/auth';
import type { IGroveEntry } from '~/composables/useGrove';

function authHeaders(): Record<string, string> {
  const store = useAuthStore();
  return store.accessToken ? { Authorization: `Bearer ${store.accessToken}` } : {};
}

function apiBase(): string {
  const config = useRuntimeConfig();
  return config.public.apiBase as string;
}

export async function createGroveEntry(data: {
  name: string;
  url: string;
  description: string;
  treeLabel: string;
  displayOrder?: number;
}): Promise<IGroveEntry> {
  return await $fetch<IGroveEntry>(`${apiBase()}/grove`, {
    method: 'POST',
    headers: authHeaders(),
    body: data,
  });
}

export async function updateGroveEntry(
  id: string,
  data: {
    name?: string;
    url?: string;
    description?: string;
    treeLabel?: string;
    displayOrder?: number;
  },
): Promise<IGroveEntry> {
  return await $fetch<IGroveEntry>(`${apiBase()}/grove/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: data,
  });
}

export async function deleteGroveEntry(id: string): Promise<void> {
  await $fetch(`${apiBase()}/grove/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
