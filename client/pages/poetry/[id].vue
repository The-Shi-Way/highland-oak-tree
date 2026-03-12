<template>
  <div class="poem-view" :class="data ? `theme-${data.theme}` : ''">
    <div v-if="isLoading" class="loading-state">Loading poem...</div>
    <div v-else-if="isError" class="error-state">
      <h2>Poem not found</h2>
      <NuxtLink to="/poetry">← Back to poetry</NuxtLink>
    </div>
    <article v-else-if="data" class="poem-article">
      <header class="poem-header">
        <NuxtLink to="/poetry" class="back-link">← Poetry</NuxtLink>
        <h1>{{ data.title }}</h1>
        <time v-if="data.publishedAt" :datetime="data.publishedAt">
          {{ formatDate(data.publishedAt) }}
        </time>
      </header>

      <div class="poem-body" v-html="renderPoemBody(data.body)" />
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePoemById } from '~/composables/usePoems';

const route = useRoute();
const poemId = computed(() => route.params.id as string);

const { data, isLoading, isError } = usePoemById(poemId);

useHead({
  title: computed(() => data.value ? `${data.value.title} | Poetry | The Highland Oak Tree` : 'Loading...'),
  meta: computed(() => {
    if (!data.value) return [];
    return [
      { property: 'og:title', content: data.value.title },
      { property: 'og:type', content: 'article' },
    ];
  }),
});

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string }>;
}

function renderPoemBody(body: Record<string, unknown>): string {
  if (!body || !body.content) return '';
  const nodes = body.content as TipTapNode[];
  return nodes.map((node) => {
    if (node.type === 'paragraph') {
      const text = node.content
        ? node.content.map((c) => {
            let t = escapeHtml(c.text ?? '');
            if (c.marks) {
              for (const m of c.marks) {
                if (m.type === 'italic') t = `<em>${t}</em>`;
                if (m.type === 'bold') t = `<strong>${t}</strong>`;
              }
            }
            return t;
          }).join('')
        : '';
      return text ? `<p class="poem-line">${text}</p>` : '<p class="poem-break">&nbsp;</p>';
    }
    return '';
  }).join('');
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
.poem-view {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border-radius: 12px;
  transition: background 0.3s;
}

.poem-article {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.poem-header {
  margin-bottom: 3rem;
}

.back-link {
  font-size: 0.85rem;
  text-decoration: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 1;
}

.poem-header h1 {
  font-size: 2.2rem;
  margin: 1rem 0 0.5rem;
  font-style: italic;
  line-height: 1.3;
}

.poem-header time {
  font-size: 0.85rem;
  opacity: 0.6;
}

.poem-body {
  font-size: 1.15rem;
  line-height: 2;
  letter-spacing: 0.01em;
}

.poem-body :deep(.poem-line) {
  margin: 0 0 0.25rem;
}

.poem-body :deep(.poem-break) {
  margin: 0 0 1.5rem;
}

/* Theme color overrides */
.theme-classic {
  background: linear-gradient(180deg, #faf5ef, #f5ebe0);
  color: #3d2b1f;
}
.theme-classic .back-link { color: #3d2b1f; }

.theme-modern {
  background: linear-gradient(180deg, #1a202c, #2d3748);
  color: #e2e8f0;
}
.theme-modern .back-link { color: #a0aec0; }

.theme-nature {
  background: linear-gradient(180deg, #f0fff4, #e6ffed);
  color: #1a4731;
}
.theme-nature .back-link { color: #276749; }

.theme-dark {
  background: linear-gradient(180deg, #0d1117, #161b22);
  color: #8b949e;
}
.theme-dark .back-link { color: #58a6ff; }
.theme-dark h1 { color: #c9d1d9; }

.theme-romantic {
  background: linear-gradient(180deg, #fff5f5, #ffe4e6);
  color: #742a2a;
}
.theme-romantic .back-link { color: #9b2c2c; }

.theme-minimal {
  background: #ffffff;
  color: #2d3748;
}
.theme-minimal .back-link { color: #4a5568; }

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem;
  color: #718096;
}

.error-state a {
  color: #1a4731;
  text-decoration: none;
}
</style>
