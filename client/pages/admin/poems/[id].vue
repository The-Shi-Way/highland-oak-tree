<template>
  <div class="poem-editor">
    <div v-if="loading" class="loading-state">
      <Loader2 :size="20" class="spin-icon" />
      Loading poem...
    </div>
    <template v-else-if="poem">
      <div class="editor-header">
        <input v-model="poem.title" class="title-input" placeholder="Poem title" @blur="handleSave" />
        <div class="editor-actions">
          <span class="status-badge" :class="poem.status">{{ poem.status }}</span>
          <button class="btn-secondary" @click="handleSave" :disabled="saving">
            <Save :size="14" />
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <button v-if="poem.status === 'draft'" class="btn-primary" @click="handlePublish">
            <Send :size="14" />
            Publish
          </button>
          <button class="btn-danger" @click="handleDelete">
            <Trash2 :size="14" />
            Delete
          </button>
        </div>
      </div>

      <div class="editor-meta">
        <div class="meta-field">
          <label for="theme">
            <Palette :size="13" />
            Theme
          </label>
          <select id="theme" v-model="poem.theme" @change="handleSave">
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="nature">Nature</option>
            <option value="dark">Dark</option>
            <option value="romantic">Romantic</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>

      <TipTapEditor v-model="poem.body" placeholder="Write your poem..." />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Save, Send, Trash2, Loader2, Palette } from 'lucide-vue-next';
import { fetchPoem, savePoem, publishPoem, deletePoem } from '~/composables/useAdminPoems';
import TipTapEditor from '~/components/content/TipTapEditor.vue';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const poemId = route.params.id as string;

interface IEditablePoem {
  title: string;
  body: Record<string, unknown>;
  status: string;
  theme: string;
}

const poem = ref<IEditablePoem | null>(null);
const loading = ref(true);
const saving = ref(false);

onMounted(async () => {
  try {
    const data = await fetchPoem(poemId);
    poem.value = { title: data.title, body: data.body, status: data.status, theme: data.theme };
  } catch {
    navigateTo('/admin/poems');
  } finally {
    loading.value = false;
  }
});

async function handleSave(): Promise<void> {
  if (!poem.value || saving.value) return;
  saving.value = true;
  try {
    await savePoem(poemId, { title: poem.value.title, body: poem.value.body, theme: poem.value.theme });
  } finally {
    saving.value = false;
  }
}

async function handlePublish(): Promise<void> {
  await handleSave();
  await publishPoem(poemId);
  if (poem.value) poem.value.status = 'published';
}

async function handleDelete(): Promise<void> {
  if (!window.confirm('Delete this poem?')) return;
  await deletePoem(poemId);
  navigateTo('/admin/poems');
}
</script>

<style scoped>
.poem-editor { max-width: 900px; }
.editor-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.title-input { flex: 1; font-size: 1.5rem; font-weight: 600; border: none; border-bottom: 2px solid transparent; padding: 0.5rem 0; font-family: 'Georgia', serif; color: #111827; font-style: italic; min-width: 200px; transition: border-color 0.2s; }
.title-input:focus { outline: none; border-bottom-color: #1a4731; }
.editor-actions { display: flex; align-items: center; gap: 0.5rem; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.45rem 0.9rem; background: linear-gradient(135deg, #1a4731, #22543d); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.84rem; font-weight: 500; transition: all 0.2s;
}
.btn-primary:hover { background: linear-gradient(135deg, #22543d, #276749); box-shadow: 0 2px 8px rgba(26, 71, 49, 0.2); }
.btn-secondary {
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.45rem 0.9rem; background: white; color: #4b5563; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-size: 0.84rem; transition: all 0.2s;
}
.btn-secondary:hover { background: #f9fafb; border-color: #d1d5db; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger {
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.45rem 0.9rem; background: white; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; cursor: pointer; font-size: 0.84rem; transition: all 0.2s;
}
.btn-danger:hover { background: #fef2f2; }
.status-badge { font-size: 0.68rem; padding: 0.18rem 0.55rem; border-radius: 999px; text-transform: uppercase; font-weight: 500; letter-spacing: 0.04em; }
.status-badge.draft { background: #fef9c3; color: #854d0e; }
.status-badge.published { background: #dcfce7; color: #166534; }
.editor-meta { margin-bottom: 1rem; }
.meta-field label {
  display: flex; align-items: center; gap: 0.3rem;
  font-size: 0.8rem; color: #6b7280; margin-bottom: 0.25rem;
}
.meta-field select { padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.88rem; font-family: inherit; transition: border-color 0.2s; }
.meta-field select:focus { outline: none; border-color: #1a4731; }
.loading-state {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 3rem; color: #6b7280;
}
.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
