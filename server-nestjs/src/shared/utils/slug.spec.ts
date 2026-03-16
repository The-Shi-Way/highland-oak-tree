import { generateSlug } from './slug';

describe('generateSlug', () => {
  it('converts a simple title to a lowercase hyphenated slug', () => {
    expect(generateSlug('Hello World', [])).toBe('hello-world');
  });

  it('strips special characters', () => {
    expect(generateSlug('Hello, World! @2024', [])).toBe('hello-world-2024');
  });

  it('collapses multiple hyphens', () => {
    expect(generateSlug('Hello---World', [])).toBe('hello-world');
    expect(generateSlug('Hello   World', [])).toBe('hello-world');
  });

  it('trims leading and trailing hyphens', () => {
    expect(generateSlug('-Hello World-', [])).toBe('hello-world');
  });

  it('truncates to 250 characters', () => {
    const longTitle = 'a'.repeat(300);
    const slug = generateSlug(longTitle, []);
    expect(slug.length).toBeLessThanOrEqual(250);
  });

  it('appends numeric suffix when slug already exists', () => {
    expect(generateSlug('Hello World', ['hello-world'])).toBe('hello-world-1');
  });

  it('increments suffix until unique', () => {
    const existing = ['hello-world', 'hello-world-1', 'hello-world-2'];
    expect(generateSlug('Hello World', existing)).toBe('hello-world-3');
  });

  it('returns "untitled" for empty or whitespace-only titles', () => {
    expect(generateSlug('', [])).toBe('untitled');
    expect(generateSlug('   ', [])).toBe('untitled');
  });

  it('returns "untitled" for titles with only special characters', () => {
    expect(generateSlug('!!!@@@###', [])).toBe('untitled');
  });

  it('handles unicode by stripping non-ascii', () => {
    const slug = generateSlug('Café Résumé', []);
    expect(slug).toBe('caf-rsum');
  });
});
