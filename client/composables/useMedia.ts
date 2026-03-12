import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { useAuthStore } from '~/stores/auth';

export interface IMediaAsset {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  cdnUrl: string;
  thumbnails: { small: string; medium: string; large: string } | null;
  assetType: string;
  createdAt: string;
}

function authHeaders(): Record<string, string> {
  const store = useAuthStore();
  return store.accessToken ? { Authorization: `Bearer ${store.accessToken}` } : {};
}

export function useMediaList() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['media'],
    queryFn: async (): Promise<IMediaAsset[]> => {
      return await $fetch<IMediaAsset[]>(`${apiBase}/media`, {
        headers: authHeaders(),
      });
    },
  });
}

export function useMediaActions() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  const queryClient = useQueryClient();

  async function uploadFile(file: File): Promise<IMediaAsset> {
    const formData = new FormData();
    formData.append('file', file);
    const result = await $fetch<IMediaAsset>(`${apiBase}/media/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    await queryClient.invalidateQueries({ queryKey: ['media'] });
    return result;
  }

  async function deleteMedia(id: string): Promise<void> {
    await $fetch(`${apiBase}/media/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    await queryClient.invalidateQueries({ queryKey: ['media'] });
  }

  return { uploadFile, deleteMedia };
}
