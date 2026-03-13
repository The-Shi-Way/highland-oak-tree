import * as fc from 'fast-check';
import { computeSeason } from './season';
import type { Season } from '@shared/types';

/**
 * Feature: living-tree-redesign, Property 1: Season utility maps every date to the correct season
 * **Validates: Requirements 1.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**
 */

const MONTH_TO_SEASON: Record<number, Season> = {
  0: 'winter',   // January
  1: 'winter',   // February
  2: 'spring',   // March
  3: 'spring',   // April
  4: 'spring',   // May
  5: 'summer',   // June
  6: 'summer',   // July
  7: 'summer',   // August
  8: 'autumn',   // September
  9: 'autumn',   // October
  10: 'autumn',  // November
  11: 'winter',  // December
};

describe('computeSeason — Property Tests', () => {
  it('maps every date to the correct season based on month', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date(2000, 0, 1), max: new Date(2099, 11, 31) }),
        (date: Date) => {
          const result = computeSeason(date);
          const expected = MONTH_TO_SEASON[date.getMonth()];
          expect(result).toBe(expected);
        },
      ),
      { numRuns: 500 },
    );
  });

  it('returns the same season for any two dates in the same month', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1, max: 28 }),
        fc.integer({ min: 1, max: 28 }),
        fc.integer({ min: 2000, max: 2099 }),
        (month: number, day1: number, day2: number, year: number) => {
          const date1 = new Date(year, month, day1);
          const date2 = new Date(year, month, day2);
          expect(computeSeason(date1)).toBe(computeSeason(date2));
        },
      ),
      { numRuns: 200 },
    );
  });

  it('always returns one of the four valid seasons', () => {
    const validSeasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
    fc.assert(
      fc.property(
        fc.date({ min: new Date(2000, 0, 1), max: new Date(2099, 11, 31) }),
        (date: Date) => {
          expect(validSeasons).toContain(computeSeason(date));
        },
      ),
      { numRuns: 200 },
    );
  });
});
