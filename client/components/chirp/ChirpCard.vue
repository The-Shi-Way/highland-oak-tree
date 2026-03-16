<template>
  <article class="chirp-card hover-lift" :class="{ 'chirp-card--pinned': chirp.isPinned }">
    <!-- Decorative bird watermark -->
    <div class="chirp-card__watermark" aria-hidden="true">
      <svg viewBox="0 0 80 80" fill="none">
        <path
          d="M58 28c-4-6-12-10-20-8-6 2-10 6-12 12-1 3-1 6 0 9 2 5 6 8 11 10 4 1 8 1 12-1 5-3 9-8 10-14 1-3 1-6-1-8z"
          fill="currentColor"
          opacity="0.06"
        />
        <path
          d="M26 32c-4-2-8-1-12 2"
          stroke="currentColor"
          opacity="0.08"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <circle cx="50" cy="30" r="2" fill="currentColor" opacity="0.1" />
        <path
          d="M60 28l6-2"
          stroke="currentColor"
          opacity="0.08"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <div class="chirp-card__body">
      <div class="chirp-card__header">
        <span v-if="chirp.isPinned" class="chirp-card__pin" aria-label="Pinned chirp">📌</span>
        <h3 class="chirp-card__title">{{ chirp.title }}</h3>
      </div>
      <p class="chirp-card__text">{{ chirp.body }}</p>
      <div class="chirp-card__footer">
        <time
          v-if="chirp.publishedAt"
          :datetime="chirp.publishedAt"
          class="chirp-card__date"
        >
          {{ formatDate(chirp.publishedAt) }}
        </time>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { IChirpListItem } from '~/composables/useChirps';

defineProps<{ chirp: IChirpListItem }>();

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<style scoped>
.chirp-card {
  position: relative;
  overflow: hidden;
  background: var(--color-surface, #f8f6f2);
  border: 1px solid var(--color-border, #e8e5e0);
  border-left: 3px solid var(--color-primary, #4a7c59);
  border-radius: 12px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.chirp-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.chirp-card--pinned {
  border-left-color: #d4a017;
  background: linear-gradient(135deg, #fffdf5 0%, #faf6e8 100%);
}

/* Bird watermark in bottom-right corner */
.chirp-card__watermark {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 80px;
  height: 80px;
  pointer-events: none;
  z-index: 0;
  color: var(--color-primary, #4a7c59);
}

.chirp-card--pinned .chirp-card__watermark {
  color: #d4a017;
}

.chirp-card__body {
  padding: var(--space-lg, 1.5rem);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.chirp-card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.chirp-card__pin {
  flex-shrink: 0;
  font-size: var(--text-sm, 0.875rem);
  line-height: var(--leading-tight, 1.2);
}

.chirp-card__title {
  font-family: var(--font-heading, 'Fraunces', Georgia, serif);
  font-size: var(--text-lg, 1.25rem);
  font-weight: 600;
  margin: 0;
  color: var(--color-text, #2c2c2c);
  line-height: var(--leading-tight, 1.2);
}

.chirp-card__text {
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-muted, #8a9199);
  margin: 0 0 0.75rem;
  line-height: var(--leading-normal, 1.6);
  white-space: pre-line;
}

.chirp-card__footer {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.chirp-card__date {
  font-size: var(--text-xs, 0.75rem);
  color: var(--color-muted, #8a9199);
}

@media (prefers-reduced-motion: reduce) {
  .chirp-card {
    transition: none;
  }
}
</style>
