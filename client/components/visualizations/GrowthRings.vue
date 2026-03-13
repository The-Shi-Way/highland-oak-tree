<template>
  <div class="growth-rings-wrapper">
    <svg
      :viewBox="`0 0 ${size} ${size}`"
      :width="size"
      :height="size"
      class="growth-rings-svg"
      role="img"
      aria-label="Growth rings timeline visualization"
    >
      <circle
        v-for="ring in rings"
        :key="ring.year"
        :cx="center"
        :cy="center"
        :r="ring.radius"
        fill="none"
        :stroke="ring.color"
        :stroke-width="ringWidth"
        :opacity="0.25"
      />
      <text
        v-for="ring in rings"
        :key="'label-' + ring.year"
        :x="center"
        :y="center - ring.radius - 4"
        text-anchor="middle"
        class="ring-year-label"
      >{{ ring.year }}</text>

      <circle
        v-for="dot in dots"
        :key="dot.id"
        :cx="dot.x"
        :cy="dot.y"
        :r="6"
        :fill="dot.color"
        class="leaf-dot"
        role="button"
        :tabindex="0"
        :aria-label="dot.title"
        @click="navigateToLeaf(dot)"
        @keydown.enter="navigateToLeaf(dot)"
      />
    </svg>

    <div class="rings-legend">
      <span class="legend-item"><span class="legend-dot" style="background:#4a7c59" /> Prose</span>
      <span class="legend-item"><span class="legend-dot" style="background:#d4a5a5" /> Blossom</span>
      <span class="legend-item"><span class="legend-dot" style="background:#e8a849" /> Fruit</span>
      <span class="legend-item"><span class="legend-dot" style="background:#8d6e63" /> Seed</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ILeafListItem } from '~/composables/useLeaves';

const props = defineProps<{ leaves: ILeafListItem[] }>();

const router = useRouter();

const size = 600;
const center = size / 2;
const ringWidth = 2;
const minRadius = 60;
const ringGap = 35;

const typeColors: Record<string, string> = {
  prose: '#4a7c59',
  blossom: '#d4a5a5',
  fruit: '#e8a849',
  seed: '#8d6e63',
};

const years = computed((): number[] => {
  if (!props.leaves.length) return [];
  const set = new Set<number>();
  for (const leaf of props.leaves) {
    const d = leaf.publishedAt ?? leaf.createdAt;
    set.add(new Date(d).getFullYear());
  }
  return Array.from(set).sort((a, b) => a - b);
});

interface IRing { year: number; radius: number; color: string }

const rings = computed((): IRing[] =>
  years.value.map((year, i) => ({
    year,
    radius: minRadius + i * ringGap,
    color: '#c4b99a',
  })),
);

interface IDot {
  id: string;
  x: number;
  y: number;
  color: string;
  title: string;
  leafType: string;
  slug: string;
}

const dots = computed((): IDot[] => {
  const yearIndex = new Map(years.value.map((y, i) => [y, i]));
  return props.leaves.map((leaf) => {
    const d = new Date(leaf.publishedAt ?? leaf.createdAt);
    const yr = d.getFullYear();
    const month = d.getMonth();
    const angle = (month / 12) * Math.PI * 2 - Math.PI / 2;
    const idx = yearIndex.get(yr) ?? 0;
    const r = minRadius + idx * ringGap;
    return {
      id: leaf.id,
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      color: typeColors[leaf.leafType] ?? '#999',
      title: leaf.title,
      leafType: leaf.leafType,
      slug: leaf.slug,
    };
  });
});

function navigateToLeaf(dot: IDot): void {
  router.push(`/${dot.leafType}/${dot.slug}`);
}
</script>

<style scoped>
.growth-rings-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.growth-rings-svg {
  max-width: 100%;
  height: auto;
}
.ring-year-label {
  font-size: 10px;
  fill: var(--color-muted, #8a9199);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.leaf-dot {
  cursor: pointer;
  transition: r 0.15s;
}
.leaf-dot:hover, .leaf-dot:focus { r: 9; outline: none; }
.rings-legend {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.82rem;
  color: var(--color-muted, #8a9199);
}
.legend-item { display: flex; align-items: center; gap: 0.3rem; }
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
