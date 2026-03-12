import { useAuthStore } from '~/stores/auth';

interface ILoginPayload {
  username: string;
  password: string;
}

interface IAuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function useAuth() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  const store = useAuthStore();

  async function login(payload: ILoginPayload): Promise<void> {
    const res = await $fetch<IAuthTokensResponse>(`${apiBase}/auth/login`, {
      method: 'POST',
      body: payload,
    });
    store.setTokens(res.accessToken, res.refreshToken, res.expiresIn);
  }

  async function refresh(): Promise<void> {
    if (!store.refreshToken) return;
    const res = await $fetch<IAuthTokensResponse>(`${apiBase}/auth/refresh`, {
      method: 'POST',
      body: { refreshToken: store.refreshToken },
    });
    store.setTokens(res.accessToken, res.refreshToken, res.expiresIn);
  }

  async function logout(): Promise<void> {
    if (store.accessToken) {
      try {
        await $fetch(`${apiBase}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${store.accessToken}` },
        });
      } catch {
        // Logout best-effort
      }
    }
    store.clearTokens();
    navigateTo('/admin/login');
  }

  return { login, refresh, logout, store };
}
