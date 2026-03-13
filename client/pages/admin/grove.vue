<template>
  <div class="admin-grove">
    <div class="page-header">
      <h1><TreePine :size="22" :stroke-width="1.6" /> Grove</h1>
      <button class="btn-primary" @click="showForm = true">
        <Plus :size="16" /> Add Entry
      </button>
    </div>

    <div v-if="showForm" class="grove-form">
      <h3>{{ editingId ? 'Edit' : 'New' }} Grove Entry</h3>
      <div class="form-grid">
        <input v-model="form.name" placeholder="Name" />
        <input v-model="form.url" placeholder="URL" />
        <input v-model="form.description" placeholder="Description" />
        <input v-model="form.treeLabel" placeholder="Tree label (emoji)" />
        <input v-model.number="form.displayOrder" type="number" placeholder="Order" />
      </div>
      <div class="form-actions">
        <button class="btn-primary" @click="handleSubmit">{{ editingId ? 'Update' : 'Create' }}</button>
        <button class="btn-secondary" @click="resetForm">Cancel</button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <Loader2 :size="20" class="spin-icon" /> Loading...
    </div>
    <table v-else-if="data?.length" class="grove-table">
      <thead>
        <tr><th>Order</th><th>Label</th><th>Name</th><th>URL</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="entry in data" :key="entry.id">
          <td>{{ entry.displayOrder }}</td>
          <td>{{ entry.treeLabel }}</td>
          <td>{{ entry.name }}</td>
          <td><a :href="entry.url" target="_blank" rel="noopener">{{ entry.url }}</a></td>
          <td class="action-cell">
            <button class="action-btn" @click="startEdit(entry)"><Pencil :size="14" /></button>
            <button class="action-btn danger" @click="handleDeleteEntry(entry.id)"><Trash2 :size="14" /></button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty-state">No grove entries yet.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { TreePine, Plus, Pencil, Trash2, Loader2 } from 'lucide-vue-next';
import { useGroveList, type IGroveEntry } from '~/composables/useGrove';
import { createGroveEntry, updateGroveEntry, deleteGroveEntry } from '~/composables/useAdminGrove';
import { useQueryClient } from '@tanstack/vue-query';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Grove | Admin' });

const { data, isLoading } = useGroveList();
const queryClient = useQueryClient();
const showForm = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  name: '',
  url: '',
  description: '',
  treeLabel: '🌲',
  displayOrder: 0,
});

function resetForm(): void {
  showForm.value = false;
  editingId.value = null;
  form.name = '';
  form.url = '';
  form.description = '';
  form.treeLabel = '🌲';
  form.displayOrder = 0;
}

function startEdit(entry: IGroveEntry): void {
  editingId.value = entry.id;
  form.name = entry.name;
  form.url = entry.url;
  form.description = entry.description;
  form.treeLabel = entry.treeLabel;
  form.displayOrder = entry.displayOrder;
  showForm.value = true;
}

async function handleSubmit(): Promise<void> {
  if (editingId.value) {
    await updateGroveEntry(editingId.value, { ...form });
  } else {
    await createGroveEntry({ ...form });
  }
  await queryClient.invalidateQueries({ queryKey: ['grove'] });
  resetForm();
}

async function handleDeleteEntry(id: string): Promise<void> {
  if (!window.confirm('Delete this grove entry?')) return;
  await deleteGroveEntry(id);
  await queryClient.invalidateQueries({ queryKey: ['grove'] });
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.page-header h1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.6rem;
  color: #111827;
  margin: 0;
}
.grove-form {
  background: white;
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.grove-form h3 { margin: 0 0 0.8rem; font-size: 1rem; color: #374151; }
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}
.form-grid input {
  padding: 0.45rem 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.88rem;
}
.form-grid input:focus { outline: none; border-color: #1a4731; }
.form-actions { display: flex; gap: 0.5rem; }
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
.btn-secondary {
  padding: 0.5rem 1rem;
  background: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.88rem;
}
.grove-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.grove-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}
.grove-table td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.88rem;
}
.grove-table a { color: #1a4731; text-decoration: none; }
.grove-table a:hover { text-decoration: underline; }
.action-cell { display: flex; gap: 0.3rem; }
.action-btn {
  padding: 0.3rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  color: #4b5563;
}
.action-btn.danger { color: #dc2626; border-color: #fecaca; }
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: #6b7280;
}
.empty-state { text-align: center; padding: 3rem; color: #9ca3af; }
.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
