<template>
  <div class="trunk-page">
    <SeasonalHeroTree :season="currentSeason" />

    <section class="trunk-feed">
      <h2 class="feed-title">Latest Leaves</h2>

      <div v-if="data?.feed.length" class="feed-content">
        <!-- Featured first post -->
        <article v-if="page === 1 && featured" class="featured-card" :class="[`featured-card--${featured.leafType}`, { 'featured-card--no-image': !featured.featuredImage }]">
          <!-- Decorative botanical watermark -->
          <div class="featured-watermark" aria-hidden="true">
            <svg v-if="featured.leafType === 'prose'" viewBox="0 0 120 120" fill="none">
              <path d="M60 12c-12 6-30 24-33 48s9 36 33 48c24-12 36-24 33-48S72 18 60 12z" fill="currentColor" opacity="0.06"/>
              <path d="M60 12v96" stroke="currentColor" opacity="0.08" stroke-width="1"/>
            </svg>
            <svg v-else-if="featured.leafType === 'blossom'" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="12" fill="currentColor" opacity="0.08"/>
              <ellipse cx="60" cy="30" rx="15" ry="21" fill="currentColor" opacity="0.05" transform="rotate(0 60 60)"/>
              <ellipse cx="60" cy="30" rx="15" ry="21" fill="currentColor" opacity="0.05" transform="rotate(72 60 60)"/>
              <ellipse cx="60" cy="30" rx="15" ry="21" fill="currentColor" opacity="0.05" transform="rotate(144 60 60)"/>
              <ellipse cx="60" cy="30" rx="15" ry="21" fill="currentColor" opacity="0.05" transform="rotate(216 60 60)"/>
              <ellipse cx="60" cy="30" rx="15" ry="21" fill="currentColor" opacity="0.05" transform="rotate(288 60 60)"/>
            </svg>
            <svg v-else-if="featured.leafType === 'seed'" viewBox="0 0 120 120" fill="none">
              <path d="M60 15c0 0-30 30-30 60a30 30 0 0060 0c0-30-30-60-30-60z" fill="currentColor" opacity="0.06"/>
            </svg>
            <svg v-else viewBox="0 0 120 120" fill="none">
              <path d="M60 24c-3-9-12-12-12-12s3 9 6 15c-18 3-30 21-30 42 0 24 18 39 36 39s36-15 36-39c0-21-12-39-30-42 3-6 6-15 6-15s-9 3-12 12z" fill="currentColor" opacity="0.06"/>
            </svg>
          </div>
          <NuxtLink :to="`/${featured.leafType}/${featured.slug}`" class="featured-link" :class="{ 'featured-link--has-image': featured.featuredImage }">
            <img
              v-if="featured.featuredImage"
              :src="featured.featuredImage"
              :alt="featured.title"
              class="featured-image"
              loading="lazy"
            />
            <div class="featured-body">
              <div class="featured-meta">
                <LeafTypeBadge :leaf-type="featured.leafType" />
                <span class="featured-growth">{{ featured.growth }}</span>
              </div>
              <h3 class="featured-title">{{ featured.title }}</h3>
              <p v-if="featured.excerpt" class="featured-excerpt">{{ featured.excerpt }}</p>
              <div class="featured-footer">
                <time v-if="featured.publishedAt" :datetime="featured.publishedAt" class="featured-date">
                  {{ formatDate(featured.publishedAt) }}
                </time>
                <span v-if="featuredReadTime" class="featured-readtime">· {{ featuredReadTime }}</span>
                <div v-if="featured.vines.length" class="featured-vines">
                  <VineTag v-for="vine in featured.vines.slice(0, 3)" :key="vine" :vine="vine" />
                </div>
              </div>
            </div>
          </NuxtLink>
        </article>

        <!-- Rest of the feed -->
        <div class="feed-grid">
          <LeafCard v-for="leaf in restOfFeed" :key="leaf.id" :leaf="leaf" />
        </div>
      </div>
      <div v-else-if="!isLoading" class="empty-state">
        <Sprout :size="48" class="empty-state__icon" />
        <h3 class="empty-state__title">The trunk is quiet for now...</h3>
        <p class="empty-state__message">New leaves will appear here as they unfurl.</p>
      </div>

      <div v-if="data && data.total > 12" class="pagination">
        <button :disabled="page <= 1" @click="page--">← Newer</button>
        <span class="pagination-info">Page {{ page }}</span>
        <button :disabled="data.feed.length < 12" @click="page++">Older →</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Sprout } from 'lucide-vue-next';
import { useTrunkFeed } from '~/composables/useLeaves';
import { estimateReadingTime } from '~/composables/useReadingTime';

const { currentSeason } = useSeason();
const page = ref(1);
const { data, isLoading } = useTrunkFeed(page);

const featured = computed(() => data.value?.feed[0] ?? null);
const featuredReadTime = computed((): string | null => {
  if (!featured.value) return null;
  if (featured.value.excerpt) return estimateReadingTime(featured.value.excerpt);
  return null;
});
const restOfFeed = computed(() => {
  if (!data.value?.feed.length) return [];
  return page.value === 1 ? data.value.feed.slice(1) : data.value.feed;
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

useHead({ title: 'The Highland Oak Tree' });
</script>

<style scoped>
.trunk-feed {
  max-width: 900px;
  margin: 0 auto;
  padding-top: 1.5rem;
}
.feed-title {
  font-family: var(--font-display, 'Playfair Display', serif);
  font-size: var(--text-2xl, 1.875rem);
  font-weight: 700;
  margin: 0 0 1.25rem;
  color: var(--color-text, #2c2c2c);
}
.feed-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl, 2rem);
}
.featured-card {
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.2s, transform 0.25s ease;
  position: relative;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 12px;
}
.featured-card--no-image {
  max-width: 480px;
}
/* Type-specific accent colors */
.featured-card--prose {
  border-left: 4px solid #8b9e6b;
  background: linear-gradient(135deg, #fafaf7 0%, #f4f2ed 100%);
}
.featured-card--blossom {
  border-left: 4px solid #d4869c;
  background: linear-gradient(135deg, #fef9fa 0%, #fdf0f3 100%);
}
.featured-card--seed {
  border-left: 4px solid #8d6e63;
  background: linear-gradient(135deg, #faf8f5 0%, #f0ebe3 100%);
}
.featured-card--fruit {
  border-left: 4px solid #6b9e6b;
  background: linear-gradient(135deg, #f7faf7 0%, #edf5ed 100%);
}
/* Botanical watermark */
.featured-watermark {
  position: absolute;
  bottom: -12px;
  right: -12px;
  width: 120px;
  height: 120px;
  pointer-events: none;
  z-index: 0;
}
.featured-card--prose .featured-watermark { color: #8b9e6b; }
.featured-card--blossom .featured-watermark { color: #d4869c; }
.featured-card--seed .featured-watermark { color: #8d6e63; }
.featured-card--fruit .featured-watermark { color: #6b9e6b; }
.featured-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.featured-link {
  display: block;
  text-decoration: none;
  color: inherit;
  position: relative;
  z-index: 1;
}
.featured-link * {
  text-decoration: none;
}
.featured-link--has-image {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  max-height: 320px;
  overflow: hidden;
}
.featured-image {
  width: 100%;
  height: 100%;
  max-height: 320px;
  object-fit: cover;
}
.featured-body {
  padding: 2.5rem 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  align-items: flex-start;
}
.featured-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.featured-growth {
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-muted, #8a9199);
}
.featured-title {
  font-family: var(--font-display, 'Playfair Display', serif);
  font-size: var(--text-xl, 1.5rem);
  font-weight: 700;
  line-height: var(--leading-tight, 1.2);
  margin: 0;
  color: var(--color-text, #2c2c2c);
}
.featured-excerpt {
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-muted, #8a9199);
  line-height: var(--leading-normal, 1.6);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.featured-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.featured-date {
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-muted, #8a9199);
}
.featured-readtime {
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-muted, #8a9199);
}
.featured-vines {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  margin-left: 0.3rem;
}
.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg, 1.5rem);
}

/* --- Empty State --- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-4xl, 6rem) var(--space-lg, 1.5rem);
}
.empty-state__icon {
  color: var(--color-accent, #81c784);
  opacity: 0.6;
  margin-bottom: var(--space-lg, 1.5rem);
}
.empty-state__title {
  font-family: var(--font-heading, 'Fraunces', serif);
  font-size: var(--text-xl, 1.5rem);
  font-weight: 600;
  margin: 0 0 var(--space-sm, 0.5rem);
  color: var(--color-text, #2c2c2c);
}
.empty-state__message {
  font-size: var(--text-base, 1rem);
  color: var(--color-muted, #8a9199);
  margin: 0;
}

/* --- Pagination --- */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-bottom: 1rem;
  font-size: 0.85rem;
}
.pagination button {
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 0.82rem;
  color: #333;
  transition: background 0.15s;
}
.pagination button:hover { background: var(--color-tertiary, #faf3e0); }
.pagination button:disabled { opacity: 0.35; cursor: default; }
.pagination-info { color: var(--color-muted, #8a9199); }

@media (max-width: 768px) {
  .feed-grid { grid-template-columns: 1fr; }
  .trunk-feed { padding-top: 1rem; }
  .featured-card--no-image { max-width: 100%; }
  .featured-link--has-image { grid-template-columns: 1fr; max-height: none; }
  .featured-image { max-height: 200px; }
}
</style>
