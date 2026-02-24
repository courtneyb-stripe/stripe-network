/**
 * Prototype directory data for the hub landing page.
 * Categories: M0 (e2e prototype), Resources (component library, TXN list, etc.), Archived.
 */

export type PrototypeCategory = 'm0' | 'resources' | 'archived'

export type PrototypeRow = {
  id: string
  category: PrototypeCategory
  name: string
  branch: string
  owner: string
  lastUpdated: string
  /** Internal path (e.g. /network) or full URL for branch preview */
  url: string
}

export const PROTOTYPES: PrototypeRow[] = [
  {
    id: 'network-wip',
    category: 'm0',
    name: 'Network WIP',
    branch: 'main',
    owner: '@courtneyb',
    lastUpdated: 'Feb 24, 2025, 2:34 PM',
    url: '/network',
  },
  {
    id: 'component-library',
    category: 'resources',
    name: 'Component library',
    branch: 'main',
    owner: '@courtneyb',
    lastUpdated: 'Feb 24, 2025, 2:30 PM',
    url: '/components',
  },
  // Transactions list hidden for now to avoid confusion; add back when ready.
]
