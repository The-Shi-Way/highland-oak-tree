<template>
  <div class="trunk-page">
    <SeasonalHeroTree :season="currentSeason" />

    <div class="trunk-layout">
      <section class="trunk-feed">
        <h2 class="section-title">Latest Leaves</h2>
        <div v-if="data?.feed.length" class="feed-grid">
          <LeafCard v-for="leaf in data.feed" :key="leaf.id" :leaf="leaf" />
        </div>
        <p v-else-if="!isLoading" class="empty">Nothing here yet.</p>

        <div v-if="data && data.total > 12" class="pagination">
          <button :disabled="page <= 1" @click="page--">Previous</button>
          <span>Page {{ page }}</span>
          <button :disabled="data.feed.length < 12" @click="page++">Next</button>
        </div>
      </section>

      <aside class="trunk-sidebar">
        <section v-if="data?.seeds.length" class="sidebar-section">
          <h3 class="sidebar-title">🌱 Recent Seeds</h3>
          <ul class="seed-list">
            <li v-for="seed in data.seeds" :key="seed.id">
              <NuxtLink :to="`/seed/${seed.slug}`" class="seed-link">{{ seed.title }}</NuxtLink>
            </li>
          </ul>
        </section>

        <section v-if="grove?.length" class="sidebar-section">
          <h3 class="sidebar-title">🌳 The Grove</h3>
          <ul class="grove-list">
            <li v-for="entry in grove.slice(0, 5)" :key="entry.id">
              <a :href="entry.url" target="_blank" rel="noopener" class="grove-link">
                {{ entry.name }}
              </a>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTrunkFeed } from '~/composables/useLeaves';
import { useGroveList } from '~/composables/useGrove';

const { currentSeason } = useSeason();
const page = ref(1);
const { data, isLoading } = useTrunkFeed(page);
const { data: grove } = useGroveList();

useHead({ title: 'The Highland Oak Tree' });
</script>

<style scoped>
.trunk-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
  margin-top: 1rem;
}
.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: var(--color-text, #2c2c2c);
}
.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.2rem;
}
.empty {
  color: var(--color-muted, #8a9199);
  text-align: center;
  padding: 3rem 0;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  font-size: 0.88rem;
}
.pagination button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border, #e8e5e0);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}
.pagination button:disabled { opacity: 0.4; cursor: default; }
.sidebar-section { margin-bottom: 1.5rem; }
.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.6rem;
  color: var(--color-text, #2c2c2c);
}
.seed-list, .grove-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.seed-list li, .grove-list li { margin-bottom: 0.4rem; }
.seed-link, .grove-link {
  font-size: 0.88rem;
  color: var(--color-primary, #4a7c59);
  text-decoration: none;
}
.seed-link:hover, .grove-link:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .trunk-layout {
    grid-template-columns: 1fr;
  }
}
</style>
