/** Status chip on light panels: lightest ramp (`pill`) fill + darkest (`stop`) label for contrast. */
export function statusPillColors(tones: {
  bar: string
  track: string
  stop: string
  pill: string
}): {
  backgroundColor: string
  color: string
} {
  return {
    backgroundColor: tones.pill,
    color: tones.stop,
  }
}
