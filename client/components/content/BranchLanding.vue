<template>
  <div class="branch-landing">
    <header class="branch-header">
      <LeafTypeBadge :leaf-type="leafType" />
      <h1 class="branch-title">{{ title }}</h1>
      <p class="branch-desc">{{ description }}</p>
    </header>

    <div class="branch-filters">
      <GrowthFilter v-model="growthFilter" />
      <SeasonFilter v-model="seasonFilter" />
    </div>

    <div class="divider-vine"></div>

    <div v-if="data?.leaves.length" class="branch-grid">
      <LeafCard v-for="leaf in data.leaves" :key="leaf.id" :leaf="leaf" />
    </div>
    <div v-else-if="!isLoading" class="empty-state">
      <Sprout :size="48" class="empty-state__icon" />
      <h3 class="empty-state__title">Still growing...</h3>
      <p class="empty-state__message">New leaves will appear on this branch as they unfurl.</p>
    </div>

    <div v-if="data && data.total > 12" class="branch-pagination">
      <button :disabled="page <= 1" @click="page--">Previous</button>
      <span>Page {{ page }} of {{ Math.ceil(data.total / 12) }}</span>
      <button :disabled="page >= Math.ceil(data.total / 12)" @click="page++">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Sprout } from 'lucide-vue-next';
import { useLeafList } from '~/composables/useLeaves';

const props = defineProps<{
  leafType: 'prose' | 'blossom' | 'fruit' | 'seed';
  title: string;
  description: string;
}>();

const page = ref(1);
const growthFilter = ref('');
const seasonFilter = ref('');

const leafTypeRef = computed(() => props.leafType);
const filters = computed(() => ({
  growth: growthFilter.value || undefined,
  season: seasonFilter.value || undefined,
}));

const { data, isLoading } = useLeafList(leafTypeRef, page, filters);
</script>

<style scoped>
.branch-header { margin-bottom: var(--space-lg, 1.5rem); }
.branch-title {
  font-family: var(--font-heading, 'Fraunces', serif);
  font-size: var(--text-3xl, 2.25rem);
  font-weight: var(--weight-bold, 700);
  margin: 0.5rem 0 0.3rem;
  color: var(--color-primary, #4a7c59);
}
.branch-desc {
  color: var(--color-muted, #8a9199);
  font-size: var(--text-base, 1rem);
  margin: 0;
}
.branch-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 0;
  flex-wrap: wrap;
}
.branch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-xl, 2rem);
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
  margin-bottom: var(--space-lg, 1.5rem);
}
.empty-state__title {
  font-family: var(--font-heading, 'Fraunces', serif);
  font-size: var(--text-xl, 1.5rem);
  font-weight: var(--weight-semibold, 600);
  margin: 0 0 var(--space-sm, 0.5rem);
  color: var(--color-text, #2c2c2c);
}
.empty-state__message {
  font-size: var(--text-base, 1rem);
  color: var(--color-muted, #8a9199);
  margin: 0;
}
.branch-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: var(--space-xl, 2rem);
  font-size: 0.88rem;
}
.branch-pagination button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.branch-pagination button:disabled { opacity: 0.4; cursor: default; }

@media (max-width: 768px) {
  .branch-grid {
    grid-template-columns: 1fr;
  }
}
</style>
