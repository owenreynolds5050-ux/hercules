/**
 * String utilities
 * Reusable helpers for slug generation and search normalization.
 */

/**
 * Converts a string into a URL-friendly slug.
 */
export const slugify = (value: string): string => {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug.length > 0 ? slug : 'item';
};

/**
 * Produces a cleaned string optimized for text search comparisons.
 */
export const normalizeSearchText = (value: string): string => {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};
