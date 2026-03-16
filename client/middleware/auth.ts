import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const store = useAuthStore();

  // On client, ensure store is hydrated from cookie before checking
  if (import.meta.client && !store.isAuthenticated) {
    store.hydrate();
  }

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!store.isAuthenticated) {
      return navigateTo('/admin/login');
    }
  }
});
