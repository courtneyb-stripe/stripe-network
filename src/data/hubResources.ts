/**
 * Resources directory for /resources — grouped links (Design hub).
 * Merges prototype `resources` category rows with curated internal + external links.
 */

import { PROTOTYPES, type PrototypeRow } from './prototypes'

export type HubResourceLink = {
  id: string
  title: string
  description: string
  href: string
  external?: boolean
}

export type HubResourceGroup = {
  id: string
  label: string
  links: HubResourceLink[]
}

function prototypeToLink(row: PrototypeRow): HubResourceLink {
  const external = row.url.startsWith('http')
  return {
    id: row.id,
    title: row.name,
    description: row.description,
    href: row.url.startsWith('http') ? row.url : row.url,
    external,
  }
}

const CURATED: HubResourceGroup[] = [
  {
    id: 'design-system',
    label: 'Design system',
    links: [
      {
        id: 'components',
        title: 'Component inventory',
        description: 'Shared UI patterns and states in this repo',
        href: '/components',
        external: false,
      },
      {
        id: 'gantt',
        title: 'Design Roadmap to Network GA',
        description: 'Workstreams, milestones, and markers on the path to Network GA',
        href: '/gantt',
        external: false,
      },
    ],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    links: [
      {
        id: 'capability-explorer',
        title: 'Capability explorer',
        description: 'Mesh of product-shaped capability groupings',
        href: '/capability-explorer',
        external: false,
      },
      {
        id: 'network-list',
        title: 'Network list',
        description: 'Browse accounts and capability coverage',
        href: '/network',
        external: false,
      },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    links: [
      {
        id: 'transactions',
        title: 'Transactions',
        description: 'Global transaction list prototype',
        href: '/transactions',
        external: false,
      },
    ],
  },
  {
    id: 'external',
    label: 'External',
    links: [
      {
        id: 'slack',
        title: 'Slack — dashboard customer detail',
        description: '#proj-dashboard-customer-detail-extended',
        href: 'https://join.slack.com/share/enQtMTA1NjkwNjA4NjU0NTktNmEyMzdiNGY1OGQ4NDBhOWJkMjFhYTdkNzEyOTJiNzBiYmE3ZGJkYTVhZDM5MmI4MWE1MWZmYWQxOWMxMGJmMQ',
        external: true,
      },
    ],
  },
]

export function getHubResourceGroups(): HubResourceGroup[] {
  const fromPrototypes = PROTOTYPES.filter((p) => p.category === 'resources').map(prototypeToLink)
  const merged: HubResourceGroup[] = CURATED.map((g) => ({ ...g, links: [...g.links] }))
  if (fromPrototypes.length > 0) {
    const eng = merged.find((x) => x.id === 'engineering')
    if (eng) eng.links = [...fromPrototypes, ...eng.links]
  }
  return merged
}
