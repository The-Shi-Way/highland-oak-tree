import * as fc from 'fast-check';
import { generateSlug } from './slug';

/**
 * Feature: living-tree-redesign, Property 4: Slug uniqueness across all Leaves
 * **Validates: Requirements 1.5, 2.7**
 */

describe('generateSlug — Property Tests', () => {
  it('always produces a URL-safe slug (lowercase alphanumeric and hyphens only)', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 200 }), (title: string) => {
        const slug = generateSlug(title, []);
        expect(slug).toMatch(/^[a-z0-9-]+$/);
      }),
      { numRuns: 300 },
    );
  });

  it('never collides with existing slugs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 20 }),
        (title: string, existingSlugs: string[]) => {
          const slug = generateSlug(title, existingSlugs);
          expect(existingSlugs).not.toContain(slug);
        },
      ),
      { numRuns: 300 },
    );
  });

  it('produces slugs no longer than 250 characters (plus possible suffix)', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 500 }), (title: string) => {
        const slug = generateSlug(title, []);
        // Base is capped at 250, suffix adds at most ~5 chars
        expect(slug.length).toBeLessThanOrEqual(260);
      }),
      { numRuns: 200 },
    );
  });

  it('is deterministic — same input always produces same output', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
        (title: string, existingSlugs: string[]) => {
          const slug1 = generateSlug(title, existingSlugs);
          const slug2 = generateSlug(title, existingSlugs);
          expect(slug1).toBe(slug2);
        },
      ),
      { numRuns: 200 },
    );
  });
});
