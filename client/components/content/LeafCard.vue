<template>
  <article
    class="leaf-card hover-lift"
    :class="[`leaf-card--${leaf.leafType}`]"
  >
    <!-- Decorative botanical watermark -->
    <div class="leaf-card__watermark" aria-hidden="true">
      <!-- Prose: oak leaf -->
      <svg v-if="leaf.leafType === 'prose'" viewBox="0 0 80 80" fill="none">
        <path d="M40 8c-8 4-20 16-22 32s6 24 22 32c16-8 24-16 22-32S48 12 40 8z" fill="currentColor" opacity="0.07"/>
        <path d="M40 8v64" stroke="currentColor" opacity="0.1" stroke-width="1"/>
      </svg>
      <!-- Blossom: flower -->
      <svg v-else-if="leaf.leafType === 'blossom'" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="8" fill="currentColor" opacity="0.1"/>
        <ellipse cx="40" cy="20" rx="10" ry="14" fill="currentColor" opacity="0.06" transform="rotate(0 40 40)"/>
        <ellipse cx="40" cy="20" rx="10" ry="14" fill="currentColor" opacity="0.06" transform="rotate(72 40 40)"/>
        <ellipse cx="40" cy="20" rx="10" ry="14" fill="currentColor" opacity="0.06" transform="rotate(144 40 40)"/>
        <ellipse cx="40" cy="20" rx="10" ry="14" fill="currentColor" opacity="0.06" transform="rotate(216 40 40)"/>
        <ellipse cx="40" cy="20" rx="10" ry="14" fill="currentColor" opacity="0.06" transform="rotate(288 40 40)"/>
      </svg>
      <!-- Seed: teardrop -->
      <svg v-else-if="leaf.leafType === 'seed'" viewBox="0 0 80 80" fill="none">
        <path d="M40 10c0 0-20 20-20 40a20 20 0 0040 0c0-20-20-40-20-40z" fill="currentColor" opacity="0.07"/>
      </svg>
      <!-- Fruit: apple -->
      <svg v-else viewBox="0 0 80 80" fill="none">
        <path d="M40 16c-2-6-8-8-8-8s2 6 4 10c-12 2-20 14-20 28 0 16 12 26 24 26s24-10 24-26c0-14-8-26-20-28 2-4 4-10 4-10s-6 2-8 8z" fill="currentColor" opacity="0.07"/>
      </svg>
    </div>

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
          <span v-if="readTime" class="leaf-card__readtime">{{ readTime }}</span>
          <div v-if="leaf.vines.length" class="leaf-card__vines">
            <VineTag v-for="vine in leaf.vines.slice(0, 3)" :key="vine" :vine="vine" />
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { estimateReadingTime } from '~/composables/useReadingTime';
import type { ILeafListItem } from '~/composables/useLeaves';

const props = defineProps<{ leaf: ILeafListItem & { wordCount?: number } }>();

const readTime = computed((): string | null => {
  if (props.leaf.wordCount && props.leaf.wordCount > 50) {
    return estimateReadingTime(props.leaf.wordCount);
  }
  if (props.leaf.excerpt) {
    return estimateReadingTime(props.leaf.excerpt);
  }
  return null;
});

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
  position: relative;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 12px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.leaf-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

/* Type-specific accent colors via left border + background tint */
.leaf-card--prose {
  border-left: 3px solid #8b9e6b;
  background: linear-gradient(135deg, #fafaf7 0%, #f4f2ed 100%);
}
.leaf-card--blossom {
  border-left: 3px solid #d4869c;
  background: linear-gradient(135deg, #fef9fa 0%, #fdf0f3 100%);
}
.leaf-card--seed {
  border-left: 3px solid #8d6e63;
  background: linear-gradient(135deg, #faf8f5 0%, #f0ebe3 100%);
}
.leaf-card--fruit {
  border-left: 3px solid #6b9e6b;
  background: linear-gradient(135deg, #f7faf7 0%, #edf5ed 100%);
}

/* Botanical watermark in bottom-right corner */
.leaf-card__watermark {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 80px;
  height: 80px;
  pointer-events: none;
  z-index: 0;
}
.leaf-card--prose .leaf-card__watermark { color: #8b9e6b; }
.leaf-card--blossom .leaf-card__watermark { color: #d4869c; }
.leaf-card--seed .leaf-card__watermark { color: #8d6e63; }
.leaf-card--fruit .leaf-card__watermark { color: #6b9e6b; }

.leaf-card__link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
}
.leaf-card__image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  animation: fadeIn 0.4s ease-out both;
}
.leaf-card__body {
  padding: var(--space-lg, 1.5rem);
  display: flex;
  flex-direction: column;
  flex: 1;
}
.leaf-card__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.leaf-card__growth {
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-muted, #8a9199);
}
.leaf-card__title {
  font-family: var(--font-heading, 'Fraunces', Georgia, serif);
  font-size: var(--text-lg, 1.25rem);
  font-weight: 600;
  margin: 0 0 0.4rem;
  color: var(--color-text, #2c2c2c);
  line-height: var(--leading-tight, 1.2);
}
.leaf-card__excerpt {
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-muted, #8a9199);
  margin: 0 0 0.6rem;
  line-height: var(--leading-normal, 1.6);
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
  margin-top: auto;
}
.leaf-card__date {
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-muted, #8a9199);
}
.leaf-card__readtime {
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-muted, #8a9199);
}
.leaf-card__readtime::before {
  content: '·';
  margin-right: 0.3rem;
}
.leaf-card__vines {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

@media (prefers-reduced-motion: reduce) {
  .leaf-card__image {
    animation: none;
    opacity: 1;
  }
  .leaf-card {
    transition: none;
  }
}
</style>
