/**
 * Generates a URL-safe slug from a title.
 * Appends a numeric suffix when a duplicate slug exists.
 * Requirement 2.7
 */
export function generateSlug(title: string, existingSlugs: string[]): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 250);

  // If base is empty after sanitization, use a fallback
  const safeBase = base || 'untitled';

  if (!existingSlugs.includes(safeBase)) return safeBase;

  let suffix = 1;
  while (existingSlugs.includes(`${safeBase}-${suffix}`)) {
    suffix++;
  }
  return `${safeBase}-${suffix}`;
}
