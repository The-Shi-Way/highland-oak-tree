<template>
  <div class="home-page">
    <section class="hero">
      <TreePine :size="36" :stroke-width="1.4" class="hero-icon" />
      <h1>The Highland Oak Tree</h1>
      <p class="tagline">Thoughts on AI engineering, consulting, and the craft of building things that matter.</p>
    </section>

    <div class="content-layout">
      <section class="post-list" aria-label="Blog posts">
        <div v-if="isLoading" class="loading-state">
          <Loader2 :size="24" class="spin-icon" />
          <span>Loading posts...</span>
        </div>
        <div v-else-if="isError" class="error-state">
          <AlertCircle :size="24" />
          <span>Unable to load posts. Please try again later.</span>
        </div>
        <template v-else-if="data">
          <article
            v-for="post in data.posts"
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
                <span class="meta-item">
                  <Calendar :size="14" />
                  <time v-if="post.publishedAt" :datetime="post.publishedAt">
                    {{ formatDate(post.publishedAt) }}
                  </time>
                </span>
                <span v-if="post.tags.length" class="post-tags">
                  <button
                    v-for="t in post.tags"
                    :key="t"
                    class="tag-chip"
                    :class="{ active: selectedTag === t }"
                    @click="toggleTag(t)"
                  >
                    <Tag :size="11" />
                    {{ t }}
                  </button>
                </span>
              </div>
              <h2>
                <NuxtLink :to="`/posts/${post.slug}`">{{ post.title }}</NuxtLink>
              </h2>
              <p v-if="post.excerpt" class="post-excerpt">{{ post.excerpt }}</p>
              <NuxtLink :to="`/posts/${post.slug}`" class="read-more">
                Read more
                <ArrowRight :size="14" />
              </NuxtLink>
            </div>
          </article>

          <div v-if="data.posts.length === 0" class="empty-state">
            <BookOpen :size="32" :stroke-width="1.2" />
            <p>No posts found{{ selectedTag ? ` for tag "${selectedTag}"` : '' }}.</p>
          </div>

          <nav v-if="data.total > data.limit" class="pagination" aria-label="Pagination">
            <button :disabled="currentPage <= 1" @click="currentPage--">
              <ChevronLeft :size="16" />
              Previous
            </button>
            <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button :disabled="currentPage >= totalPages" @click="currentPage++">
              Next
              <ChevronRight :size="16" />
            </button>
          </nav>
        </template>
      </section>

      <aside class="sidebar" aria-label="Tag filter">
        <h3>
          <Filter :size="15" />
          Filter by Tag
        </h3>
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
          {{ selectedTag }}
          <X :size="12" />
        </button>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  TreePine, Calendar, Tag, ArrowRight, BookOpen,
  ChevronLeft, ChevronRight, Filter, X, Loader2, AlertCircle,
} from 'lucide-vue-next';
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
  padding: 3.5rem 0 2.5rem;
  border-bottom: 1px solid #e8e5e0;
  margin-bottom: 2.5rem;
}

.hero-icon {
  color: #1a4731;
  opacity: 0.7;
  margin-bottom: 0.75rem;
}

.hero h1 {
  font-size: 2.6rem;
  color: #1a4731;
  margin: 0 0 0.6rem;
  letter-spacing: -0.02em;
}

.tagline {
  color: #7a8694;
  font-size: 1.1rem;
  font-style: italic;
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.5;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 2.5rem;
}

.post-card {
  padding-bottom: 1.75rem;
  margin-bottom: 1.75rem;
  border-bottom: 1px solid #edf0f3;
  transition: transform 0.15s;
}

.post-cover {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.84rem;
  color: #7a8694;
  margin-bottom: 0.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.post-card h2 {
  margin: 0 0 0.5rem;
  font-size: 1.45rem;
  line-height: 1.35;
}

.post-card h2 a {
  color: #1e293b;
  text-decoration: none;
  transition: color 0.2s;
}

.post-card h2 a:hover {
  color: #1a4731;
}

.post-excerpt {
  color: #4b5563;
  line-height: 1.7;
  margin: 0 0 0.75rem;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #1a4731;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: gap 0.2s;
}

.read-more:hover {
  gap: 0.5rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.22rem 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  font-size: 0.78rem;
  background: transparent;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.92rem;
  margin: 0 0 0.75rem;
  color: #374151;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  padding: 1.5rem 0;
}

.pagination button {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.88rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  border-color: #1a4731;
  color: #1a4731;
}

.pagination button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.85rem;
  color: #7a8694;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  padding: 3.5rem;
  color: #7a8694;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
    font-size: 1.9rem;
  }
}
</style>
