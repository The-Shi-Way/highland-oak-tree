<template>
  <section class="hero" :class="`hero--${season}`">
    <img
      class="hero__bg"
      :src="bgUrl"
      alt=""
      aria-hidden="true"
      loading="eager"
    />
    <div class="hero__overlay" />
    <div class="hero__content">
      <p class="hero__season-label">{{ seasonLabel }}</p>
      <h1 class="hero__title">
        <span class="hero__title-line hero__title-line--1">The Highland</span>
        <span class="hero__title-line hero__title-line--2">Oak Tree</span>
      </h1>
      <p class="hero__tagline">
        Where words take root, ideas blossom,<br/>
        and every thought finds its branch.
      </p>
      <div class="hero__divider" aria-hidden="true">
        <svg viewBox="0 0 120 20" fill="none">
          <path d="M10 10 Q30 2 60 10 Q90 18 110 10" stroke="currentColor" stroke-width="1.5" opacity="0.5" fill="none"/>
          <circle cx="60" cy="10" r="3" fill="currentColor" opacity="0.4"/>
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ season: string }>();

const bgUrls: Record<string, string> = {
  spring: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1400&q=75&auto=format&fit=crop',
  summer: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=75&auto=format&fit=crop',
  autumn: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1400&q=75&auto=format&fit=crop',
  winter: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1400&q=75&auto=format&fit=crop',
};

const bgUrl = computed((): string => bgUrls[props.season] ?? bgUrls.spring);

const seasonLabel = computed((): string => {
  const labels: Record<string, string> = {
    spring: '🌱 Spring Edition',
    summer: '☀️ Summer Edition',
    autumn: '🍂 Autumn Edition',
    winter: '❄️ Winter Edition',
  };
  return labels[props.season] ?? '🌿 A Living Journal';
});
</script>

<style scoped>
.hero {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  min-height: 260px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  padding: 2.5rem 2rem 2rem;
}

.hero__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
  z-index: 0;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.5);
}

.hero__content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  border-radius: 16px;
  padding: 2rem 2.5rem 1.5rem;
  animation: heroFadeIn 0.8s ease-out both;
}

.hero__season-label {
  font-family: var(--font-body, sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  margin: 0 0 0.8rem;
  animation: heroSlideUp 0.6s ease-out 0.1s both;
}

.hero__title {
  font-family: var(--font-display, 'Playfair Display', serif);
  font-weight: 900;
  line-height: 1.05;
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.4);
}

.hero__title-line { display: block; }

.hero__title-line--1 {
  font-size: clamp(1.8rem, 4.5vw, 2.8rem);
  animation: heroSlideUp 0.6s ease-out 0.2s both;
}

.hero__title-line--2 {
  font-size: clamp(2.5rem, 6.5vw, 4rem);
  font-style: italic;
  animation: heroSlideUp 0.6s ease-out 0.35s both;
}

.hero__tagline {
  font-family: var(--font-poetry, 'Cormorant Garamond', Georgia, serif);
  font-size: clamp(1.05rem, 2.5vw, 1.35rem);
  font-style: italic;
  line-height: 1.7;
  color: #fff;
  margin: 0 0 1.2rem;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3);
  animation: heroSlideUp 0.6s ease-out 0.5s both;
}

.hero__divider {
  display: flex;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  animation: heroFadeIn 0.6s ease-out 0.65s both;
}
.hero__divider svg {
  width: 100px;
  height: 18px;
}

@keyframes heroFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes heroSlideUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .hero {
    min-height: 200px;
    padding: 1.5rem 1rem 1.2rem;
  }
  .hero__content {
    padding: 1.2rem 1.5rem 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__content,
  .hero__season-label,
  .hero__title-line--1,
  .hero__title-line--2,
  .hero__tagline,
  .hero__divider {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
