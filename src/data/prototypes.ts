/**
 * Prototype directory data for the hub landing page.
 * Categories: Working (e2e prototypes), Resources (component library, TXN list, etc.), Archived.
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
    description:
      'Products ↔ capabilities mesh plus UAD status-signal playground (config → signal → groups)',
    branch: 'capability-explorer-v0',
    owner: '@courtneyb',
    status: 'In progress',
    lastUpdated: 'Apr 22, 2026',
    url: 'https://stripe-network-git-capability-explorer-v0.vercelapp.stripe.dev/capability-explorer',
  },
  {
    id: 'component-library',
    category: 'resources',
    name: 'Component library',
    description: 'Shared components and patterns.',
    branch: 'main',
    owner: '@courtneyb',
    status: 'In progress',
    lastUpdated: 'Feb 24, 2025, 2:30 PM',
    url: '/components',
  },
  // Transactions list hidden for now to avoid confusion; add back when ready.
]

export const PROTOTYPES: PrototypeRow[] = PROTOTYPES_ALL
