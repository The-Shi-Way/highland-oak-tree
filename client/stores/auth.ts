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
    },

    clearTokens(): void {
      this.accessToken = null;
      this.refreshToken = null;
      this.expiresAt = null;
    },
  },
});
