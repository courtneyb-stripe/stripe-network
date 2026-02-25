/**
 * String utilities for display formatting.
 */

/** Decode URL slug to display name (e.g. toybox-labs → Toybox Labs). */
export function slugToDisplayName(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Truncate at word boundary; append ellipsis if truncated. Used for action titles etc. to avoid mid-word cut. */
export function truncateAtWordBoundary(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  const slice = str.slice(0, maxLength - 3)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > maxLength * 0.5 ? lastSpace : slice.length
  return slice.slice(0, cut).trim() + '...'
}
