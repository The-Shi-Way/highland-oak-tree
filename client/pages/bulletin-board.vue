<template>
  <div class="bulletin-page">
    <header class="bulletin-header">
      <h1 class="bulletin-title">🐦 Bulletin Board</h1>
      <p class="bulletin-desc">Chirps from the oak — news, updates, and little announcements.</p>
    </header>

    <div v-if="isLoading" class="loading-state">
      <Loader2 :size="24" class="spin-icon" />
      <span>Loading chirps...</span>
    </div>

    <template v-else-if="data?.chirps?.length">
      <div class="chirp-list">
        <ChirpCard
          v-for="chirp in data.chirps"
          :key="chirp.id"
          :chirp="chirp"
        />
      </div>

      <nav v-if="totalPages > 1" class="pagination" aria-label="Bulletin board pagination">
        <button
          class="pagination__btn"
          :disabled="page <= 1"
          @click="page--"
        >
          ← Prev
        </button>
        <span class="pagination__info">Page {{ page }} of {{ totalPages }}</span>
        <button
          class="pagination__btn"
          :disabled="page >= totalPages"
          @click="page++"
        >
          Next →
        </button>
      </nav>
    </template>

    <div v-else class="empty-state">
      <Bird :size="48" class="empty-state__icon" />
      <h3 class="empty-state__title">The branches are quiet — no chirps yet.</h3>
      <p class="empty-state__message">Announcements and updates will appear here when they're posted.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Bird, Loader2 } from 'lucide-vue-next';
import { useChirpList } from '~/composables/useChirps';
import ChirpCard from '~/components/chirp/ChirpCard.vue';

const page = ref(1);
const { data, isLoading } = useChirpList(page);

const totalPages = computed(() => {
  if (!data.value || data.value.limit === 0) return 1;
  return Math.ceil(data.value.total / data.value.limit);
});

useHead({ title: 'Bulletin Board — The Highland Oak Tree' });
</script>

<style scoped>
.bulletin-header {
  margin-bottom: var(--space-lg, 1.5rem);
}

.bulletin-title {
  font-family: var(--font-heading, 'Fraunces', serif);
  font-size: var(--text-2xl, 1.875rem);
  font-weight: var(--weight-bold, 700);
  margin: 0 0 var(--space-xs, 0.25rem);
  color: var(--color-primary, #4a7c59);
}

.bulletin-desc {
  color: var(--color-muted, #8a9199);
  font-size: var(--text-sm, 0.875rem);
  margin: 0;
}

.chirp-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg, 1.5rem);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: var(--space-4xl, 6rem) var(--space-lg, 1.5rem);
  color: var(--color-muted, #8a9199);
  font-size: var(--text-sm, 0.875rem);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md, 1rem);
  margin-top: var(--space-xl, 2rem);
}

.pagination__btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 8px;
  background: var(--color-bg, #fff);
  color: var(--color-primary, #4a7c59);
  font-size: var(--text-sm, 0.875rem);
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease;
}

.pagination__btn:hover:not(:disabled) {
  background: var(--color-surface, #f8f6f2);
}

.pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination__info {
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-muted, #8a9199);
}

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
  margin-bottom: var(--space-md, 1rem);
}

.empty-state__title {
  font-family: var(--font-heading, 'Fraunces', serif);
  font-size: var(--text-xl, 1.5rem);
  font-weight: var(--weight-semibold, 600);
  color: var(--color-text, #2c2c2c);
  margin: 0 0 var(--space-sm, 0.5rem);
}

.empty-state__message {
  font-size: var(--text-base, 1rem);
  color: var(--color-muted, #8a9199);
  line-height: var(--leading-normal, 1.6);
  margin: 0;
  max-width: 40ch;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .chirp-list {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spin-icon {
    animation: none;
  }
}
</style>
