<template>
  <div class="admin-chirps">
    <div class="page-header">
      <h1><Bird :size="22" :stroke-width="1.6" /> Chirps</h1>
      <button class="btn-primary" @click="showForm = true">
        <Plus :size="16" /> New Chirp
      </button>
    </div>

    <div v-if="showForm" class="chirp-form">
      <h3>{{ editingId ? 'Edit' : 'New' }} Chirp</h3>
      <div class="form-fields">
        <input v-model="form.title" placeholder="Title" maxlength="150" />
        <textarea v-model="form.body" placeholder="Body" maxlength="500" rows="3" />
        <label class="expires-label">
          Expires at (optional)
          <input v-model="form.expiresAt" type="datetime-local" />
        </label>
      </div>
      <div class="form-actions">
        <button class="btn-primary" @click="handleSubmit">{{ editingId ? 'Update' : 'Create' }}</button>
        <button class="btn-secondary" @click="resetForm">Cancel</button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <Loader2 :size="20" class="spin-icon" /> Loading...
    </div>
    <template v-else-if="data?.chirps?.length">
      <table class="chirp-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Pinned</th>
            <th>Title</th>
            <th>Expires</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="chirp in data.chirps" :key="chirp.id">
            <td>
              <span :class="['status-badge', chirp.status === 'published' ? 'badge-published' : 'badge-draft']">
                {{ chirp.status }}
              </span>
            </td>
            <td>{{ chirp.isPinned ? '📌' : '—' }}</td>
            <td>{{ chirp.title }}</td>
            <td>
              <span v-if="!chirp.expiresAt">—</span>
              <span v-else-if="isExpired(chirp.expiresAt)" class="expired-text">Expired</span>
              <span v-else>{{ formatDate(chirp.expiresAt) }}</span>
            </td>
            <td>{{ formatDate(chirp.createdAt) }}</td>
            <td class="action-cell">
              <button class="action-btn" title="Edit" @click="startEdit(chirp)">
                <Pencil :size="14" />
              </button>
              <button
                v-if="chirp.status === 'draft'"
                class="action-btn publish"
                title="Publish"
                @click="handlePublish(chirp.id)"
              >
                <Eye :size="14" />
              </button>
              <button
                v-else
                class="action-btn"
                title="Unpublish"
                @click="handleUnpublish(chirp.id)"
              >
                <EyeOff :size="14" />
              </button>
              <button
                v-if="!chirp.isPinned"
                class="action-btn"
                title="Pin"
                @click="handlePin(chirp.id)"
              >
                <Pin :size="14" />
              </button>
              <button
                v-else
                class="action-btn"
                title="Unpin"
                @click="handleUnpin(chirp.id)"
              >
                <PinOff :size="14" />
              </button>
              <button class="action-btn danger" title="Delete" @click="handleDelete(chirp.id)">
                <Trash2 :size="14" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <nav v-if="totalPages > 1" class="pagination" aria-label="Admin chirps pagination">
        <button class="pagination__btn" :disabled="page <= 1" @click="page--">← Prev</button>
        <span class="pagination__info">Page {{ page }} of {{ totalPages }}</span>
        <button class="pagination__btn" :disabled="page >= totalPages" @click="page++">Next →</button>
      </nav>
    </template>
    <p v-else class="empty-state">No chirps yet.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { Bird, Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Pin, PinOff } from 'lucide-vue-next';
import { useQueryClient } from '@tanstack/vue-query';
import type { IChirpListItem } from '~/composables/useChirps';
import {
  useAdminChirpList,
  createChirp,
  updateChirp,
  publishChirp,
  unpublishChirp,
  pinChirp,
  unpinChirp,
  deleteChirp,
} from '~/composables/useAdminChirps';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Chirps | Admin' });

const queryClient = useQueryClient();
const page = ref(1);
const { data, isLoading } = useAdminChirpList(page);

const showForm = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  title: '',
  body: '',
  expiresAt: '',
});

const totalPages = computed((): number => {
  if (!data.value || data.value.limit === 0) return 1;
  return Math.ceil(data.value.total / data.value.limit);
});

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function resetForm(): void {
  showForm.value = false;
  editingId.value = null;
  form.title = '';
  form.body = '';
  form.expiresAt = '';
}

function startEdit(chirp: IChirpListItem): void {
  editingId.value = chirp.id;
  form.title = chirp.title;
  form.body = chirp.body;
  form.expiresAt = chirp.expiresAt ? toDatetimeLocal(chirp.expiresAt) : '';
  showForm.value = true;
}

async function handleSubmit(): Promise<void> {
  const payload: { title?: string; body?: string; expiresAt?: string | null } = {};

  if (editingId.value) {
    if (form.title) payload.title = form.title;
    if (form.body) payload.body = form.body;
    payload.expiresAt = form.expiresAt ? new Date(form.expiresAt).toISOString() : null;
    await updateChirp(editingId.value, payload);
  } else {
    const createPayload: { title: string; body: string; expiresAt?: string } = {
      title: form.title,
      body: form.body,
    };
    if (form.expiresAt) {
      createPayload.expiresAt = new Date(form.expiresAt).toISOString();
    }
    await createChirp(createPayload);
  }
  await queryClient.invalidateQueries({ queryKey: ['chirps'] });
  resetForm();
}

async function handlePublish(id: string): Promise<void> {
  await publishChirp(id);
  await queryClient.invalidateQueries({ queryKey: ['chirps'] });
}

async function handleUnpublish(id: string): Promise<void> {
  await unpublishChirp(id);
  await queryClient.invalidateQueries({ queryKey: ['chirps'] });
}

async function handlePin(id: string): Promise<void> {
  await pinChirp(id);
  await queryClient.invalidateQueries({ queryKey: ['chirps'] });
}

async function handleUnpin(id: string): Promise<void> {
  await unpinChirp(id);
  await queryClient.invalidateQueries({ queryKey: ['chirps'] });
}

async function handleDelete(id: string): Promise<void> {
  if (!window.confirm('Delete this chirp?')) return;
  await deleteChirp(id);
  await queryClient.invalidateQueries({ queryKey: ['chirps'] });
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
.chirp-form {
  background: white;
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.chirp-form h3 { margin: 0 0 0.8rem; font-size: 1rem; color: #374151; }
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}
.form-fields input,
.form-fields textarea {
  padding: 0.45rem 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.88rem;
  font-family: inherit;
}
.form-fields input:focus,
.form-fields textarea:focus { outline: none; border-color: #1a4731; }
.form-fields textarea { resize: vertical; }
.expires-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #6b7280;
}
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
.chirp-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.chirp-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}
.chirp-table td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.88rem;
}
.status-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}
.badge-draft { background: #f3f4f6; color: #6b7280; }
.badge-published { background: #d1fae5; color: #065f46; }
.expired-text { color: #dc2626; font-weight: 500; font-size: 0.82rem; }
.action-cell { display: flex; gap: 0.3rem; }
.action-btn {
  padding: 0.3rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  color: #4b5563;
}
.action-btn:hover { background: #f9fafb; }
.action-btn.publish { color: #065f46; border-color: #a7f3d0; }
.action-btn.danger { color: #dc2626; border-color: #fecaca; }
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.pagination__btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #1a4731;
  font-size: 0.88rem;
  cursor: pointer;
}
.pagination__btn:hover:not(:disabled) { background: #f9fafb; }
.pagination__btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pagination__info { font-size: 0.88rem; color: #6b7280; }
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
