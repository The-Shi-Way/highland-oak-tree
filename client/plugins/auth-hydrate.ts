import { useAuthStore } from '~/stores/auth';

/**
 * Hydrates the auth store from the cookie on every request (SSR + client).
 * This ensures tokens persist across page navigations and refreshes.
 */
export default defineNuxtPlugin(() => {
  const store = useAuthStore();
  store.hydrate();
});
