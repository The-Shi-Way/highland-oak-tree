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

    <div v-if="data?.leaves.length" class="branch-grid">
      <LeafCard v-for="leaf in data.leaves" :key="leaf.id" :leaf="leaf" />
    </div>
    <p v-else-if="!isLoading" class="branch-empty">No leaves on this branch yet.</p>

    <div v-if="data && data.total > 12" class="branch-pagination">
      <button :disabled="page <= 1" @click="page--">Previous</button>
      <span>Page {{ page }} of {{ Math.ceil(data.total / 12) }}</span>
      <button :disabled="page >= Math.ceil(data.total / 12)" @click="page++">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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
.branch-header { margin-bottom: 1.5rem; }
.branch-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0 0.3rem;
  color: var(--color-text, #2c2c2c);
}
.branch-desc {
  color: var(--color-muted, #8a9199);
  font-size: 0.95rem;
  margin: 0;
}
.branch-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.branch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.2rem;
}
.branch-empty {
  color: var(--color-muted, #8a9199);
  text-align: center;
  padding: 3rem 0;
}
.branch-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
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
</style>
