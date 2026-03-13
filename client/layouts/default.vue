<template>
  <div class="site-wrapper">
    <FallingLeaves :season="currentSeason" />
    <TreeNavigation />

    <main class="site-main" role="main">
      <slot />
    </main>

    <footer class="site-footer" role="contentinfo">
      <div class="footer-inner">
        <TreePine :size="16" :stroke-width="1.5" class="footer-icon" />
        <p>&copy; {{ new Date().getFullYear() }} The Highland Oak Tree. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { TreePine } from 'lucide-vue-next';

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
  padding: 1.5rem 2rem;
  background: var(--color-surface, #f8f6f2);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-muted, #8a9199);
  font-size: 0.82rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.footer-inner p { margin: 0; }
.footer-icon { opacity: 0.5; }

@media (max-width: 768px) {
  .site-main { padding: 1rem; }
}
</style>
