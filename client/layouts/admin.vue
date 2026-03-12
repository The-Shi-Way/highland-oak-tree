<template>
  <div class="admin-wrapper">
    <aside class="admin-sidebar" role="navigation" aria-label="Admin navigation">
      <div class="sidebar-header">
        <NuxtLink to="/admin" class="admin-logo">
          <TreePine :size="20" :stroke-width="1.8" />
          <span>Highland Oak</span>
        </NuxtLink>
        <span class="admin-badge">Admin</span>
      </div>
      <nav class="sidebar-nav">
        <NuxtLink to="/admin" class="nav-item" exact>
          <LayoutDashboard :size="18" />
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/admin/posts" class="nav-item">
          <FileText :size="18" />
          <span>Posts</span>
        </NuxtLink>
        <NuxtLink to="/admin/poems" class="nav-item">
          <Feather :size="18" />
          <span>Poems</span>
        </NuxtLink>
        <NuxtLink to="/admin/media" class="nav-item">
          <ImageIcon :size="18" />
          <span>Media</span>
        </NuxtLink>
      </nav>
      <div class="sidebar-footer">
        <NuxtLink to="/" class="nav-item" target="_blank">
          <ExternalLink :size="18" />
          <span>View Site</span>
        </NuxtLink>
        <button class="nav-item logout-btn" @click="handleLogout">
          <LogOut :size="18" />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <main class="admin-main" role="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { TreePine, LayoutDashboard, FileText, Feather, ImageIcon, ExternalLink, LogOut } from 'lucide-vue-next';
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
  background: linear-gradient(180deg, #111827 0%, #1a202c 100%);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  transition: opacity 0.2s;
}

.admin-logo:hover {
  opacity: 0.85;
}

.admin-badge {
  font-size: 0.6rem;
  background: linear-gradient(135deg, #1a4731, #276749);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 1.25rem;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.88rem;
  transition: all 0.15s;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.router-link-active {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.08);
  border-left-color: #34d399;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.5rem 0;
}

.logout-btn {
  color: #f87171;
}

.logout-btn:hover {
  background: rgba(248, 113, 113, 0.08);
  color: #fca5a5;
}

.admin-main {
  flex: 1;
  padding: 2rem;
  background: #f8fafc;
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
    gap: 0;
  }
  .nav-item {
    border-left: none;
    border-bottom: 3px solid transparent;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  .nav-item.router-link-active {
    border-left-color: transparent;
    border-bottom-color: #34d399;
  }
  .sidebar-footer {
    border-top: none;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
  }
}
</style>
