import { ref, onMounted } from 'vue';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * Pure function: computes the Season from a given Date.
 * Same logic as backend server-nestjs/src/shared/utils/season.ts
 */
export function computeSeason(date: Date): Season {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

const currentSeason = ref<Season>(computeSeason(new Date()));

export function useSeason() {
  onMounted(() => {
    const season = computeSeason(new Date());
    currentSeason.value = season;
    document.documentElement.dataset.season = season;
  });

  return { currentSeason };
}
