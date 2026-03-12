<template>
  <div class="post-editor">
    <div v-if="loading" class="loading-state">Loading post...</div>
    <template v-else-if="post">
      <div class="editor-header">
        <input
          v-model="post.title"
          class="title-input"
          placeholder="Post title"
          @blur="handleSave"
        />
        <div class="editor-actions">
          <span class="status-badge" :class="post.status">{{ post.status }}</span>
          <button class="btn-secondary" @click="handleSave" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Draft' }}
          </button>
          <button
            v-if="post.status === 'draft'"
            class="btn-primary"
            @click="handlePublish"
          >Publish</button>
          <button
            v-if="post.status === 'published'"
            class="btn-secondary"
            @click="handleUnpublish"
          >Unpublish</button>
          <button class="btn-danger" @click="handleDelete">Delete</button>
        </div>
      </div>

      <div class="editor-meta">
        <div class="meta-field">
          <label for="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            v-model="post.excerpt"
            rows="2"
            placeholder="Brief description for listings and SEO..."
            @blur="handleSave"
          />
        </div>
        <div class="meta-field">
          <label for="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            v-model="tagsInput"
            placeholder="ai, engineering, consulting"
            @blur="handleSave"
          />
        </div>
      </div>

      <TipTapEditor
        v-model="post.body"
        placeholder="Write your post..."
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  fetchPost,
  savePost,
  publishPost,
  unpublishPost,
  deletePost,
} from '~/composables/useAdminPosts';
import TipTapEditor from '~/components/content/TipTapEditor.vue';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const postId = route.params.id as string;

interface IEditablePost {
  title: string;
  body: Record<string, unknown>;
  status: string;
  excerpt: string;
  tags: string[];
}

const post = ref<IEditablePost | null>(null);
const tagsInput = ref('');
const loading = ref(true);
const saving = ref(false);

onMounted(async () => {
  try {
    const data = await fetchPost(postId);
    post.value = {
      title: data.title,
      body: data.body,
      status: data.status,
      excerpt: data.excerpt ?? '',
      tags: data.tags,
    };
    tagsInput.value = data.tags.join(', ');
  } catch {
    navigateTo('/admin/posts');
  } finally {
    loading.value = false;
  }
});

async function handleSave(): Promise<void> {
  if (!post.value || saving.value) return;
  saving.value = true;
  try {
    const tags = tagsInput.value.split(',').map((t) => t.trim()).filter(Boolean);
    await savePost(postId, {
      title: post.value.title,
      body: post.value.body,
      excerpt: post.value.excerpt || undefined,
      tags,
    });
    post.value.tags = tags;
  } finally {
    saving.value = false;
  }
}

async function handlePublish(): Promise<void> {
  await handleSave();
  await publishPost(postId);
  if (post.value) post.value.status = 'published';
}

async function handleUnpublish(): Promise<void> {
  await unpublishPost(postId);
  if (post.value) post.value.status = 'draft';
}

async function handleDelete(): Promise<void> {
  if (!window.confirm('Are you sure you want to delete this post?')) return;
  await deletePost(postId);
  navigateTo('/admin/posts');
}
</script>

<style scoped>
.post-editor { max-width: 900px; }

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

.title-input:focus {
  outline: none;
  border-bottom-color: #1a4731;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 0.45rem 0.9rem;
  background: #1a4731;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-primary:hover { background: #22543d; }

.btn-secondary {
  padding: 0.45rem 0.9rem;
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-secondary:hover { background: #f7fafc; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-danger {
  padding: 0.45rem 0.9rem;
  background: white;
  color: #e53e3e;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-danger:hover { background: #fff5f5; }

.status-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
}
.status-badge.draft { background: #fefcbf; color: #744210; }
.status-badge.published { background: #c6f6d5; color: #22543d; }

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
.meta-field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
}

.meta-field textarea:focus,
.meta-field input:focus {
  outline: none;
  border-color: #1a4731;
}

.loading-state { text-align: center; padding: 3rem; color: #718096; }
</style>
