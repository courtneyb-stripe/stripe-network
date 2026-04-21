/**
 * Split gutter bleed like `-mx-6 px-6` into outer pull-out margin + inner horizontal padding
 * so shells can paint border/background full column width while content stays inset.
 */
export function parseGutterBleed(
  bleedClassName?: string
): { marginClass: string; paddingClass: string } | null {
  if (!bleedClassName?.trim()) return null
  const parts = bleedClassName.trim().split(/\s+/).filter(Boolean)
  const marginClass = parts.filter((p) => /^-mx-/.test(p)).join(' ')
  const paddingClass = parts.filter((p) => /^px-/.test(p)).join(' ')
  if (!marginClass) return null
  return { marginClass, paddingClass: paddingClass || 'px-0' }
}
