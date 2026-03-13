<template>
  <div class="admin-leaves">
    <div class="page-header">
      <h1>
        <Leaf :size="22" :stroke-width="1.6" />
        Leaves
      </h1>
      <button class="btn-primary" :disabled="creating" @click="handleCreate">
        <Loader2 v-if="creating" :size="16" class="spin-icon" />
        <Plus v-else :size="16" />
        {{ creating ? 'Creating...' : 'New Leaf' }}
      </button>
    </div>

    <div class="filters-bar">
      <select v-model="typeFilter" aria-label="Filter by type">
        <option value="">All Types</option>
        <option value="prose">Prose</option>
        <option value="blossom">Blossom</option>
        <option value="fruit">Fruit</option>
        <option value="seed">Seed</option>
      </select>
      <select v-model="statusFilter" aria-label="Filter by status">
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <div v-if="isLoading" class="loading-state">
      <Loader2 :size="20" class="spin-icon" />
      Loading leaves...
    </div>
    <table v-else-if="filteredLeaves.length" class="leaves-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th>Growth</th>
          <th>Status</th>
          <th>Published</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="leaf in filteredLeaves" :key="leaf.id">
          <td><NuxtLink :to="`/admin/leaves/${leaf.id}`">{{ leaf.title }}</NuxtLink></td>
          <td><LeafTypeBadge :leaf-type="leaf.leafType" /></td>
          <td class="growth-cell">{{ leaf.growth }}</td>
          <td><span class="status-badge" :class="leaf.status">{{ leaf.status }}</span></td>
          <td class="date-cell">{{ leaf.publishedAt ? formatDate(leaf.publishedAt) : '—' }}</td>
          <td>
            <NuxtLink :to="`/admin/leaves/${leaf.id}`" class="action-link">
              <Pencil :size="14" /> Edit
            </NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty-state">
      <Leaf :size="28" :stroke-width="1.2" />
      No leaves yet. Create your first one.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Leaf, Plus, Loader2, Pencil } from 'lucide-vue-next';
import { useAdminLeafList, createLeaf } from '~/composables/useAdminLeaves';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Leaves | Admin' });

const page = ref(1);
const typeFilter = ref('');
const statusFilter = ref('');
const { data, isLoading } = useAdminLeafList(page);
const creating = ref(false);

const filteredLeaves = computed(() => {
  if (!data.value?.leaves) return [];
  return data.value.leaves.filter((l) => {
    if (typeFilter.value && l.leafType !== typeFilter.value) return false;
    if (statusFilter.value && l.status !== statusFilter.value) return false;
    return true;
  });
});

async function handleCreate(): Promise<void> {
  if (creating.value) return;
  creating.value = true;
  try {
    const leaf = await createLeaf({
      title: 'Untitled Leaf',
      body: { type: 'doc', content: [{ type: 'paragraph' }] },
      leafType: 'prose',
    });
    navigateTo(`/admin/leaves/${leaf.id}`);
  } catch (e) {
    console.error('Failed to create leaf:', e);
  } finally {
    creating.value = false;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.page-header h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.6rem;
  color: #111827;
  margin: 0;
}
.filters-bar {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}
.filters-bar select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.84rem;
  background: white;
  color: #374151;
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
.leaves-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.leaves-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}
.leaves-table td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.88rem;
}
.leaves-table tr:last-child td { border-bottom: none; }
.leaves-table a { color: #1f2937; text-decoration: none; font-weight: 500; }
.leaves-table a:hover { color: #1a4731; }
.growth-cell { font-size: 0.82rem; color: #6b7280; text-transform: capitalize; }
.status-badge {
  font-size: 0.72rem;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  font-weight: 500;
}
.status-badge.draft { background: #fef9c3; color: #854d0e; }
.status-badge.published { background: #dcfce7; color: #166534; }
.status-badge.archived { background: #f1f5f9; color: #475569; }
.date-cell { color: #9ca3af; font-size: 0.82rem; }
.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.84rem;
  color: #1a4731;
}
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: #6b7280;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}
.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
