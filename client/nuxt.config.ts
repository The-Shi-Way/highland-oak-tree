export default defineNuxtConfig({
  devtools: { enabled: true },

  components: {
    dirs: [
      { path: '~/components', pathPrefix: false },
    ],
  },

  css: [
    '~/assets/css/typography.css',
    '~/assets/css/animations.css',
    '~/assets/css/seasons.css',
    '~/assets/css/texture.css',
  ],

  modules: ['@pinia/nuxt'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },

    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,500&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:wght@400;700;900&display=swap',
        },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: 'The Wind — The Highland Oak Tree',
          href: '/feed',
        },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: 'Prose Feed',
          href: '/prose/feed',
        },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: 'Blossom Feed',
          href: '/blossom/feed',
        },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: 'Fruit Feed',
          href: '/fruit/feed',
        },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: 'Seed Feed',
          href: '/seed/feed',
        },
      ],
    },
  },

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
