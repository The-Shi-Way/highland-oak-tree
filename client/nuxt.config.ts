export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },

  nitro: {
    devProxy: {
      '/api': {
        target: process.env.API_BACKEND_URL || 'http://localhost:3001/api',
        changeOrigin: true,
      },
    },
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2024-07-01',
});
