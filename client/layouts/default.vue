<template>
  <div class="site-wrapper">
    <header class="site-header">
      <nav class="nav-container" role="navigation" aria-label="Main navigation">
        <NuxtLink to="/" class="site-logo">
          <TreePine :size="22" :stroke-width="1.8" />
          <span>The Highland Oak Tree</span>
        </NuxtLink>
        <ul class="nav-links">
          <li>
            <NuxtLink to="/" class="nav-link">
              <Home :size="16" />
              <span>Blog</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/poetry" class="nav-link">
              <Feather :size="16" />
              <span>Poetry</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/search" class="nav-link">
              <Search :size="16" />
              <span>Search</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </header>

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
import { TreePine, Home, Feather, Search } from 'lucide-vue-next';
</script>

<style scoped>
.site-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #2c3e50;
  background: #fcfcfb;
}

.site-header {
  border-bottom: 1px solid #e8e5e0;
  padding: 0.9rem 2rem;
  background: linear-gradient(180deg, #fdfcfa 0%, #f8f6f2 100%);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #1a4731;
  text-decoration: none;
  letter-spacing: -0.02em;
  transition: opacity 0.2s;
}

.site-logo:hover {
  opacity: 0.85;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #5a6672;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.nav-link:hover {
  color: #1a4731;
  background: rgba(26, 71, 49, 0.06);
}

.nav-link.router-link-active {
  color: #1a4731;
  background: rgba(26, 71, 49, 0.08);
  font-weight: 500;
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
  border-top: 1px solid #e8e5e0;
  padding: 1.5rem 2rem;
  background: #f8f6f2;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #8a9199;
  font-size: 0.82rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.footer-inner p {
  margin: 0;
}

.footer-icon {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 0.6rem;
  }
  .nav-links {
    gap: 0.25rem;
  }
  .site-main {
    padding: 1rem;
  }
  .site-header {
    padding: 0.75rem 1rem;
  }
}
</style>
