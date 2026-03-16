<template>
  <Transition name="fade">
    <button
      v-if="visible"
      class="back-to-top"
      aria-label="Back to top"
      @click="scrollToTop"
    >
      <ChevronUp :size="20" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronUp } from 'lucide-vue-next';

const visible = ref(false);

function onScroll(): void {
  visible.value = window.scrollY > 400;
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-border, #e8e5e0);
  background: var(--color-bg, #fcfcfb);
  color: var(--color-text, #2c2c2c);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background 0.2s, transform 0.2s;
  z-index: 50;
}
.back-to-top:hover {
  background: var(--color-surface, #f8f6f2);
  transform: translateY(-2px);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
