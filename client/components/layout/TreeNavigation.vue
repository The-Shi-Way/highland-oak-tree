<template>
  <header class="tree-header">
    <nav class="tree-nav" role="navigation" aria-label="Main navigation">
      <NuxtLink to="/" class="tree-logo">
        <TreePine :size="22" :stroke-width="1.8" />
        <span>The Highland Oak Tree</span>
      </NuxtLink>

      <button
        class="mobile-toggle"
        :aria-expanded="mobileOpen"
        aria-controls="nav-menu"
        aria-label="Toggle navigation"
        @click="mobileOpen = !mobileOpen"
      >
        <Menu v-if="!mobileOpen" :size="22" />
        <X v-else :size="22" />
      </button>

      <ul id="nav-menu" class="nav-links" :class="{ open: mobileOpen }">
        <!-- Branches dropdown -->
        <li class="nav-dropdown">
          <button class="nav-link dropdown-trigger" @click="branchesOpen = !branchesOpen">
            <GitBranch :size="16" />
            <span>Branches</span>
            <ChevronDown :size="14" :class="{ rotated: branchesOpen }" />
          </button>
          <ul v-show="branchesOpen" class="dropdown-menu">
            <li><NuxtLink to="/prose" class="dropdown-item" @click="closeAll">🍃 Prose</NuxtLink></li>
            <li><NuxtLink to="/blossom" class="dropdown-item" @click="closeAll">🌸 Blossom</NuxtLink></li>
            <li><NuxtLink to="/fruit" class="dropdown-item" @click="closeAll">🍎 Fruit</NuxtLink></li>
            <li><NuxtLink to="/seed" class="dropdown-item" @click="closeAll">🌱 Seed</NuxtLink></li>
          </ul>
        </li>

        <li><NuxtLink to="/canopy" class="nav-link" @click="closeAll"><Layers :size="16" /><span>Canopy</span></NuxtLink></li>
        <li><NuxtLink to="/forest-floor" class="nav-link" @click="closeAll"><Archive :size="16" /><span>Forest Floor</span></NuxtLink></li>
        <li><NuxtLink to="/roots" class="nav-link" @click="closeAll"><Heart :size="16" /><span>Roots</span></NuxtLink></li>
        <li><NuxtLink to="/grove" class="nav-link" @click="closeAll"><Trees :size="16" /><span>Grove</span></NuxtLink></li>
        <li><NuxtLink to="/search" class="nav-link" @click="closeAll"><Search :size="16" /><span>Search</span></NuxtLink></li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  TreePine, Menu, X, GitBranch, ChevronDown,
  Layers, Archive, Heart, Trees, Search,
} from 'lucide-vue-next';

const mobileOpen = ref(false);
const branchesOpen = ref(false);

function closeAll(): void {
  mobileOpen.value = false;
  branchesOpen.value = false;
}
</script>

<style scoped>
.tree-header {
  border-bottom: 1px solid var(--color-border, #e8e5e0);
  padding: 0.9rem 2rem;
  background: linear-gradient(180deg, #fdfcfa 0%, var(--color-surface, #f8f6f2) 100%);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}
.tree-nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tree-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-primary, #1a4731);
  text-decoration: none;
  letter-spacing: -0.02em;
  transition: opacity 0.2s;
}
.tree-logo:hover { opacity: 0.85; }
.mobile-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--color-text, #2c2c2c);
  cursor: pointer;
  padding: 0.3rem;
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
  align-items: center;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-muted, #5a6672);
  text-decoration: none;
  font-size: 0.88rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: none;
  border: none;
  cursor: pointer;
}
.nav-link:hover {
  color: var(--color-primary, #1a4731);
  background: rgba(26, 71, 49, 0.06);
}
.nav-link.router-link-active {
  color: var(--color-primary, #1a4731);
  background: rgba(26, 71, 49, 0.08);
  font-weight: 500;
}
.nav-dropdown { position: relative; }
.dropdown-trigger .rotated { transform: rotate(180deg); transition: transform 0.2s; }
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  list-style: none;
  margin: 0.3rem 0 0;
  padding: 0.4rem;
  background: #fff;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  min-width: 150px;
  z-index: 200;
}
.dropdown-item {
  display: block;
  padding: 0.45rem 0.75rem;
  color: var(--color-text, #2c2c2c);
  text-decoration: none;
  font-size: 0.88rem;
  border-radius: 6px;
  transition: background 0.15s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.dropdown-item:hover { background: var(--color-tertiary, #faf3e0); }

@media (max-width: 768px) {
  .mobile-toggle { display: block; }
  .nav-links {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border-bottom: 1px solid var(--color-border, #e8e5e0);
    padding: 0.5rem 1rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  }
  .nav-links.open { display: flex; }
  .dropdown-menu {
    position: static;
    box-shadow: none;
    border: none;
    padding-left: 1rem;
  }
}
</style>
