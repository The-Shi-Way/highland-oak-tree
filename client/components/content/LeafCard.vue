<template>
  <article class="leaf-card" :class="{ 'leaf-card--seed': leaf.leafType === 'seed' }">
    <NuxtLink :to="`/${leaf.leafType}/${leaf.slug}`" class="leaf-card__link">
      <img
        v-if="leaf.featuredImage && leaf.leafType !== 'seed'"
        :src="leaf.featuredImage"
        :alt="leaf.title"
        class="leaf-card__image"
        loading="lazy"
      />
      <div class="leaf-card__body">
        <div class="leaf-card__meta">
          <LeafTypeBadge :leaf-type="leaf.leafType" />
          <span class="leaf-card__growth">{{ leaf.growth }}</span>
        </div>
        <h3 class="leaf-card__title">{{ leaf.title }}</h3>
        <p v-if="leaf.excerpt" class="leaf-card__excerpt">{{ leaf.excerpt }}</p>
        <div class="leaf-card__footer">
          <time v-if="leaf.publishedAt" :datetime="leaf.publishedAt" class="leaf-card__date">
            {{ formatDate(leaf.publishedAt) }}
          </time>
          <div v-if="leaf.vines.length" class="leaf-card__vines">
            <VineTag v-for="vine in leaf.vines.slice(0, 3)" :key="vine" :vine="vine" />
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
interface ILeafCard {
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  leafType: 'prose' | 'blossom' | 'fruit' | 'seed';
  growth: string;
  vines: string[];
  publishedAt: string | null;
}

defineProps<{ leaf: ILeafCard }>();

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<style scoped>
.leaf-card {
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.2s;
}
.leaf-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.leaf-card--seed {
  border-left: 3px solid #8d6e63;
}
.leaf-card__link {
  text-decoration: none;
  color: inherit;
  display: block;
}
.leaf-card__image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.leaf-card__body {
  padding: 1rem;
}
.leaf-card__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.leaf-card__growth {
  font-size: 0.72rem;
  color: var(--color-muted, #8a9199);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.leaf-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.4rem;
  color: var(--color-text, #2c2c2c);
  line-height: 1.3;
}
.leaf-card__excerpt {
  font-size: 0.88rem;
  color: var(--color-muted, #8a9199);
  margin: 0 0 0.6rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.leaf-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.leaf-card__date {
  font-size: 0.75rem;
  color: var(--color-muted, #8a9199);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.leaf-card__vines {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
</style>
