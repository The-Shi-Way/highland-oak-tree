import { useAuthStore } from '~/stores/auth';

export interface IAiSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

export interface IAiReviewResult {
  suggestions: IAiSuggestion[];
}

export interface IAiRewriteResult {
  rewrittenText: string;
}

function authHeaders(): Record<string, string> {
  const store = useAuthStore();
  return store.accessToken ? { Authorization: `Bearer ${store.accessToken}` } : {};
}

export type LeafType = 'prose' | 'blossom' | 'fruit' | 'seed';

export async function reviewContent(
  content: string,
  leafType: LeafType,
): Promise<IAiReviewResult> {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  return await $fetch<IAiReviewResult>(`${apiBase}/ai/review`, {
    method: 'POST',
    headers: authHeaders(),
    body: { content, leafType },
  });
}

export async function rewriteContent(
  content: string,
  leafType: LeafType,
  selectedText: string,
): Promise<IAiRewriteResult> {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  return await $fetch<IAiRewriteResult>(`${apiBase}/ai/rewrite`, {
    method: 'POST',
    headers: authHeaders(),
    body: { content, leafType, selectedText },
  });
}
