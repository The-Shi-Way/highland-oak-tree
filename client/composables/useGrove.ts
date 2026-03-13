import { useQuery } from '@tanstack/vue-query';

export interface IGroveEntry {
  id: string;
  name: string;
  url: string;
  description: string;
  treeLabel: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function useGroveList() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  return useQuery({
    queryKey: ['grove'],
    queryFn: async (): Promise<IGroveEntry[]> => {
      return await $fetch<IGroveEntry[]>(`${apiBase}/grove`);
    },
  });
}
