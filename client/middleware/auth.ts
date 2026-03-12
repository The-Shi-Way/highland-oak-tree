import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const store = useAuthStore();

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!store.isAuthenticated) {
      return navigateTo('/admin/login');
    }
  }
});
