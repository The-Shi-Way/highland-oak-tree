<template>
  <div class="filter-bar" role="group" aria-label="Filter by season">
    <button
      v-for="option in options"
      :key="option.value"
      class="filter-btn"
      :class="{ active: modelValue === option.value }"
      @click="$emit('update:modelValue', modelValue === option.value ? '' : option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>();
defineEmits<{ 'update:modelValue': [value: string] }>();

const options = [
  { value: 'spring', label: '🌱 Spring' },
  { value: 'summer', label: '☀️ Summer' },
  { value: 'autumn', label: '🍂 Autumn' },
  { value: 'winter', label: '❄️ Winter' },
];
</script>

<style scoped>
.filter-bar { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.filter-btn {
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 16px;
  background: transparent;
  color: var(--color-text, #2c2c2c);
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.15s;
}
.filter-btn:hover { border-color: var(--color-primary, #4a7c59); }
.filter-btn.active {
  background: var(--color-primary, #4a7c59);
  color: #fff;
  border-color: var(--color-primary, #4a7c59);
}
</style>
