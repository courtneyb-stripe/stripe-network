/**
 * Prototype directory data for the hub landing page.
 * Categories: M0 (e2e prototype), Resources (component library, TXN list, etc.), Archived.
 * Only entries in this list appear in the directory; branches other than main are not published
 * here unless added to PROTOTYPES (no automatic branch discovery).
 *
 * Hub currently shows only the onsite-ia-rev branch. Set VITE_HUB_BRANCH at build time to
 * override (e.g. empty or "main" to show all); when unset, only onsite-ia-rev is shown.
 *
 * Note: lastUpdated is static — it is not tied to real git push events. Update it manually when
 * you push, or add a build step / API that sets it from e.g. git log or GitHub branch API.
 */

export type PrototypeCategory = 'm0' | 'resources' | 'archived'

export type PrototypeRow = {
  id: string
  category: PrototypeCategory
  name: string
  description: string
  branch: string
  owner: string
  /** Display-only; currently manual. Does not reflect actual push time unless you wire it to git/API. */
  lastUpdated: string
  /** Internal path (e.g. /network) or full URL for branch preview */
  url: string
}

const PROTOTYPES_ALL: PrototypeRow[] = [
  {
    id: 'network-wip',
    category: 'm0',
    name: 'Network WIP',
    description: 'Main Network prototype branch.',
    branch: 'main',
    owner: '@courtneyb',
    lastUpdated: 'Feb 24, 2025, 2:34 PM',
    url: '/network',
  },
  {
    id: 'onsite-ia-rev',
    category: 'm0',
    name: 'Network (onsite IA rev)',
    description: 'Onsite IA revision of the Network prototype.',
    branch: 'onsite-ia-rev',
    owner: '@courtneyb',
    lastUpdated: 'Feb 25, 2025',
    url: '/network',
  },
  {
    id: 'component-library',
    category: 'resources',
    name: 'Component library',
    description: 'Shared components and patterns.',
    branch: 'main',
    owner: '@courtneyb',
    lastUpdated: 'Feb 24, 2025, 2:30 PM',
    url: '/components',
  },
  // Transactions list hidden for now to avoid confusion; add back when ready.
]

const HUB_BRANCH = typeof import.meta.env !== 'undefined' && (import.meta.env as { VITE_HUB_BRANCH?: string }).VITE_HUB_BRANCH
/** Show only this branch on the hub. Default: onsite-ia-rev. Set VITE_HUB_BRANCH to "" or "all" to show all. */
const BRANCH_FILTER = HUB_BRANCH === '' || HUB_BRANCH === 'all' ? null : (HUB_BRANCH || 'onsite-ia-rev')

export const PROTOTYPES: PrototypeRow[] = BRANCH_FILTER
  ? PROTOTYPES_ALL.filter((r) => r.branch === BRANCH_FILTER)
  : PROTOTYPES_ALL
