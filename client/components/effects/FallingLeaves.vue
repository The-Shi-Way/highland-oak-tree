<template>
  <div v-if="isAutumn" class="falling-leaves" aria-hidden="true">
    <span v-for="i in 12" :key="i" class="falling-leaf" :style="leafStyle(i)">🍂</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ season: string }>();

const isAutumn = computed(() => props.season === 'autumn');

function leafStyle(index: number): Record<string, string> {
  const left = ((index * 8.3) % 100).toFixed(1);
  const delay = ((index * 1.7) % 8).toFixed(1);
  const duration = (6 + (index % 5) * 1.5).toFixed(1);
  const size = (0.7 + (index % 4) * 0.2).toFixed(2);
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    fontSize: `${size}rem`,
    opacity: String(0.4 + (index % 3) * 0.2),
  };
}
</script>

<style scoped>
.falling-leaves {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.falling-leaf {
  position: absolute;
  top: -2rem;
  animation-name: fall, sway;
  animation-timing-function: ease-in, ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes fall {
  0% { top: -2rem; }
  100% { top: 105vh; }
}

@keyframes sway {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(20px) rotate(15deg); }
  50% { transform: translateX(-15px) rotate(-10deg); }
  75% { transform: translateX(10px) rotate(5deg); }
}

@media (prefers-reduced-motion: reduce) {
  .falling-leaf {
    animation: none;
    display: none;
  }
}
</style>
