<template>
  <div class="post-page">
    <div v-if="isLoading" class="loading-state">Loading post...</div>
    <div v-else-if="isError" class="error-state">
      <h2>Post not found</h2>
      <p>The post you're looking for doesn't exist or has been unpublished.</p>
      <NuxtLink to="/">← Back to blog</NuxtLink>
    </div>
    <article v-else-if="data" class="post-article">
      <header class="post-header">
        <div class="post-meta">
          <time v-if="data.publishedAt" :datetime="data.publishedAt">
            {{ formatDate(data.publishedAt) }}
          </time>
        </div>
        <h1>{{ data.title }}</h1>
        <div v-if="data.tags.length" class="post-tags">
          <NuxtLink
            v-for="tag in data.tags"
            :key="tag"
            :to="`/?tag=${tag}`"
            class="tag-chip"
          >
            {{ tag }}
          </NuxtLink>
        </div>
      </header>

      <img
        v-if="data.coverImageUrl"
        :src="data.coverImageUrl"
        :alt="data.title"
        class="post-cover"
      />

      <div class="post-body" v-html="renderBody(data.body)" />

      <footer class="post-footer">
        <NuxtLink to="/">← Back to blog</NuxtLink>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePostBySlug } from '~/composables/usePosts';

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data, isLoading, isError } = usePostBySlug(slug);

useHead({
  title: computed(() => data.value ? `${data.value.title} | The Highland Oak Tree` : 'Loading...'),
  meta: computed(() => {
    if (!data.value) return [];
    return [
      { property: 'og:title', content: data.value.title },
      { property: 'og:description', content: data.value.excerpt ?? '' },
      { property: 'og:type', content: 'article' },
      { property: 'og:image', content: data.value.coverImageUrl ?? '' },
      { name: 'description', content: data.value.excerpt ?? '' },
    ];
  }),
  link: computed(() => {
    if (!data.value) return [];
    const config = useRuntimeConfig();
    return [
      { rel: 'canonical', href: `${config.public.apiBase}/../posts/${data.value.slug}` },
    ];
  }),
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function renderBody(body: Record<string, unknown>): string {
  // Simple TipTap JSON to HTML renderer for common node types
  if (!body || !body.content) return '';
  return renderNodes(body.content as TipTapNode[]);
}

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

function renderNodes(nodes: TipTapNode[]): string {
  return nodes.map(renderNode).join('');
}

function renderNode(node: TipTapNode): string {
  switch (node.type) {
    case 'paragraph':
      return `<p>${node.content ? renderNodes(node.content) : ''}</p>`;
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2;
      return `<h${level}>${node.content ? renderNodes(node.content) : ''}</h${level}>`;
    }
    case 'text': {
      let text = escapeHtml(node.text ?? '');
      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case 'bold': text = `<strong>${text}</strong>`; break;
            case 'italic': text = `<em>${text}</em>`; break;
            case 'code': text = `<code>${text}</code>`; break;
            case 'link': text = `<a href="${escapeHtml(String(mark.attrs?.href ?? ''))}" target="_blank" rel="noopener">${text}</a>`; break;
          }
        }
      }
      return text;
    }
    case 'bulletList':
      return `<ul>${node.content ? renderNodes(node.content) : ''}</ul>`;
    case 'orderedList':
      return `<ol>${node.content ? renderNodes(node.content) : ''}</ol>`;
    case 'listItem':
      return `<li>${node.content ? renderNodes(node.content) : ''}</li>`;
    case 'codeBlock':
      return `<pre><code>${node.content ? renderNodes(node.content) : ''}</code></pre>`;
    case 'blockquote':
      return `<blockquote>${node.content ? renderNodes(node.content) : ''}</blockquote>`;
    case 'image':
      return `<img src="${escapeHtml(String(node.attrs?.src ?? ''))}" alt="${escapeHtml(String(node.attrs?.alt ?? ''))}" />`;
    case 'horizontalRule':
      return '<hr />';
    case 'hardBreak':
      return '<br />';
    default:
      return node.content ? renderNodes(node.content) : '';
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
</script>

<style scoped>
.post-page {
  max-width: 800px;
  margin: 0 auto;
}

.post-header {
  margin-bottom: 2rem;
}

.post-header h1 {
  font-size: 2.2rem;
  color: #1a202c;
  line-height: 1.3;
  margin: 0.5rem 0;
}

.post-meta {
  color: #718096;
  font-size: 0.9rem;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.tag-chip {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border: 1px solid #cbd5e0;
  border-radius: 999px;
  font-size: 0.8rem;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.2s;
}

.tag-chip:hover {
  background: #1a4731;
  color: white;
  border-color: #1a4731;
}

.post-cover {
  width: 100%;
  max-height: 450px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.post-body {
  line-height: 1.8;
  font-size: 1.05rem;
  color: #2d3748;
}

.post-body :deep(h2) { font-size: 1.6rem; margin: 2rem 0 1rem; color: #1a202c; }
.post-body :deep(h3) { font-size: 1.3rem; margin: 1.5rem 0 0.75rem; color: #1a202c; }
.post-body :deep(p) { margin: 0 0 1.25rem; }
.post-body :deep(blockquote) {
  border-left: 3px solid #1a4731;
  padding-left: 1rem;
  color: #4a5568;
  font-style: italic;
  margin: 1.5rem 0;
}
.post-body :deep(pre) {
  background: #1a202c;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
}
.post-body :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
}
.post-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}
.post-body :deep(a) {
  color: #1a4731;
  text-decoration: underline;
}

.post-footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.post-footer a {
  color: #1a4731;
  text-decoration: none;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 0;
  color: #718096;
}

.error-state h2 {
  color: #2d3748;
}

.error-state a {
  color: #1a4731;
  text-decoration: none;
}
</style>
