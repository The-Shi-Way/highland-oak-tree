<template>
  <div class="home-page">
    <section class="hero">
      <h1>The Highland Oak Tree</h1>
      <p class="tagline">Thoughts on AI engineering, consulting, and the craft of building things that matter.</p>
    </section>

    <div class="content-layout">
      <section class="post-list" aria-label="Blog posts">
        <div v-if="isLoading" class="loading-state">Loading posts...</div>
        <div v-else-if="isError" class="error-state">Unable to load posts. Please try again later.</div>
        <template v-else-if="data">
          <article
            v-for="post in data.data"
            :key="post.id"
            class="post-card"
          >
            <img
              v-if="post.coverImageUrl"
              :src="post.coverImageUrl"
              :alt="post.title"
              class="post-cover"
              loading="lazy"
              :srcset="post.coverImageUrl"
            />
            <div class="post-content">
              <div class="post-meta">
                <time v-if="post.publishedAt" :datetime="post.publishedAt">
                  {{ formatDate(post.publishedAt) }}
                </time>
                <span v-if="post.tags.length" class="post-tags">
                  <button
                    v-for="t in post.tags"
                    :key="t"
                    class="tag-chip"
                    :class="{ active: selectedTag === t }"
                    @click="toggleTag(t)"
                  >
                    {{ t }}
                  </button>
                </span>
              </div>
              <h2>
                <NuxtLink :to="`/posts/${post.slug}`">{{ post.title }}</NuxtLink>
              </h2>
              <p v-if="post.excerpt" class="post-excerpt">{{ post.excerpt }}</p>
            </div>
          </article>

          <div v-if="data.data.length === 0" class="empty-state">
            <p>No posts found{{ selectedTag ? ` for tag "${selectedTag}"` : '' }}.</p>
          </div>

          <nav v-if="data.total > data.limit" class="pagination" aria-label="Pagination">
            <button :disabled="currentPage <= 1" @click="currentPage--">Previous</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button :disabled="currentPage >= totalPages" @click="currentPage++">Next</button>
          </nav>
        </template>
      </section>

      <aside class="sidebar" aria-label="Tag filter">
        <h3>Filter by Tag</h3>
        <button
          class="tag-chip"
          :class="{ active: !selectedTag }"
          @click="selectedTag = undefined"
        >
          All
        </button>
        <button
          v-if="selectedTag"
          class="tag-chip active"
          @click="selectedTag = undefined"
        >
          {{ selectedTag }} ✕
        </button>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePostList } from '~/composables/usePosts';

const currentPage = ref(1);
const selectedTag = ref<string | undefined>(undefined);

const { data, isLoading, isError } = usePostList(currentPage, selectedTag);

const totalPages = computed(() => {
  if (!data.value) return 1;
  return Math.ceil(data.value.total / data.value.limit);
});

function toggleTag(tag: string): void {
  selectedTag.value = selectedTag.value === tag ? undefined : tag;
  currentPage.value = 1;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 3rem 0 2rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 2.5rem;
  color: #1a4731;
  margin: 0 0 0.5rem;
}

.tagline {
  color: #718096;
  font-size: 1.1rem;
  font-style: italic;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 2rem;
}

.post-card {
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.post-cover {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.post-card h2 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
}

.post-card h2 a {
  color: #2d3748;
  text-decoration: none;
}

.post-card h2 a:hover {
  color: #1a4731;
}

.post-excerpt {
  color: #4a5568;
  line-height: 1.6;
}

.tag-chip {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border: 1px solid #cbd5e0;
  border-radius: 999px;
  font-size: 0.8rem;
  background: transparent;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-chip:hover,
.tag-chip.active {
  background: #1a4731;
  color: white;
  border-color: #1a4731;
}

.post-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.sidebar h3 {
  font-size: 1rem;
  margin: 0 0 0.75rem;
  color: #2d3748;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0;
}

.pagination button {
  padding: 0.4rem 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

@media (max-width: 768px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .hero h1 {
    font-size: 1.8rem;
  }
}
</style>
