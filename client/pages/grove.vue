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
        class="grove-card"
      >
        <span class="grove-card__label">{{ entry.treeLabel || '🌲' }}</span>
        <h3 class="grove-card__name">{{ entry.name }}</h3>
        <p v-if="entry.description" class="grove-card__desc">{{ entry.description }}</p>
      </a>
    </div>
    <p v-else-if="!isLoading" class="grove-empty">The grove is quiet for now.</p>
  </div>
</template>

<script setup lang="ts">
import { useGroveList } from '~/composables/useGrove';

const { data, isLoading } = useGroveList();

useHead({ title: 'The Grove — The Highland Oak Tree' });
</script>

<style scoped>
.grove-header { margin-bottom: 1.5rem; }
.grove-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  color: var(--color-text, #2c2c2c);
}
.grove-desc {
  color: var(--color-muted, #8a9199);
  font-size: 0.95rem;
  margin: 0;
}
.grove-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.2rem;
}
.grove-card {
  display: block;
  padding: 1.2rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 12px;
  background: #fff;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s;
}
.grove-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.grove-card__label {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.4rem;
}
.grove-card__name {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 0.3rem;
  color: var(--color-primary, #4a7c59);
}
.grove-card__desc {
  font-size: 0.85rem;
  color: var(--color-muted, #8a9199);
  margin: 0;
  line-height: 1.5;
}
.grove-empty {
  color: var(--color-muted, #8a9199);
  text-align: center;
  padding: 3rem 0;
}
</style>
