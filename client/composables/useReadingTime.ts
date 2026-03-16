const WORDS_PER_MINUTE = 230;

/**
 * Estimates reading time from text content or a word count.
 * Returns a human-friendly string like "3 min read".
 */
export function estimateReadingTime(input: string | number): string {
  const wordCount = typeof input === 'number'
    ? input
    : input.trim().split(/\s+/).filter(Boolean).length;

  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

/**
 * Extracts plain text from a TipTap JSON body for word counting.
 */
export function extractTextFromTiptap(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  try {
    return JSON.stringify(body)
      .replace(/"type":"[^"]*"/g, '')
      .replace(/"attrs":\{[^}]*\}/g, '')
      .replace(/[{}\[\]",]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}
