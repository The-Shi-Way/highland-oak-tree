<template>
  <div class="admin-wrapper">
    <aside class="admin-sidebar" role="navigation" aria-label="Admin navigation">
      <div class="sidebar-header">
        <NuxtLink to="/admin" class="admin-logo">Highland Oak</NuxtLink>
        <span class="admin-badge">Admin</span>
      </div>
      <nav class="sidebar-nav">
        <NuxtLink to="/admin" class="nav-item">Dashboard</NuxtLink>
        <NuxtLink to="/admin/posts" class="nav-item">Posts</NuxtLink>
        <NuxtLink to="/admin/poems" class="nav-item">Poems</NuxtLink>
        <NuxtLink to="/admin/media" class="nav-item">Media</NuxtLink>
      </nav>
      <div class="sidebar-footer">
        <NuxtLink to="/" class="nav-item" target="_blank">View Site ↗</NuxtLink>
        <button class="nav-item logout-btn" @click="handleLogout">Logout</button>
      </div>
    </aside>

    <main class="admin-main" role="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

definePageMeta({ middleware: 'auth' });

const { logout } = useAuth();

async function handleLogout(): Promise<void> {
  await logout();
}
</script>

<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.admin-sidebar {
  width: 240px;
  background: #1a202c;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-logo {
  color: #e2e8f0;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
}

.admin-badge {
  font-size: 0.65rem;
  background: #1a4731;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0;
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: block;
  padding: 0.6rem 1.25rem;
  color: #a0aec0;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.15s;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #fff;
  background: #2d3748;
}

.sidebar-footer {
  border-top: 1px solid #2d3748;
  padding: 0.5rem 0;
}

.logout-btn {
  color: #fc8181;
}

.logout-btn:hover {
  background: #2d3748;
  color: #feb2b2;
}

.admin-main {
  flex: 1;
  padding: 2rem;
  background: #f7fafc;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-wrapper {
    flex-direction: column;
  }
  .admin-sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
  }
  .sidebar-nav {
    flex-direction: row;
    padding: 0;
  }
  .sidebar-footer {
    border-top: none;
    border-left: 1px solid #2d3748;
    display: flex;
  }
}
</style>
