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

    <time v-if="leaf.publishedAt" :datetime="leaf.publishedAt" class="leaf-date">
      {{ formatDate(leaf.publishedAt) }}
    </time>

    <div class="leaf-body">
      <!-- TipTap JSON body would be rendered here via a renderer component -->
      <p v-if="leaf.excerpt">{{ leaf.excerpt }}</p>
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
import { useLeafBySlug, useRelatedLeaves } from '~/composables/useLeaf';

const route = useRoute();
const leafType = computed(() => route.params.leafType as string);
const slug = computed(() => route.params.slug as string);

const { data: leaf, isLoading } = useLeafBySlug(leafType, slug);
const leafId = computed(() => leaf.value?.id);
const { data: related } = useRelatedLeaves(leafId);

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
  font-size: 0.78rem;
  color: var(--color-muted, #8a9199);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.leaf-title {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 1rem;
  color: var(--color-text, #2c2c2c);
}
.leaf-detail--blossom .leaf-title {
  text-align: center;
  font-style: italic;
  font-family: 'Georgia', serif;
}
.leaf-detail--blossom .leaf-body {
  text-align: center;
  font-style: italic;
  font-family: 'Georgia', serif;
  line-height: 2;
  font-size: 1.1rem;
}
.leaf-detail--seed { max-width: 600px; }
.leaf-hero { margin-bottom: 1.5rem; border-radius: 12px; overflow: hidden; }
.leaf-hero img { width: 100%; display: block; }
.leaf-date {
  display: block;
  font-size: 0.82rem;
  color: var(--color-muted, #8a9199);
  margin-bottom: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.leaf-body { line-height: 1.75; margin-bottom: 2rem; }
.leaf-vines {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}
.leaf-related h2 {
  font-size: 1.2rem;
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
</style>
