<template>
  <div class="poem-editor">
    <div v-if="loading" class="loading-state">Loading poem...</div>
    <template v-else-if="poem">
      <div class="editor-header">
        <input v-model="poem.title" class="title-input" placeholder="Poem title" @blur="handleSave" />
        <div class="editor-actions">
          <span class="status-badge" :class="poem.status">{{ poem.status }}</span>
          <button class="btn-secondary" @click="handleSave" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <button v-if="poem.status === 'draft'" class="btn-primary" @click="handlePublish">Publish</button>
          <button class="btn-danger" @click="handleDelete">Delete</button>
        </div>
      </div>

      <div class="editor-meta">
        <div class="meta-field">
          <label for="theme">Theme</label>
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
.title-input { flex: 1; font-size: 1.5rem; font-weight: 600; border: none; border-bottom: 2px solid transparent; padding: 0.5rem 0; font-family: 'Georgia', serif; color: #1a202c; font-style: italic; min-width: 200px; }
.title-input:focus { outline: none; border-bottom-color: #1a4731; }
.editor-actions { display: flex; align-items: center; gap: 0.5rem; }
.btn-primary { padding: 0.45rem 0.9rem; background: #1a4731; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.btn-primary:hover { background: #22543d; }
.btn-secondary { padding: 0.45rem 0.9rem; background: white; color: #4a5568; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.btn-secondary:hover { background: #f7fafc; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger { padding: 0.45rem 0.9rem; background: white; color: #e53e3e; border: 1px solid #fed7d7; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.btn-danger:hover { background: #fff5f5; }
.status-badge { font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 999px; text-transform: uppercase; }
.status-badge.draft { background: #fefcbf; color: #744210; }
.status-badge.published { background: #c6f6d5; color: #22543d; }
.editor-meta { margin-bottom: 1rem; }
.meta-field label { display: block; font-size: 0.8rem; color: #718096; margin-bottom: 0.25rem; }
.meta-field select { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; font-family: inherit; }
.meta-field select:focus { outline: none; border-color: #1a4731; }
.loading-state { text-align: center; padding: 3rem; color: #718096; }
</style>
