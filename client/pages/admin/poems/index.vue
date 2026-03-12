<template>
  <div class="admin-poems">
    <div class="page-header">
      <h1>
        <Feather :size="22" :stroke-width="1.6" />
        Poems
      </h1>
      <button class="btn-primary" @click="handleCreate">
        <Plus :size="16" />
        New Poem
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <Loader2 :size="20" class="spin-icon" />
      Loading poems...
    </div>
    <table v-else-if="data && data.length > 0" class="poems-table">
      <thead>
        <tr><th>Title</th><th>Theme</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="poem in data" :key="poem.id">
          <td><NuxtLink :to="`/admin/poems/${poem.id}`">{{ poem.title }}</NuxtLink></td>
          <td><span class="theme-label">{{ poem.theme }}</span></td>
          <td><span class="status-badge" :class="poem.status">{{ poem.status }}</span></td>
          <td><NuxtLink :to="`/admin/poems/${poem.id}`" class="action-link">
            <Pencil :size="14" />
            Edit
          </NuxtLink></td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty-state">
      <Feather :size="28" :stroke-width="1.2" />
      No poems yet. Write your first one.
    </p>
  </div>
</template>

<script setup lang="ts">
import { Feather, Plus, Loader2, Pencil } from 'lucide-vue-next';
import { usePoemList } from '~/composables/usePoems';
import { createPoem } from '~/composables/useAdminPoems';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Poems | Admin' });

const { data, isLoading } = usePoemList();

async function handleCreate(): Promise<void> {
  const poem = await createPoem({
    title: 'Untitled Poem',
    body: { type: 'doc', content: [{ type: 'paragraph' }] },
  });
  navigateTo(`/admin/poems/${poem.id}`);
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.6rem;
  color: #111827;
  margin: 0;
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
  transition: all 0.2s;
}
.btn-primary:hover { background: linear-gradient(135deg, #22543d, #276749); box-shadow: 0 2px 8px rgba(26, 71, 49, 0.2); }
.poems-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02); }
.poems-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #f3f4f6; }
.poems-table td { padding: 0.7rem 1rem; border-bottom: 1px solid #f3f4f6; font-size: 0.88rem; }
.poems-table tr:last-child td { border-bottom: none; }
.poems-table a { color: #1f2937; text-decoration: none; font-weight: 500; transition: color 0.2s; }
.poems-table a:hover { color: #1a4731; }
.theme-label { font-size: 0.8rem; color: #4b5563; text-transform: capitalize; }
.status-badge { font-size: 0.72rem; padding: 0.18rem 0.55rem; border-radius: 999px; font-weight: 500; }
.status-badge.draft { background: #fef9c3; color: #854d0e; }
.status-badge.published { background: #dcfce7; color: #166534; }
.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.84rem;
  color: #1a4731;
  text-decoration: none;
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
