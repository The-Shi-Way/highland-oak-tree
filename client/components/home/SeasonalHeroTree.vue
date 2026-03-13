<template>
  <div class="hero-tree" :class="`hero-tree--${season}`">
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="tree-svg" role="img" aria-label="Seasonal oak tree illustration">
      <!-- Trunk -->
      <rect x="185" y="160" width="30" height="100" rx="4" class="trunk" />
      <!-- Roots -->
      <path d="M190 260 Q170 280 150 285" class="root" />
      <path d="M215 260 Q235 280 255 285" class="root" />

      <!-- Canopy (spring/summer: full, autumn: warm, winter: bare) -->
      <template v-if="season !== 'winter'">
        <ellipse cx="200" cy="120" rx="100" ry="70" class="canopy" />
        <ellipse cx="150" cy="140" rx="50" ry="40" class="canopy canopy-left" />
        <ellipse cx="250" cy="140" rx="50" ry="40" class="canopy canopy-right" />
      </template>
      <template v-else>
        <!-- Bare branches for winter -->
        <line x1="200" y1="160" x2="150" y2="90" class="branch-line" />
        <line x1="200" y1="160" x2="250" y2="80" class="branch-line" />
        <line x1="200" y1="160" x2="180" y2="70" class="branch-line" />
        <line x1="200" y1="160" x2="230" y2="100" class="branch-line" />
        <line x1="150" y1="90" x2="120" y2="60" class="branch-line" />
        <line x1="250" y1="80" x2="280" y2="50" class="branch-line" />
      </template>

      <!-- Spring blossoms -->
      <template v-if="season === 'spring'">
        <circle cx="160" cy="100" r="5" class="blossom" />
        <circle cx="220" cy="90" r="4" class="blossom" />
        <circle cx="180" cy="130" r="6" class="blossom" />
        <circle cx="240" cy="120" r="5" class="blossom" />
      </template>

      <!-- Autumn falling elements -->
      <template v-if="season === 'autumn'">
        <circle cx="130" cy="200" r="3" class="falling-leaf" />
        <circle cx="270" cy="210" r="4" class="falling-leaf" />
        <circle cx="160" cy="220" r="3" class="falling-leaf" />
      </template>

      <!-- Winter frost dots -->
      <template v-if="season === 'winter'">
        <circle cx="140" cy="70" r="2" class="frost" />
        <circle cx="260" cy="60" r="2" class="frost" />
        <circle cx="190" cy="50" r="2" class="frost" />
      </template>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{ season: string }>();
</script>

<style scoped>
.hero-tree {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}
.tree-svg { width: 280px; height: auto; }
.trunk { fill: #6d4c41; }
.root { fill: none; stroke: #6d4c41; stroke-width: 2; }

/* Spring */
.hero-tree--spring .canopy { fill: #81c784; opacity: 0.85; }
.hero-tree--spring .blossom { fill: #f48fb1; }

/* Summer */
.hero-tree--summer .canopy { fill: #4caf50; opacity: 0.9; }

/* Autumn */
.hero-tree--autumn .canopy { fill: #e65100; opacity: 0.8; }
.hero-tree--autumn .canopy-left { fill: #ff8f00; }
.hero-tree--autumn .canopy-right { fill: #c62828; opacity: 0.7; }
.hero-tree--autumn .falling-leaf { fill: #ff6f00; }

/* Winter */
.hero-tree--winter .branch-line {
  stroke: #795548;
  stroke-width: 3;
  stroke-linecap: round;
}
.hero-tree--winter .frost { fill: #b3e5fc; }
</style>
