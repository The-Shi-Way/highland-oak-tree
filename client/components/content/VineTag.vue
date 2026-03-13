<template>
  <NuxtLink :to="`/vine/${encodeURIComponent(vine)}`" class="vine-tag">
    {{ vine }}
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ vine: string }>();
</script>

<style scoped>
.vine-tag {
  display: inline-block;
  font-size: 0.78rem;
  color: var(--color-primary, #4a7c59);
  background: var(--color-tertiary, #faf3e0);
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: opacity 0.2s;
}
.vine-tag:hover {
  opacity: 0.8;
}
</style>
