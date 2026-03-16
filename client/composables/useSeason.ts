import { ref, computed, onMounted } from 'vue';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'evening' | 'night';

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

export function computeTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'dusk';
  if (hour >= 20 && hour < 22) return 'evening';
  return 'night';
}

const seasonEmoji: Record<Season, string> = {
  spring: '🌱',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
};

const timeEmoji: Record<TimeOfDay, string> = {
  dawn: '🌅',
  morning: '🌤',
  afternoon: '☀️',
  dusk: '🌇',
  evening: '🌙',
  night: '🌑',
};

const currentSeason = ref<Season>(computeSeason(new Date()));
const currentTimeOfDay = ref<TimeOfDay>(computeTimeOfDay(new Date()));

export function useSeason() {
  const journalDate = computed((): string => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatted;
  });

  const seasonLabel = computed((): string => {
    const s = currentSeason.value;
    return `${seasonEmoji[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`;
  });

  const timeLabel = computed((): string => {
    const t = currentTimeOfDay.value;
    return `${timeEmoji[t]} ${t.charAt(0).toUpperCase() + t.slice(1)}`;
  });

  onMounted(() => {
    const season = computeSeason(new Date());
    currentSeason.value = season;
    currentTimeOfDay.value = computeTimeOfDay(new Date());
    document.documentElement.dataset.season = season;

    // Update time of day every minute
    const interval = setInterval(() => {
      currentTimeOfDay.value = computeTimeOfDay(new Date());
    }, 60_000);

    // Nuxt handles cleanup via onUnmounted internally
    const cleanup = (): void => clearInterval(interval);
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', cleanup, { once: true });
    }
  });

  return { currentSeason, currentTimeOfDay, journalDate, seasonLabel, timeLabel };
}
