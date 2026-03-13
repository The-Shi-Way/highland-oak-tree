<template>
  <span class="leaf-type-badge" :class="`badge-${leafType}`" role="img" :aria-label="label">
    <span class="badge-icon">{{ icon }}</span>
    <span class="badge-label">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type LeafType = 'prose' | 'blossom' | 'fruit' | 'seed';

const props = defineProps<{ leafType: LeafType }>();

const config: Record<LeafType, { icon: string; label: string }> = {
  prose: { icon: '🍃', label: 'Prose' },
  blossom: { icon: '🌸', label: 'Blossom' },
  fruit: { icon: '🍎', label: 'Fruit' },
  seed: { icon: '🌱', label: 'Seed' },
};

const icon = computed(() => config[props.leafType].icon);
const label = computed(() => config[props.leafType].label);
</script>

<style scoped>
.leaf-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.2rem 0.55rem;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.badge-prose { background: #e8f5e9; color: #2e7d32; }
.badge-blossom { background: #fce4ec; color: #c2185b; }
.badge-fruit { background: #fff3e0; color: #e65100; }
.badge-seed { background: #efebe9; color: #5d4037; }
.badge-icon { font-size: 0.85rem; }
</style>
