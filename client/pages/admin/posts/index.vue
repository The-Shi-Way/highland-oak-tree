<template>
  <div class="admin-posts">
    <div class="page-header">
      <h1>Posts</h1>
      <button class="btn-primary" @click="handleCreate">+ New Post</button>
    </div>

    <div v-if="isLoading" class="loading-state">Loading posts...</div>
    <table v-else-if="data && data.data.length > 0" class="posts-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Published</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in data.data" :key="post.id">
          <td><NuxtLink :to="`/admin/posts/${post.id}`">{{ post.title }}</NuxtLink></td>
          <td><span class="status-badge" :class="post.status">{{ post.status }}</span></td>
          <td class="date-cell">{{ post.publishedAt ? formatDate(post.publishedAt) : '—' }}</td>
          <td>
            <NuxtLink :to="`/admin/posts/${post.id}`" class="action-link">Edit</NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty-state">No posts yet. Create your first one.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePostList } from '~/composables/usePosts';
import { createPost } from '~/composables/useAdminPosts';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Posts | Admin' });

const page = ref(1);
const { data, isLoading } = usePostList(page);

async function handleCreate(): Promise<void> {
  const post = await createPost({
    title: 'Untitled Post',
    body: { type: 'doc', content: [{ type: 'paragraph' }] },
  });
  navigateTo(`/admin/posts/${post.id}`);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 { font-size: 1.6rem; color: #1a202c; margin: 0; }

.btn-primary {
  padding: 0.5rem 1rem;
  background: #1a4731;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary:hover { background: #22543d; }

.posts-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.posts-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #718096;
  background: #f7fafc;
  border-bottom: 1px solid #edf2f7;
}

.posts-table td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid #edf2f7;
  font-size: 0.9rem;
}

.posts-table a { color: #2d3748; text-decoration: none; font-weight: 500; }
.posts-table a:hover { color: #1a4731; }

.status-badge {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}
.status-badge.draft { background: #fefcbf; color: #744210; }
.status-badge.published { background: #c6f6d5; color: #22543d; }
.status-badge.archived { background: #e2e8f0; color: #4a5568; }

.date-cell { color: #a0aec0; }
.action-link { font-size: 0.85rem; color: #1a4731; }

.loading-state, .empty-state { text-align: center; padding: 3rem; color: #718096; }
</style>
