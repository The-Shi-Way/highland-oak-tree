<template>
  <div class="roots-page">
    <header class="roots-header">
      <h1 class="roots-title">🌳 The Roots</h1>
      <p class="roots-subtitle">Where this tree draws its nourishment.</p>
    </header>

    <section class="roots-content">
      <p>
        The Highland Oak Tree is a living journal — a place where prose, poetry,
        ideas, and reflections grow together on a single trunk. Each piece of
        writing is a leaf: some are long-form essays (<em>Prose</em>), some are
        poems (<em>Blossom</em>), some are curated links and reviews
        (<em>Fruit</em>), and some are quick thoughts (<em>Seed</em>).
      </p>
      <p>
        Leaves are connected by <strong>vines</strong> — thematic threads that
        weave across branches. They grow through stages: seedling drafts become
        budding works, then mature pieces, and eventually evergreen references.
      </p>
      <p>
        The site changes with the seasons. Colors shift from spring greens to
        summer warmth, autumn golds, and winter stillness. Older leaves drift
        down to the <strong>Forest Floor</strong>, an archive where nothing is
        lost. The <strong>Grove</strong> is a blogroll of fellow trees —
        writers and creators whose work inspires this one.
      </p>
      <p>
        This is a space for slow writing, honest reflection, and the kind of
        thinking that needs room to breathe. Welcome under the canopy.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'The Roots — The Highland Oak Tree' });
</script>

<style scoped>
.roots-page { max-width: 680px; margin: 0 auto; }
.roots-header { margin-bottom: 2rem; text-align: center; }
.roots-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  color: var(--color-text, #2c2c2c);
}
.roots-subtitle {
  color: var(--color-muted, #8a9199);
  font-size: 1rem;
  margin: 0;
}
.roots-content p {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-text, #2c2c2c);
  margin: 0 0 1.2rem;
}
.roots-content em { font-style: italic; }
.roots-content strong { font-weight: 600; }
</style>
