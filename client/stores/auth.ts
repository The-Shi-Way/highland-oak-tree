import { defineStore } from 'pinia';

interface IAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): IAuthState => ({
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => {
      return !!state.accessToken && !!state.expiresAt && Date.now() < state.expiresAt;
    },
  },

  actions: {
    setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.expiresAt = Date.now() + expiresIn * 1000;
      this.persistToCookie();
    },

    clearTokens(): void {
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = null;
      this.persistToCookie();
    },

    /** Restore tokens from cookie on app init (works in SSR + client). */
    hydrate(): void {
      const cookie = useCookie<IAuthState | null>('highland-auth', { default: () => null });
      if (cookie.value) {
        this.accessToken = cookie.value.accessToken;
        this.refreshToken = cookie.value.refreshToken;
        this.expiresAt = cookie.value.expiresAt;
      }
    },

    /** Persist current state to a cookie (httpOnly=false so client JS can read). */
    persistToCookie(): void {
      const cookie = useCookie<IAuthState | null>('highland-auth', {
        maxAge: 86400,
        path: '/',
        sameSite: 'lax',
      });
      if (this.accessToken) {
        cookie.value = {
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          expiresAt: this.expiresAt,
        };
      } else {
        cookie.value = null;
      }
    },
  },
});
