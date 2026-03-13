<template>
  <div class="forest-floor-page">
    <header class="ff-header">
      <h1 class="ff-title">🍂 The Forest Floor</h1>
      <p class="ff-desc">Older leaves that have drifted down — the archive.</p>
    </header>

    <div class="ff-search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search the archive…"
        class="ff-search-input"
        aria-label="Search archive"
      />
    </div>

    <div v-if="filteredByYear.length" class="ff-years">
      <section v-for="group in filteredByYear" :key="group.year" class="ff-year-group">
        <h2 class="ff-year">{{ group.year }}</h2>
        <div class="ff-year-grid">
          <LeafCard v-for="leaf in group.leaves" :key="leaf.id" :leaf="leaf" />
        </div>
      </section>
    </div>
    <p v-else-if="!isLoading" class="ff-empty">The forest floor is bare.</p>

    <div v-if="data && data.total > 50" class="ff-pagination">
      <button :disabled="page <= 1" @click="page--">Previous</button>
      <span>Page {{ page }}</span>
      <button :disabled="(data?.leaves.length ?? 0) < 50" @click="page++">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useForestFloor, type ILeafListItem } from '~/composables/useLeaves';

const page = ref(1);
const searchQuery = ref('');
const { data, isLoading } = useForestFloor(page);

interface IYearGroup {
  year: number;
  leaves: ILeafListItem[];
}

const groupedByYear = computed((): IYearGroup[] => {
  if (!data.value?.leaves.length) return [];
  const groups = new Map<number, ILeafListItem[]>();
  for (const leaf of data.value.leaves) {
    const date = leaf.publishedAt ?? leaf.createdAt;
    const year = new Date(date).getFullYear();
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(leaf);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, leaves]) => ({ year, leaves }));
});

const filteredByYear = computed((): IYearGroup[] => {
  if (!searchQuery.value.trim()) return groupedByYear.value;
  const q = searchQuery.value.toLowerCase();
  return groupedByYear.value
    .map((group) => ({
      year: group.year,
      leaves: group.leaves.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.excerpt?.toLowerCase().includes(q) ?? false) ||
          l.vines.some((v) => v.toLowerCase().includes(q)),
      ),
    }))
    .filter((g) => g.leaves.length > 0);
});

useHead({ title: 'The Forest Floor — The Highland Oak Tree' });
</script>

<style scoped>
.ff-header { margin-bottom: 1rem; }
.ff-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  color: var(--color-text, #2c2c2c);
}
.ff-desc {
  color: var(--color-muted, #8a9199);
  font-size: 0.95rem;
  margin: 0;
}
.ff-search { margin-bottom: 1.5rem; }
.ff-search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 8px;
  font-size: 0.9rem;
  background: #fff;
  color: var(--color-text, #2c2c2c);
}
.ff-year {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-muted, #8a9199);
  margin: 0 0 0.8rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--color-border, #e8e5e0);
}
.ff-year-group { margin-bottom: 2rem; }
.ff-year-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.ff-empty {
  color: var(--color-muted, #8a9199);
  text-align: center;
  padding: 3rem 0;
}
.ff-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  font-size: 0.88rem;
}
.ff-pagination button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}
.ff-pagination button:disabled { opacity: 0.4; cursor: default; }
</style>
