<template>
  <div class="dashboard">
    <h1>Dashboard</h1>

    <section class="stats-grid" aria-label="Content statistics">
      <div class="stat-card">
        <span class="stat-label">Posts</span>
        <span class="stat-value">{{ stats?.posts.total ?? '—' }}</span>
        <span class="stat-detail">{{ stats?.posts.published ?? 0 }} published · {{ stats?.posts.draft ?? 0 }} draft</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Poems</span>
        <span class="stat-value">{{ stats?.poems.total ?? '—' }}</span>
        <span class="stat-detail">{{ stats?.poems.published ?? 0 }} published · {{ stats?.poems.draft ?? 0 }} draft</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Media</span>
        <span class="stat-value">{{ stats?.media.total ?? '—' }}</span>
        <span class="stat-detail">total assets</span>
      </div>
    </section>

    <section class="recent-section" aria-label="Recent items">
      <h2>Recently Modified</h2>
      <div v-if="recentLoading" class="loading-state">Loading...</div>
      <table v-else-if="recent && recent.length > 0" class="recent-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in recent" :key="item.id">
            <td>
              <NuxtLink :to="editLink(item)">{{ item.title }}</NuxtLink>
            </td>
            <td><span class="type-badge">{{ item.contentType }}</span></td>
            <td><span class="status-badge" :class="item.status">{{ item.status }}</span></td>
            <td class="date-cell">{{ formatDate(item.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-state">No content yet. Start by creating a post or poem.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStats, useDashboardRecent, type IRecentItem } from '~/composables/useDashboard';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Dashboard | Admin' });

const { data: stats } = useDashboardStats();
const { data: recent, isLoading: recentLoading } = useDashboardRecent();

function editLink(item: IRecentItem): string {
  return item.contentType === 'post' ? `/admin/posts/${item.id}` : `/admin/poems/${item.id}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
</script>

<style scoped>
.dashboard h1 {
  font-size: 1.8rem;
  color: #1a202c;
  margin: 0 0 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #718096;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0.25rem 0;
}

.stat-detail {
  font-size: 0.8rem;
  color: #a0aec0;
}

.recent-section h2 {
  font-size: 1.2rem;
  color: #2d3748;
  margin: 0 0 1rem;
}

.recent-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.recent-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #718096;
  border-bottom: 1px solid #edf2f7;
  background: #f7fafc;
}

.recent-table td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid #edf2f7;
  font-size: 0.9rem;
}

.recent-table a {
  color: #2d3748;
  text-decoration: none;
  font-weight: 500;
}

.recent-table a:hover {
  color: #1a4731;
}

.type-badge {
  font-size: 0.75rem;
  text-transform: capitalize;
  color: #4a5568;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.status-badge.draft { background: #fefcbf; color: #744210; }
.status-badge.published { background: #c6f6d5; color: #22543d; }
.status-badge.archived { background: #e2e8f0; color: #4a5568; }

.date-cell {
  color: #a0aec0;
  font-size: 0.85rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
}
</style>
