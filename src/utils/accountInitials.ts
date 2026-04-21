/**
 * Derive up to two initials from an account / legal display name (not a separate “heading” override).
 */
export function accountNameInitials(accountName: string): string {
  const t = accountName.replace(/[–—]/g, ' ').trim()
  if (!t || t === '—') return '?'
  const words = t.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w))
  if (words.length >= 2) {
    const a = words[0].match(/[a-z0-9]/i)?.[0] ?? ''
    const b = words[1].match(/[a-z0-9]/i)?.[0] ?? ''
    const pair = (a + b).toUpperCase()
    return pair || '?'
  }
  const w = words[0] ?? t
  const letters = w.replace(/[^a-z0-9]/gi, '')
  if (letters.length >= 2) return letters.slice(0, 2).toUpperCase()
  if (letters.length === 1) return letters.toUpperCase()
  return '?'
}
