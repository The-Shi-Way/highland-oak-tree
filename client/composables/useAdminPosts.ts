import { useAuthStore } from '~/stores/auth';
import type { IPostDetail } from '~/composables/usePosts';

function authHeaders(): Record<string, string> {
  const store = useAuthStore();
  return store.accessToken ? { Authorization: `Bearer ${store.accessToken}` } : {};
}

function apiBase(): string {
  const config = useRuntimeConfig();
  return config.public.apiBase as string;
}

export async function fetchPost(id: string): Promise<IPostDetail> {
  return await $fetch<IPostDetail>(`${apiBase()}/posts/${id}`, {
    headers: authHeaders(),
  });
}

export async function savePost(
  id: string,
  data: { title?: string; body?: Record<string, unknown>; excerpt?: string; tags?: string[] },
): Promise<IPostDetail> {
  return await $fetch<IPostDetail>(`${apiBase()}/posts/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: data,
  });
}

export async function createPost(data: {
  title: string;
  body: Record<string, unknown>;
}): Promise<IPostDetail> {
  return await $fetch<IPostDetail>(`${apiBase()}/posts`, {
    method: 'POST',
    headers: authHeaders(),
    body: data,
  });
}

export async function publishPost(id: string): Promise<void> {
  await $fetch(`${apiBase()}/posts/${id}/publish`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function unpublishPost(id: string): Promise<void> {
  await $fetch(`${apiBase()}/posts/${id}/unpublish`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function deletePost(id: string): Promise<void> {
  await $fetch(`${apiBase()}/posts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
