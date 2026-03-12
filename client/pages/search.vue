<template>
  <div class="search-page">
    <header class="search-header">
      <h1>Search</h1>
      <div class="search-input-wrapper">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search posts and poems..."
          class="search-input"
          aria-label="Search"
          @input="onInput"
        />
      </div>
    </header>

    <section class="search-results" aria-label="Search results">
      <div v-if="debouncedQuery.length < 2 && searchQuery.length > 0" class="hint-state">
        Type at least 2 characters to search.
      </div>

      <div v-else-if="isLoading" class="loading-state">Searching...</div>

      <div v-else-if="data && data.results.length === 0" class="empty-state">
        <p>No results found for "{{ data.query }}".</p>
        <p class="suggestion">Try different keywords or check your spelling.</p>
      </div>

      <template v-else-if="data && data.results.length > 0">
        <p class="result-count">{{ data.total }} result{{ data.total !== 1 ? 's' : '' }} for "{{ data.query }}"</p>
        <article
          v-for="(item, idx) in data.results"
          :key="idx"
          class="result-card"
        >
          <span class="result-type">{{ item.contentType }}</span>
          <h2>
            <NuxtLink :to="resultLink(item)">{{ item.title }}</NuxtLink>
          </h2>
          <p class="result-excerpt" v-html="item.excerpt" />
          <time :datetime="item.publishedAt">{{ formatDate(item.publishedAt) }}</time>
        </article>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSearch, type ISearchResultItem } from '~/composables/useSearch';

useHead({ title: 'Search | The Highland Oak Tree' });

const searchQuery = ref('');
const debouncedQuery = ref('');
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function onInput(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = searchQuery.value.trim();
  }, 300);
}

const { data, isLoading } = useSearch(debouncedQuery);

function resultLink(item: ISearchResultItem): string {
  return item.contentType === 'post' ? `/posts/${item.slug}` : `/poetry/${item.slug}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<style scoped>
.search-page {
  max-width: 800px;
  margin: 0 auto;
}

.search-header {
  padding: 2rem 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.search-header h1 {
  font-size: 2rem;
  color: #1a4731;
  margin: 0 0 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #1a4731;
}

.result-count {
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.result-card {
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 1.25rem;
  margin-bottom: 1.25rem;
}

.result-type {
  display: inline-block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: #edf2f7;
  color: #4a5568;
}

.result-card h2 {
  font-size: 1.2rem;
  margin: 0.4rem 0;
}

.result-card h2 a {
  color: #2d3748;
  text-decoration: none;
}

.result-card h2 a:hover {
  color: #1a4731;
}

.result-excerpt {
  color: #4a5568;
  line-height: 1.6;
  font-size: 0.95rem;
}

.result-excerpt :deep(mark) {
  background: #fefcbf;
  padding: 0 2px;
  border-radius: 2px;
}

.result-card time {
  font-size: 0.8rem;
  color: #a0aec0;
}

.loading-state,
.empty-state,
.hint-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.suggestion {
  font-size: 0.9rem;
  color: #a0aec0;
}
</style>
