<template>
  <div class="growth-rings-page">
    <header class="gr-header">
      <h1 class="gr-title">🪵 Growth Rings</h1>
      <p class="gr-desc">A timeline of every leaf, plotted on the rings of the tree.</p>
    </header>

    <GrowthRings v-if="allLeaves.length" :leaves="allLeaves" />
    <p v-else-if="!isLoading" class="gr-empty">No leaves to visualize yet.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCanopy, type ILeafListItem } from '~/composables/useLeaves';

const page = ref(1);
const { data, isLoading } = useCanopy(page);

const allLeaves = computed((): ILeafListItem[] => data.value?.leaves ?? []);

useHead({ title: 'Growth Rings — The Highland Oak Tree' });
</script>

<style scoped>
.gr-header { margin-bottom: 1.5rem; text-align: center; }
.gr-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  color: var(--color-text, #2c2c2c);
}
.gr-desc {
  color: var(--color-muted, #8a9199);
  font-size: 0.95rem;
  margin: 0;
}
.gr-empty {
  color: var(--color-muted, #8a9199);
  text-align: center;
  padding: 3rem 0;
}
</style>
