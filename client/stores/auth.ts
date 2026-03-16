import { defineStore } from 'pinia';

interface IAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

interface ICookiePayload {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

function readCookie(): ICookiePayload | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith('highland-auth='));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('='))) as ICookiePayload;
  } catch {
    return null;
  }
}

function writeCookie(payload: ICookiePayload | null): void {
  if (typeof document === 'undefined') return;
  if (payload) {
    const value = encodeURIComponent(JSON.stringify(payload));
    document.cookie = `highland-auth=${value}; path=/; max-age=86400; SameSite=Lax`;
  } else {
    document.cookie = 'highland-auth=; path=/; max-age=0';
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): IAuthState => {
    return { accessToken: null, refreshToken: null, expiresAt: null };
  },

  getters: {
    isAuthenticated: (state): boolean => {
      return !!state.accessToken && !!state.expiresAt && Date.now() < state.expiresAt;
    },
  },

  actions: {
    /** Hydrate state from cookie — safe to call on both SSR and client */
    hydrate(): void {
      const saved = readCookie();
      if (saved && saved.expiresAt > Date.now()) {
        this.accessToken = saved.accessToken;
        this.refreshToken = saved.refreshToken;
        this.expiresAt = saved.expiresAt;
      }
    },

    setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.expiresAt = Date.now() + expiresIn * 1000;
      writeCookie({ accessToken, refreshToken, expiresAt: this.expiresAt });
    },

    clearTokens(): void {
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = null;
      writeCookie(null);
    },
  },
});
