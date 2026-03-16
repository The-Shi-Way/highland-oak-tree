<template>
  <div class="dashboard">
    <h1>
      <Flower :size="24" :stroke-width="1.6" />
      Dashboard
    </h1>

    <section class="stats-grid" aria-label="Content statistics">
      <div class="stat-card">
        <div class="stat-icon-wrap leaves-icon">
          <Leaf :size="20" />
        </div>
        <div class="stat-body">
          <span class="stat-label">Leaves</span>
          <span class="stat-value">{{ stats?.leaves?.total ?? '—' }}</span>
          <span class="stat-detail">{{ stats?.leaves?.published ?? 0 }} published · {{ stats?.leaves?.draft ?? 0 }} draft</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap prose-icon">
          <Scroll :size="20" />
        </div>
        <div class="stat-body">
          <span class="stat-label">Prose</span>
          <span class="stat-value">{{ stats?.leaves?.byType?.prose ?? '—' }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap blossom-icon">
          <Flower2 :size="20" />
        </div>
        <div class="stat-body">
          <span class="stat-label">Blossom</span>
          <span class="stat-value">{{ stats?.leaves?.byType?.blossom ?? '—' }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap media-icon">
          <ImageIcon :size="20" />
        </div>
        <div class="stat-body">
          <span class="stat-label">Media</span>
          <span class="stat-value">{{ stats?.media.total ?? '—' }}</span>
          <span class="stat-detail">total assets</span>
        </div>
      </div>
    </section>

    <section class="migration-section" aria-label="Data migration">
      <h2><ArrowRightLeft :size="18" /> Data Migration</h2>
      <p class="migration-desc">Migrate legacy posts and poems into the unified Leaf system.</p>
      <button class="btn-primary" :disabled="migrating" @click="handleMigrate">
        <Loader2 v-if="migrating" :size="16" class="spin-icon" />
        {{ migrating ? 'Migrating...' : 'Run Migration' }}
      </button>
      <p v-if="migrationResult" class="migration-result">
        Migrated {{ migrationResult.postsConverted }} posts and {{ migrationResult.poemsConverted }} poems.
      </p>
    </section>

    <section class="recent-section" aria-label="Recent items">
      <h2>
        <Clock :size="18" />
        Recently Modified
      </h2>
      <div v-if="recentLoading" class="loading-state">
        <Loader2 :size="20" class="spin-icon" />
        Loading...
      </div>
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
            <td>
              <span class="type-badge">
                <LeafTypeBadge :leaf-type="item.leafType" />
              </span>
            </td>
            <td><span class="status-badge" :class="item.status">{{ item.status }}</span></td>
            <td class="date-cell">{{ formatDate(item.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <Sprout :size="24" :stroke-width="1.3" />
        <p>No content yet. Start by creating a leaf.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Flower, Leaf, Scroll, Flower2, ImageIcon,
  Clock, Loader2, Sprout, ArrowRightLeft,
} from 'lucide-vue-next';
import { useDashboardStats, useDashboardRecent, type IRecentItem } from '~/composables/useDashboard';
import { runMigration } from '~/composables/useAdminLeaves';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Dashboard | Admin' });

const { data: stats } = useDashboardStats();
const { data: recent, isLoading: recentLoading } = useDashboardRecent();
const migrating = ref(false);
const migrationResult = ref<{ postsConverted: number; poemsConverted: number } | null>(null);

async function handleMigrate(): Promise<void> {
  if (migrating.value) return;
  if (!window.confirm('This will migrate all posts and poems to leaves. Continue?')) return;
  migrating.value = true;
  try {
    migrationResult.value = await runMigration();
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    migrating.value = false;
  }
}

function editLink(item: IRecentItem): string {
  return `/admin/leaves/${item.id}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
</script>

<style scoped>
.dashboard h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.7rem;
  color: #111827;
  margin: 0 0 1.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: box-shadow 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.leaves-icon {
  background: #f0fdf4;
  color: #22c55e;
}

.prose-icon {
  background: #eff6ff;
  color: #3b82f6;
}

.blossom-icon {
  background: #fdf2f8;
  color: #ec4899;
}

.media-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.stat-body {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.stat-value {
  font-size: 1.85rem;
  font-weight: 700;
  color: #111827;
  margin: 0.1rem 0;
  line-height: 1.2;
}

.stat-detail {
  font-size: 0.78rem;
  color: #9ca3af;
}

.recent-section h2 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.15rem;
  color: #1f2937;
  margin: 0 0 1rem;
}

.recent-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
}

.recent-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}

.recent-table td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.88rem;
}

.recent-table tr:last-child td {
  border-bottom: none;
}

.recent-table a {
  color: #1f2937;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.recent-table a:hover {
  color: #1a4731;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  text-transform: capitalize;
  color: #4b5563;
}

.status-badge {
  font-size: 0.72rem;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  font-weight: 500;
}

.status-badge.draft { background: #fef9c3; color: #854d0e; }
.status-badge.published { background: #dcfce7; color: #166534; }
.status-badge.archived { background: #f1f5f9; color: #475569; }

.date-cell {
  color: #9ca3af;
  font-size: 0.82rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #6b7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  padding: 2.5rem;
  color: #9ca3af;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.migration-section {
  margin-top: 2rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.migration-section h2 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.15rem;
  color: #1f2937;
  margin: 0 0 0.4rem;
}
.migration-desc {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 0.8rem;
}
.migration-result {
  margin-top: 0.6rem;
  font-size: 0.88rem;
  color: #166534;
  font-weight: 500;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #1a4731, #22543d);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
}
.btn-primary:hover { background: linear-gradient(135deg, #22543d, #276749); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
