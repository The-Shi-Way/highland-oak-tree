<template>
  <div class="leaf-editor">
    <div v-if="loading" class="loading-state">
      <Loader2 :size="20" class="spin-icon" />
      Loading leaf...
    </div>
    <template v-else-if="leaf">
      <div class="editor-header">
        <input
          v-model="leaf.title"
          class="title-input"
          placeholder="Leaf title"
          @blur="handleSave"
        />
        <div class="editor-actions">
          <span class="status-badge" :class="leaf.status">{{ leaf.status }}</span>
          <button class="btn-secondary" :disabled="saving" @click="handleSave">
            <Save :size="14" />
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <button v-if="leaf.status === 'draft'" class="btn-primary" @click="handlePublish">
            <Send :size="14" /> Publish
          </button>
          <button v-if="leaf.status === 'published'" class="btn-secondary" @click="handleUnpublish">
            <EyeOff :size="14" /> Unpublish
          </button>
          <button class="btn-danger" @click="handleDelete">
            <Trash2 :size="14" /> Delete
          </button>
        </div>
      </div>

      <div class="editor-meta">
        <div class="meta-field">
          <label for="leafType">Type</label>
          <select id="leafType" v-model="leaf.leafType" @change="handleSave">
            <option value="prose">Prose</option>
            <option value="blossom">Blossom</option>
            <option value="fruit">Fruit</option>
            <option value="seed">Seed</option>
          </select>
        </div>
        <div class="meta-field">
          <label for="growth">Growth Stage</label>
          <select id="growth" v-model="leaf.growth" @change="handleSave">
            <option value="seedling">Seedling</option>
            <option value="budding">Budding</option>
            <option value="mature">Mature</option>
            <option value="evergreen">Evergreen</option>
          </select>
        </div>
        <div class="meta-field">
          <label for="excerpt">Excerpt</label>
          <textarea id="excerpt" v-model="leaf.excerpt" rows="2" placeholder="Brief description…" @blur="handleSave" />
        </div>
        <div class="meta-field">
          <label for="vines">Vines (comma-separated)</label>
          <input id="vines" v-model="vinesInput" placeholder="nature, philosophy, code" @blur="handleSave" />
        </div>
      </div>

      <TipTapEditor v-model="leaf.body" placeholder="Write your leaf…" />

      <AiSuggestionPanel
        :content="plainTextContent"
        :content-type="leaf.leafType"
        @accept="handleAcceptSuggestion"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Save, Send, EyeOff, Trash2, Loader2 } from 'lucide-vue-next';
import {
  fetchAdminLeaf,
  updateLeaf,
  publishLeaf,
  unpublishLeaf,
  deleteLeaf,
} from '~/composables/useAdminLeaves';
import TipTapEditor from '~/components/content/TipTapEditor.vue';
import AiSuggestionPanel from '~/components/content/AiSuggestionPanel.vue';
import type { IAiSuggestion } from '~/composables/useAi';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const leafId = route.params.id as string;

interface IEditableLeaf {
  title: string;
  body: Record<string, unknown>;
  status: string;
  leafType: string;
  growth: string;
  excerpt: string;
  vines: string[];
  featuredImage: string | null;
}

const leaf = ref<IEditableLeaf | null>(null);
const vinesInput = ref('');
const loading = ref(true);
const saving = ref(false);

function extractText(node: Record<string, unknown>): string {
  if (node.text && typeof node.text === 'string') return node.text;
  if (Array.isArray(node.content)) {
    return (node.content as Record<string, unknown>[])
      .map(extractText)
      .join(node.type === 'paragraph' ? '\n' : ' ');
  }
  return '';
}

const plainTextContent = computed(() => {
  if (!leaf.value?.body) return '';
  return extractText(leaf.value.body as Record<string, unknown>).trim();
});

function handleAcceptSuggestion(suggestion: IAiSuggestion): void {
  if (!leaf.value?.body) return;
  const json = JSON.stringify(leaf.value.body);
  const updated = json.replace(suggestion.original, suggestion.suggested);
  leaf.value.body = JSON.parse(updated) as Record<string, unknown>;
}

onMounted(async () => {
  try {
    const data = await fetchAdminLeaf(leafId);
    leaf.value = {
      title: data.title,
      body: data.body,
      status: data.status,
      leafType: data.leafType,
      growth: data.growth,
      excerpt: data.excerpt ?? '',
      vines: data.vines,
      featuredImage: data.featuredImage,
    };
    vinesInput.value = data.vines.join(', ');
  } catch {
    navigateTo('/admin/leaves');
  } finally {
    loading.value = false;
  }
});

async function handleSave(): Promise<void> {
  if (!leaf.value || saving.value) return;
  saving.value = true;
  try {
    const vines = vinesInput.value.split(',').map((v) => v.trim()).filter(Boolean);
    await updateLeaf(leafId, {
      title: leaf.value.title,
      body: leaf.value.body,
      leafType: leaf.value.leafType,
      growth: leaf.value.growth,
      excerpt: leaf.value.excerpt || undefined,
      vines,
    });
    leaf.value.vines = vines;
  } finally {
    saving.value = false;
  }
}

async function handlePublish(): Promise<void> {
  await handleSave();
  await publishLeaf(leafId);
  if (leaf.value) leaf.value.status = 'published';
}

async function handleUnpublish(): Promise<void> {
  await unpublishLeaf(leafId);
  if (leaf.value) leaf.value.status = 'draft';
}

async function handleDelete(): Promise<void> {
  if (!window.confirm('Are you sure you want to delete this leaf?')) return;
  await deleteLeaf(leafId);
  navigateTo('/admin/leaves');
}
</script>

<style scoped>
.leaf-editor { max-width: 900px; }
.editor-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.title-input {
  flex: 1;
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.5rem 0;
  font-family: 'Georgia', serif;
  color: #1a202c;
  min-width: 200px;
}
.title-input:focus { outline: none; border-bottom-color: #1a4731; }
.editor-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.editor-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
.meta-field label {
  display: block;
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 0.25rem;
}
.meta-field textarea,
.meta-field input,
.meta-field select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
}
.meta-field textarea:focus,
.meta-field input:focus,
.meta-field select:focus { outline: none; border-color: #1a4731; }
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.9rem;
  background: linear-gradient(135deg, #1a4731, #22543d);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 500;
}
.btn-primary:hover { background: linear-gradient(135deg, #22543d, #276749); }
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.9rem;
  background: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.84rem;
}
.btn-secondary:hover { background: #f9fafb; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.9rem;
  background: white;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.84rem;
}
.btn-danger:hover { background: #fef2f2; }
.status-badge {
  font-size: 0.68rem;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  text-transform: uppercase;
  font-weight: 500;
}
.status-badge.draft { background: #fef9c3; color: #854d0e; }
.status-badge.published { background: #dcfce7; color: #166534; }
.status-badge.archived { background: #f1f5f9; color: #475569; }
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: #6b7280;
}
.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
