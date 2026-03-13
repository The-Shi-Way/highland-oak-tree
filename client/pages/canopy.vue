<template>
  <div class="canopy-page">
    <header class="canopy-header">
      <h1 class="canopy-title">🌿 The Canopy</h1>
      <p class="canopy-desc">All leaves, all branches — the full view from above.</p>
    </header>

    <div class="canopy-filters">
      <select v-model="leafTypeFilter" class="filter-select" aria-label="Filter by branch">
        <option value="">All Branches</option>
        <option value="prose">Prose</option>
        <option value="blossom">Blossom</option>
        <option value="fruit">Fruit</option>
        <option value="seed">Seed</option>
      </select>
      <GrowthFilter v-model="growthFilter" />
      <SeasonFilter v-model="seasonFilter" />
      <input
        v-model="vineFilter"
        type="text"
        placeholder="Filter by vine…"
        class="vine-input"
        aria-label="Filter by vine"
      />
    </div>

    <div v-if="data?.leaves.length" class="canopy-grid">
      <LeafCard v-for="leaf in data.leaves" :key="leaf.id" :leaf="leaf" />
    </div>
    <p v-else-if="!isLoading" class="canopy-empty">No leaves found.</p>

    <div v-if="data && data.total > 12" class="canopy-pagination">
      <button :disabled="page <= 1" @click="page--">Previous</button>
      <span>Page {{ page }} of {{ Math.ceil(data.total / 12) }}</span>
      <button :disabled="page >= Math.ceil(data.total / 12)" @click="page++">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCanopy } from '~/composables/useLeaves';

const page = ref(1);
const leafTypeFilter = ref('');
const growthFilter = ref('');
const seasonFilter = ref('');
const vineFilter = ref('');

const filters = computed(() => ({
  growth: growthFilter.value || undefined,
  season: seasonFilter.value || undefined,
  vine: vineFilter.value || undefined,
  leafType: leafTypeFilter.value || undefined,
}));

const { data, isLoading } = useCanopy(page, filters);

useHead({ title: 'The Canopy — The Highland Oak Tree' });
</script>

<style scoped>
.canopy-header { margin-bottom: 1.5rem; }
.canopy-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  color: var(--color-text, #2c2c2c);
}
.canopy-desc {
  color: var(--color-muted, #8a9199);
  font-size: 0.95rem;
  margin: 0;
}
.canopy-filters {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}
.filter-select, .vine-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 6px;
  font-size: 0.85rem;
  background: #fff;
  color: var(--color-text, #2c2c2c);
}
.vine-input { width: 160px; }
.canopy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.2rem;
}
.canopy-empty {
  color: var(--color-muted, #8a9199);
  text-align: center;
  padding: 3rem 0;
}
.canopy-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  font-size: 0.88rem;
}
.canopy-pagination button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}
.canopy-pagination button:disabled { opacity: 0.4; cursor: default; }
</style>
