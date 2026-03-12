<template>
  <div class="admin-poems">
    <div class="page-header">
      <h1>Poems</h1>
      <button class="btn-primary" @click="handleCreate">+ New Poem</button>
    </div>

    <div v-if="isLoading" class="loading-state">Loading poems...</div>
    <table v-else-if="data && data.length > 0" class="poems-table">
      <thead>
        <tr><th>Title</th><th>Theme</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="poem in data" :key="poem.id">
          <td><NuxtLink :to="`/admin/poems/${poem.id}`">{{ poem.title }}</NuxtLink></td>
          <td><span class="theme-label">{{ poem.theme }}</span></td>
          <td><span class="status-badge" :class="poem.status">{{ poem.status }}</span></td>
          <td><NuxtLink :to="`/admin/poems/${poem.id}`" class="action-link">Edit</NuxtLink></td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty-state">No poems yet. Write your first one.</p>
  </div>
</template>

<script setup lang="ts">
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
.page-header h1 { font-size: 1.6rem; color: #1a202c; margin: 0; }
.btn-primary { padding: 0.5rem 1rem; background: #1a4731; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
.btn-primary:hover { background: #22543d; }
.poems-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.poems-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.8rem; text-transform: uppercase; color: #718096; background: #f7fafc; border-bottom: 1px solid #edf2f7; }
.poems-table td { padding: 0.65rem 1rem; border-bottom: 1px solid #edf2f7; font-size: 0.9rem; }
.poems-table a { color: #2d3748; text-decoration: none; font-weight: 500; }
.poems-table a:hover { color: #1a4731; }
.theme-label { font-size: 0.8rem; color: #4a5568; text-transform: capitalize; }
.status-badge { font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 999px; }
.status-badge.draft { background: #fefcbf; color: #744210; }
.status-badge.published { background: #c6f6d5; color: #22543d; }
.action-link { font-size: 0.85rem; color: #1a4731; }
.loading-state, .empty-state { text-align: center; padding: 3rem; color: #718096; }
</style>
