/**
 * Network parent list (`/network`) — audience segments as primary tabs + browse routes.
 * Inline lists on account detail use nested routes under `/network/:id/directory/...`.
 */

export type NetworkTabId =
  | 'all'
  | 'merchants'
  | 'customers'
  | 'recipients'
  | 'global-recipients'
  | 'storers'
  | 'borrowers'
  | 'card-issuers'

/** Primary Network list tabs — order matches IA (overflow row like Transactions). */
export const NETWORK_PAGE_TABS: { id: NetworkTabId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'merchants', label: 'Merchants' },
  { id: 'customers', label: 'Customers' },
  { id: 'recipients', label: 'Recipients' },
  { id: 'global-recipients', label: 'Global recipients' },
  { id: 'storers', label: 'Storers' },
  { id: 'borrowers', label: 'Borrowers' },
  { id: 'card-issuers', label: 'Card issuers' },
]

/** Parent list always shows the full audience tab row when rendered. */
export const NETWORK_MERCHANT_AUDIENCE_ENABLED = true

/** Demo: show Card holders segment on account hub directory when issuing is enabled (Configure hook later). */
export const NETWORK_CARD_ISSUER_DEMO = true

/** Saved-view chip row is only **All** + **⋯** (no status strip). */
export function networkListUsesSimplifiedSecondaryFilters(tab: NetworkTabId): boolean {
  return (
    tab === 'recipients' ||
    tab === 'global-recipients' ||
    tab === 'storers' ||
    tab === 'borrowers' ||
    tab === 'card-issuers'
  )
}

export function browsePathForAudience(id: NetworkTabId): string {
  if (id === 'all') return '/network'
  return `/network/browse/${id}`
}

export function browseAudienceFromPath(segment: string | undefined): NetworkTabId {
  if (segment == null || segment === '') return 'all'
  if (segment === 'card-holders') return 'card-issuers'
  const browseTabs: NetworkTabId[] = [
    'merchants',
    'customers',
    'recipients',
    'global-recipients',
    'storers',
    'borrowers',
    'card-issuers',
  ]
  return (browseTabs as string[]).includes(segment) ? (segment as NetworkTabId) : 'all'
}
