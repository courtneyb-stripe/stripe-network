/**
 * Prototype directory data for the hub landing page.
 * Categories: Working (e2e prototypes), Resources (e.g. TXN list when enabled), Archived.
 * Only entries in this list appear in the directory; branches other than main are not published
 * here unless added to PROTOTYPES (no automatic branch discovery).
 *
 * Note: lastUpdated is static — it is not tied to real git push events. Update it manually when
 * you push, or add a build step / API that sets it from e.g. git log or GitHub branch API.
 */

export type PrototypeCategory = 'working' | 'resources' | 'archived'

export type PrototypeRow = {
  id: string
  category: PrototypeCategory
  name: string
  description: string
  branch: string
  owner: string
  status: string
  /** Display-only; currently manual. Does not reflect actual push time unless you wire it to git/API. */
  lastUpdated: string
  /** Internal path (e.g. /network) or full URL for branch preview */
  url: string
  /** Optional Figma file / frame link for hub cards */
  figmaUrl?: string
  /** Optional brief / doc link (internal or external) */
  briefUrl?: string
}

const PROTOTYPES_ALL: PrototypeRow[] = [
  {
    id: 'network-wip',
    category: 'archived',
    name: 'Network WIP',
    description: 'Main Network prototype branch.',
    branch: 'main',
    owner: '@courtneyb',
    status: 'In progress',
    lastUpdated: 'Feb 24, 2025, 2:34 PM',
    url: 'https://stripe-network-midnkg82u.vercelapp.stripe.dev/network',
  },
  {
    id: 'onsite-ia-rev',
    category: 'archived',
    name: 'Network (onsite IA rev)',
    description: 'Frozen onsite IA revision — reference only',
    branch: 'onsite-ia-rev',
    owner: '@courtneyb',
    status: 'Archived',
    lastUpdated: 'Feb 25, 2025',
    url: 'https://stripe-network-git-onsite-ia-rev.vercelapp.stripe.dev/network',
  },
  {
    id: 'pre-onsite-backup',
    category: 'archived',
    name: 'Network (pre-onsite backup)',
    description: 'Pre-onsite safety backup — reference only',
    branch: 'pre-onsite-backup',
    owner: '@courtneyb',
    status: 'Archived',
    lastUpdated: 'Feb 25, 2025',
    url: 'https://stripe-network-git-pre-onsite-backup.vercelapp.stripe.dev/network',
  },
  {
    id: 'network-detail-comp-model',
    category: 'archived',
    name: 'UAD status signals',
    description: 'Product status in account header',
    branch: 'network-detail-comp-model',
    owner: '@courtneyb',
    status: 'Archived',
    lastUpdated: 'May 5, 2026',
    url: 'https://stripe-network-git-network-detail-comp-model.vercelapp.stripe.dev/network',
  },
  {
    id: 'component-library',
    category: 'archived',
    name: 'Component library',
    description: 'Shared components and patterns — reference only',
    branch: 'main',
    owner: '@courtneyb',
    status: 'Archived',
    lastUpdated: 'May 5, 2026',
    url: '/components',
  },
  {
    id: 'account-detail-header',
    category: 'working',
    name: 'Account detail header',
    description: 'Header explorations for account detail',
    branch: 'account-detail-header',
    owner: '@courtneyb',
    status: 'In progress',
    lastUpdated: 'May 5, 2026',
    url: 'https://stripe-network-git-account-detail-header.vercelapp.stripe.dev/network',
  },
  {
    id: 'capability-explorer',
    category: 'working',
    name: 'Capability explorer',
    description: 'Mesh diagram of product-shaped capability groupings',
    branch: 'account-detail-header',
    owner: '@courtneyb',
    status: 'In progress',
    lastUpdated: 'May 5, 2026',
    url: 'https://stripe-network-git-account-detail-header.vercelapp.stripe.dev/capability-explorer',
  },
  {
    id: 'gantt-roadmap',
    category: 'working',
    name: 'Network design roadmap',
    description: 'Workstreams, milestones, and markers for Network design',
    branch: 'feature/gantt',
    owner: '@courtneyb',
    status: 'In progress',
    lastUpdated: 'May 19, 2026',
    url: '/gantt',
  },
  // Transactions list hidden for now to avoid confusion; add back when ready.
]

export const PROTOTYPES: PrototypeRow[] = PROTOTYPES_ALL
