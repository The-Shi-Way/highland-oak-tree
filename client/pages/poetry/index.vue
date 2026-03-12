<template>
  <div class="poetry-page">
    <header class="poetry-header">
      <Feather :size="30" :stroke-width="1.4" class="header-icon" />
      <h1>Poetry</h1>
      <p class="poetry-intro">Words shaped by thought, rhythm, and the quiet spaces between.</p>
    </header>

    <div v-if="isLoading" class="loading-state">
      <Loader2 :size="24" class="spin-icon" />
      <span>Loading poems...</span>
    </div>
    <div v-else-if="isError" class="error-state">
      <AlertCircle :size="24" />
      <span>Unable to load poems.</span>
    </div>
    <div v-else-if="data" class="poem-grid">
      <NuxtLink
        v-for="poem in data"
        :key="poem.id"
        :to="`/poetry/${poem.id}`"
        class="poem-card"
        :class="`theme-${poem.theme}`"
      >
        <div class="poem-card-inner">
          <span class="poem-theme-label">
            <Palette :size="11" />
            {{ poem.theme }}
          </span>
          <h2>{{ poem.title }}</h2>
          <time v-if="poem.publishedAt" :datetime="poem.publishedAt">
            <Calendar :size="12" />
            {{ formatDate(poem.publishedAt) }}
          </time>
        </div>
      </NuxtLink>

      <div v-if="data.length === 0" class="empty-state">
        <PenLine :size="32" :stroke-width="1.2" />
        <p>No poems published yet. Check back soon.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Feather, Loader2, AlertCircle, Calendar, Palette, PenLine } from 'lucide-vue-next';
import { usePoemList } from '~/composables/usePoems';

useHead({ title: 'Poetry | The Highland Oak Tree' });

const { data, isLoading, isError } = usePoemList();

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}
</script>

<style scoped>
.poetry-page {
  max-width: 1000px;
  margin: 0 auto;
}

.poetry-header {
  text-align: center;
  padding: 3rem 0 2rem;
  border-bottom: 1px solid #e8e5e0;
  margin-bottom: 2.5rem;
}

.header-icon {
  color: #1a4731;
  opacity: 0.6;
  margin-bottom: 0.5rem;
}

.poetry-header h1 {
  font-size: 2.5rem;
  color: #1a4731;
  font-style: italic;
  margin: 0 0 0.5rem;
}

.poetry-intro {
  color: #7a8694;
  font-style: italic;
  font-size: 1.1rem;
  max-width: 420px;
  margin: 0 auto;
  line-height: 1.5;
}

.poem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.poem-card {
  text-decoration: none;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 200px;
  display: flex;
  align-items: flex-end;
}

.poem-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.poem-card-inner {
  padding: 1.5rem;
  width: 100%;
}

.poem-theme-label {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.75;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.poem-card h2 {
  font-size: 1.3rem;
  margin: 0.5rem 0;
  line-height: 1.3;
}

.poem-card time {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  opacity: 0.65;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.theme-classic {
  background: linear-gradient(135deg, #faf5ef, #f0e6d3);
  color: #3d2b1f;
}
.theme-modern {
  background: linear-gradient(135deg, #1a202c, #2d3748);
  color: #e2e8f0;
}
.theme-nature {
  background: linear-gradient(135deg, #f0fff4, #c6f6d5);
  color: #1a4731;
}
.theme-dark {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #a0aec0;
}
.theme-romantic {
  background: linear-gradient(135deg, #fff5f5, #fed7d7);
  color: #742a2a;
}
.theme-minimal {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #2d3748;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  padding: 3.5rem;
  color: #7a8694;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .poem-grid {
    grid-template-columns: 1fr;
  }
}
</style>
