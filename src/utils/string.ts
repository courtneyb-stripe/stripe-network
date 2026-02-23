/**
 * String utilities for display formatting.
 */

/** Decode URL slug to display name (e.g. toybox-labs → Toybox Labs). */
export function slugToDisplayName(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
