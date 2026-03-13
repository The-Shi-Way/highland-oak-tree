import { Season } from '@shared/types';

/**
 * Pure function: computes the Season from a given Date.
 * Month indices (0-based): Mar-May → spring, Jun-Aug → summer,
 * Sep-Nov → autumn, Dec-Feb → winter.
 */
export function computeSeason(date: Date): Season {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}
