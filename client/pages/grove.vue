<template>
  <div class="grove-page">
    <header class="grove-header">
      <h1 class="grove-title">🌳 The Grove</h1>
      <p class="grove-desc">Fellow trees — writers and creators whose work inspires this one.</p>
    </header>

    <div v-if="data?.length" class="grove-grid">
      <a
        v-for="entry in data"
        :key="entry.id"
        :href="entry.url"
        target="_blank"
        rel="noopener"
        class="grove-card hover-lift"
      >
        <span class="grove-card__label">{{ entry.treeLabel || '🌲' }}</span>
        <h3 class="grove-card__name">{{ entry.name }}</h3>
        <p v-if="entry.description" class="grove-card__desc">{{ entry.description }}</p>
      </a>
    </div>
    <div v-else-if="!isLoading" class="empty-state">
      <Sprout :size="48" class="empty-state__icon" />
      <h3 class="empty-state__title">The grove is quiet for now...</h3>
      <p class="empty-state__message">Fellow trees will appear here as the forest grows.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sprout } from 'lucide-vue-next';
import { useGroveList } from '~/composables/useGrove';

const { data, isLoading } = useGroveList();

useHead({ title: 'The Grove — The Highland Oak Tree' });
</script>

<style scoped>
.grove-header {
  margin-bottom: var(--space-lg, 1.5rem);
}

.grove-title {
  font-family: var(--font-heading, 'Fraunces', serif);
  font-size: var(--text-2xl, 1.875rem);
  font-weight: var(--weight-bold, 700);
  margin: 0 0 var(--space-xs, 0.25rem);
  color: var(--color-primary, #4a7c59);
}

.grove-desc {
  color: var(--color-muted, #8a9199);
  font-size: var(--text-sm, 0.875rem);
  margin: 0;
}

.grove-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-lg, 1.5rem);
}

.grove-card {
  display: block;
  padding: var(--space-lg, 1.5rem);
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 12px;
  background: var(--color-bg, #fff);
  text-decoration: none;
  color: inherit;
}

.grove-card__label {
  font-size: var(--text-xl, 1.5rem);
  display: block;
  margin-bottom: var(--space-sm, 0.5rem);
}

.grove-card__name {
  font-family: var(--font-heading, 'Fraunces', serif);
  font-size: var(--text-base, 1rem);
  font-weight: var(--weight-semibold, 600);
  margin: 0 0 var(--space-xs, 0.25rem);
  color: var(--color-primary, #4a7c59);
}

.grove-card__desc {
  font-size: var(--text-sm, 0.875rem);
  color: var(--color-muted, #8a9199);
  margin: 0;
  line-height: var(--leading-normal, 1.6);
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

@media (max-width: 768px) {
  .grove-grid {
    grid-template-columns: 1fr;
  }
}
</style>
