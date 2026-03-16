<template>
  <div class="site-wrapper">
    <FallingLeaves :season="currentSeason" />
    <TreeNavigation />

    <main class="site-main" role="main">
      <slot />
    </main>

    <BackToTop />

    <footer class="site-footer" role="contentinfo">
      <div class="footer-inner">
        <div class="footer-about">
          <p class="footer-brand">🌳 The Highland Oak Tree</p>
          <p class="footer-tagline">A living journal of prose, poetry, ideas, and reflections.</p>
        </div>
        <nav class="footer-nav" aria-label="Footer navigation">
          <NuxtLink to="/roots">Roots</NuxtLink>
          <NuxtLink to="/grove">Grove</NuxtLink>
          <NuxtLink to="/bulletin-board">Chirps</NuxtLink>
          <NuxtLink to="/canopy">Canopy</NuxtLink>
          <NuxtLink to="/search">Search</NuxtLink>
        </nav>
        <p class="footer-copy">&copy; {{ new Date().getFullYear() }} The Highland Oak Tree. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { currentSeason } = useSeason();
</script>

<style scoped>
.site-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--color-text, #2c2c2c);
  background: var(--color-bg, #fcfcfb);
}

.site-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.site-footer {
  border-top: 1px solid var(--color-border, #e8e5e0);
  padding: var(--space-xl, 2rem) var(--space-xl, 2rem);
  background: var(--color-surface, #f8f6f2);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.footer-about {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.footer-brand {
  font-family: var(--font-display, 'Playfair Display'), serif;
  font-size: var(--text-base, 1rem);
  font-weight: var(--weight-semibold, 600);
  color: var(--color-primary, #4a7c59);
  margin: 0;
}

.footer-tagline {
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-muted, #8a9199);
  margin: 0;
  font-style: italic;
  font-family: var(--font-accent, 'Cormorant Garamond', serif);
}

.footer-nav {
  display: flex;
  gap: 1.5rem;
}

.footer-nav a {
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-muted, #8a9199);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-nav a:hover {
  color: var(--color-primary, #4a7c59);
}

.footer-copy {
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-muted, #8a9199);
  margin: 0;
}

@media (max-width: 768px) {
  .site-main { padding: 1rem; }

  .footer-inner {
    flex-direction: column;
    gap: var(--space-xs, 0.25rem);
    text-align: center;
  }
}
</style>
