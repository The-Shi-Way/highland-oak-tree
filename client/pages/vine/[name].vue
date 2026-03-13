<template>
  <div class="vine-page">
    <header class="vine-header">
      <h1 class="vine-title">🌿 Vine: {{ vineName }}</h1>
      <p class="vine-desc">All leaves connected by this vine, across every branch.</p>
    </header>

    <div v-if="data?.leaves.length" class="vine-grid">
      <LeafCard v-for="leaf in data.leaves" :key="leaf.id" :leaf="leaf" />
    </div>
    <p v-else-if="!isLoading" class="vine-empty">No leaves on this vine yet.</p>

    <div v-if="data && data.total > 12" class="vine-pagination">
      <button :disabled="page <= 1" @click="page--">Previous</button>
      <span>Page {{ page }} of {{ Math.ceil(data.total / 12) }}</span>
      <button :disabled="page >= Math.ceil(data.total / 12)" @click="page++">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVineLeaves } from '~/composables/useLeaves';

const route = useRoute();
const vineName = computed(() => decodeURIComponent(route.params.name as string));
const page = ref(1);

const { data, isLoading } = useVineLeaves(vineName, page);

useHead({ title: computed(() => `Vine: ${vineName.value} — The Highland Oak Tree`) });
</script>

<style scoped>
.vine-header { margin-bottom: 1.5rem; }
.vine-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  color: var(--color-text, #2c2c2c);
}
.vine-desc {
  color: var(--color-muted, #8a9199);
  font-size: 0.95rem;
  margin: 0;
}
.vine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.2rem;
}
.vine-empty {
  color: var(--color-muted, #8a9199);
  text-align: center;
  padding: 3rem 0;
}
.vine-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  font-size: 0.88rem;
}
.vine-pagination button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}
.vine-pagination button:disabled { opacity: 0.4; cursor: default; }
</style>
