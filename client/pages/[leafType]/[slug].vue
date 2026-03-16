<template>
  <article v-if="leaf" class="leaf-detail" :class="`leaf-detail--${leaf.leafType}`">
    <header class="leaf-header">
      <LeafTypeBadge :leaf-type="leaf.leafType" />
      <span class="leaf-season">{{ leaf.season }}</span>
      <span class="leaf-growth">{{ leaf.growth }}</span>
    </header>

    <h1 class="leaf-title">{{ leaf.title }}</h1>

    <div v-if="leaf.featuredImage && leaf.leafType !== 'seed'" class="leaf-hero">
      <img :src="leaf.featuredImage" :alt="leaf.title" loading="lazy" />
    </div>

    <div class="leaf-meta-row">
      <time v-if="leaf.publishedAt" :datetime="leaf.publishedAt" class="leaf-date">
        {{ formatDate(leaf.publishedAt) }}
      </time>
      <span v-if="readTime" class="leaf-readtime">{{ readTime }}</span>
    </div>

    <div class="leaf-body" v-if="bodyHtml" v-html="bodyHtml" />
    <div class="leaf-body" v-else-if="leaf.excerpt">
      <p>{{ leaf.excerpt }}</p>
    </div>

    <div v-if="leaf.vines.length" class="leaf-vines">
      <VineTag v-for="vine in leaf.vines" :key="vine" :vine="vine" />
    </div>

    <section v-if="related?.length" class="leaf-related">
      <h2>Related leaves on this vine</h2>
      <div class="related-grid">
        <LeafCard v-for="r in related" :key="r.id" :leaf="r" />
      </div>
    </section>
  </article>
  <div v-else-if="isLoading" class="leaf-loading">Loading...</div>
  <div v-else class="leaf-not-found">Leaf not found.</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useLeafBySlug, useRelatedLeaves } from '~/composables/useLeaf';
import { estimateReadingTime, extractTextFromTiptap } from '~/composables/useReadingTime';

const route = useRoute();
const leafType = computed(() => route.params.leafType as string);
const slug = computed(() => route.params.slug as string);

const { data: leaf, isLoading } = useLeafBySlug(leafType, slug);
const leafId = computed(() => leaf.value?.id);
const { data: related } = useRelatedLeaves(leafId);

const tiptapExtensions = [StarterKit, Link, Image];

const bodyHtml = computed((): string => {
  if (!leaf.value?.body || typeof leaf.value.body !== 'object') return '';
  try {
    return generateHTML(leaf.value.body as Record<string, unknown>, tiptapExtensions);
  } catch {
    return '';
  }
});

const readTime = computed((): string | null => {
  if (!leaf.value?.body) return null;
  const text = extractTextFromTiptap(leaf.value.body);
  if (text.length < 100) return null;
  return estimateReadingTime(text);
});

useHead({
  title: computed(() => leaf.value ? `${leaf.value.title} — The Highland Oak Tree` : 'Loading...'),
  meta: computed(() => leaf.value ? [
    { property: 'og:title', content: leaf.value.title },
    { property: 'og:description', content: leaf.value.excerpt ?? '' },
    { property: 'og:type', content: 'article' },
    ...(leaf.value.featuredImage ? [{ property: 'og:image', content: leaf.value.featuredImage }] : []),
  ] : []),
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}
</script>

<style scoped>
.leaf-detail { max-width: 780px; margin: 0 auto; }
.leaf-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}
.leaf-season, .leaf-growth {
  font-size: var(--text-xs);
  color: var(--color-muted, #8a9199);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.leaf-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: var(--leading-tight);
  margin: 0 0 1rem;
  color: var(--color-text, #2c2c2c);
  letter-spacing: -0.01em;
}
.leaf-detail--blossom {
  max-width: 560px;
  padding: 2rem 0;
}
.leaf-detail--blossom .leaf-header {
  justify-content: center;
}
.leaf-detail--blossom .leaf-title {
  font-family: 'Georgia', 'Garamond', 'Times New Roman', serif;
  text-align: center;
  font-style: italic;
  font-size: var(--text-2xl, 1.875rem);
  font-weight: 400;
  letter-spacing: 0.02em;
  margin-bottom: 0.25rem;
}
.leaf-detail--blossom .leaf-date {
  text-align: center;
  margin-bottom: 1.5rem;
}
.leaf-detail--blossom .leaf-date::after {
  content: '~ ~ ~';
  display: block;
  text-align: center;
  color: #c4b99a;
  font-size: 0.75rem;
  margin-top: 1rem;
  letter-spacing: 0.4em;
}
.leaf-detail--blossom .leaf-body {
  font-family: 'Georgia', 'Garamond', 'Times New Roman', serif;
  text-align: left;
  font-style: normal;
  font-size: 1.05rem;
  line-height: 1.5;
  max-width: 38ch;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: var(--space-xl);
  padding: 0;
  position: relative;
}
/* Lines within a stanza: no extra space. Shift+Enter = <br> = just a line break */
.leaf-detail--blossom .leaf-body :deep(p) {
  margin: 0 0 1.4em;
  text-indent: 0;
}
.leaf-detail--blossom .leaf-body :deep(p:last-child) {
  margin-bottom: 0;
}
/* Emphasis — Dickinson's dashes */
.leaf-detail--blossom .leaf-body :deep(em) {
  font-style: italic;
}
/* Stanza divider */
.leaf-detail--blossom .leaf-body :deep(hr) {
  border: none;
  text-align: center;
  margin: 1.2em 0;
  height: auto;
}
.leaf-detail--blossom .leaf-body :deep(hr)::after {
  content: '·';
  color: #c4b99a;
  font-size: 1rem;
}
.leaf-detail--blossom .leaf-vines {
  justify-content: center;
}
.leaf-detail--blossom .leaf-hero {
  border-radius: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
  opacity: 0.9;
}
.leaf-detail--seed { max-width: 600px; }
.leaf-hero { margin-bottom: 1.5rem; border-radius: 12px; overflow: hidden; }
.leaf-hero img { width: 100%; display: block; }
.leaf-date {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-muted, #8a9199);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.leaf-meta-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}
.leaf-readtime {
  font-size: var(--text-sm);
  color: var(--color-muted, #8a9199);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.leaf-readtime::before {
  content: '·';
  margin-right: 0.6rem;
}
.leaf-body {
  max-width: 65ch;
  font-family: var(--font-body);
  font-size: var(--text-md);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-xl);
}
.leaf-body :deep(blockquote) {
  border-left: 3px solid var(--color-primary);
  padding-left: var(--space-lg);
  font-family: var(--font-accent);
  font-style: italic;
  color: var(--color-muted);
  margin: var(--space-xl) 0;
  font-size: 1.1em;
}
.leaf-body :deep(code) {
  background: var(--color-tertiary);
  padding: 0.1em 0.4em;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}
.leaf-vines {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}
.leaf-related h2 {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  margin-bottom: 1rem;
  color: var(--color-text, #2c2c2c);
}
.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
.leaf-loading, .leaf-not-found {
  text-align: center;
  padding: 4rem 0;
  color: var(--color-muted, #8a9199);
}

@media (max-width: 768px) {
  .leaf-title {
    font-size: var(--text-2xl);
  }
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>
