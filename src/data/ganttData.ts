import andreyAvatarSrc from '../assets/avatars/andrey.png'
import courtneyAvatarSrc from '../assets/avatars/courtney.jpeg'
import traceyAvatarSrc from '../assets/avatars/tracey.jpeg'

export type WorkstreamStatus =
  | 'not started'
  | 'in progress'
  | 'at risk'
  | 'blocked'
  | 'completed'
  | 'paused'

export type MarkerType = 'review' | 'handoff'

export interface Phase {
  id: string
  label: string
  start: string
  end: string
  status: WorkstreamStatus
  /** Shown in the phase detail panel under the workstream name. */
  description?: string
}

export interface Workstream {
  id: string
  name: string
  group: string
  dri: string
  priority: string
  size: string
  status: WorkstreamStatus
  first_milestone: string
  ga_milestone: string
  kickoff: string
  doc_url: string
  /**
   * When set (YYYY-MM-DD), ends the in-progress solid bar on this date instead of the last marker
   * or Dec 31. Optional planning override.
   */
  timeline_end?: string
  /** Detail panel copy under the workstream title (max two lines in the panel). */
  description?: string
  /** Optional delivery phases (Gantt expand demo). */
  phases?: Phase[]
}

/**
 * Vite-resolved image URL for roadmap DRI avatars (`src/assets/avatars/*`).
 * Mapping: grabelnikov → andrey.png, courtneyb → courtney.jpeg, traceyv → tracey.jpeg.
 */
export function ganttAvatarSrcForDri(dri: string): string | undefined {
  const h = dri.replace(/^@/, '').trim().toLowerCase()
  if (!h || h === 'tbd' || h === 'cameronsagey') return undefined
  if (h === 'grabelnikov') return andreyAvatarSrc
  if (h === 'courtneyb') return courtneyAvatarSrc
  if (h === 'traceyv') return traceyAvatarSrc
  return undefined
}

/** Initials for avatar fallback: first two characters of handle, uppercased. */
export function ganttAvatarHandleInitials(dri: string): string {
  const t = dri.replace(/^@/, '').trim()
  if (!t || t.toLowerCase() === 'tbd') return '?'
  return t.slice(0, 2).toUpperCase()
}

export interface Milestone {
  milestone: string
  release_date: string
  configs: string
  status: WorkstreamStatus
}

/** UI label for roadmap milestone keys (e.g. sidebar, timeline). */
export function milestoneDisplayLabel(milestone: string): string {
  return milestone.trim()
}

export interface Marker {
  workstream_id: string
  date: string
  label: string
  type: MarkerType
}

export const workstreams: Workstream[] = [
  {
    id: 'uad-header',
    name: 'UAD — account status (header)',
    description:
      'Lifecycle and product status signals in the account header, aligned to the UAD hierarchy.',
    group: 'UAD',
    dri: 'grabelnikov',
    priority: 'P0',
    size: 'M',
    status: 'in progress',
    first_milestone: 'M1.5',
    ga_milestone: 'GA',
    kickoff: '2026-04-06',
    doc_url: '',
  },
  {
    id: 'uad-composition',
    name: 'Unified account detail template',
    description:
      'Establish the IA, interaction patterns, and design template for the unified account detail page across all account configurations and milestones.',
    group: 'UAD',
    dri: 'courtneyb',
    priority: 'P0',
    size: 'L',
    status: 'in progress',
    first_milestone: 'M2.5',
    ga_milestone: 'GA',
    kickoff: '2026-02-25',
    doc_url: '',
    phases: [
      {
        id: 'uad-phase-1',
        label: 'Phase 1 — IA Foundations',
        start: '2026-02-25',
        end: '2026-04-13',
        status: 'completed',
      },
      {
        id: 'uad-phase-2',
        label: 'Phase 2 — Merchant, Customer, Recipient',
        start: '2026-04-14',
        end: '2026-08-14',
        status: 'in progress',
      },
      {
        id: 'uad-phase-3',
        label: 'Phase 3 — Storer, Cardholder, Borrower + Profiles',
        start: '2026-08-15',
        end: '2026-10-15',
        status: 'not started',
      },
      {
        id: 'uad-phase-4',
        label: 'Phase 4 — Orgs + full coverage',
        start: '2026-10-16',
        end: '2026-11-30',
        status: 'not started',
      },
    ],
  },
  {
    id: 'uad-settings',
    name: 'UAD — settings',
    description: 'Entry points, IA, and states for Network settings tied to the UAD shell.',
    group: 'UAD',
    dri: 'courtneyb',
    priority: 'P0',
    size: '—',
    status: 'not started',
    first_milestone: 'M2.5',
    ga_milestone: 'GA',
    kickoff: '2026-07-01',
    doc_url: '',
  },
  {
    id: 'unified-account-list',
    name: 'Unified account list',
    description: 'Save views, filters, and performance for the primary Network browse experience.',
    group: 'Network list',
    dri: 'cameronsagey',
    priority: 'P0',
    size: '—',
    status: 'in progress',
    first_milestone: 'M0',
    ga_milestone: 'GA',
    kickoff: '2026-08-01',
    doc_url: '',
  },
  {
    id: 'uad-financial-summary',
    name: 'UAD — account financial summary',
    description: 'Balances, cash movement summaries, and account-level financial reads in UAD.',
    group: 'UAD',
    dri: 'courtneyb',
    priority: 'P0',
    size: 'M',
    status: 'in progress',
    first_milestone: 'M3',
    ga_milestone: 'GA',
    kickoff: '2026-05-08',
    timeline_end: '2026-08-30',
    doc_url: '',
  },
  {
    id: 'network-unified-identity',
    name: 'Network unified identity',
    description: 'Stripe account vs platform user identity model across Network surfaces.',
    group: 'Identity',
    dri: 'traceyv',
    priority: 'P0',
    size: 'M',
    status: 'in progress',
    first_milestone: 'M1',
    ga_milestone: 'GA',
    kickoff: '2026-04-13',
    timeline_end: '2026-09-01',
    doc_url: '',
    phases: [
      {
        id: 'nui-phase-1',
        label: 'Phase 1',
        start: '2026-04-13',
        end: '2026-04-30',
        status: 'completed',
        description:
          'Bring together merchant (CAD detail) + customer (Customer detail) account details on the M0 unified detail page, with no changes to content or editing experience.',
      },
      {
        id: 'nui-phase-2',
        label: 'Phase 2',
        start: '2026-05-01',
        end: '2026-08-01',
        status: 'in progress',
        description:
          'Bring together content attributes from CAD, customer, and recipient with support for Business Profiles. Includes editing workflows.',
      },
      {
        id: 'nui-phase-3',
        label: 'Phase 3',
        start: '2026-08-02',
        end: '2026-09-01',
        status: 'not started',
        description:
          'A clear strategy for how UAD interacts with Link profile, and org-specific account information.',
      },
    ],
  },
  {
    id: 'network-terminology',
    name: 'Network terminology',
    description: 'Voice, labels, and glossary alignment for agents and operators.',
    group: 'Identity',
    dri: 'traceyv',
    priority: 'P0',
    size: '—',
    status: 'not started',
    first_milestone: 'M0',
    ga_milestone: 'GA',
    kickoff: '',
    doc_url: '',
    phases: [
      {
        id: 'term-phase-1',
        label: 'Phase 1 — Core naming + account terminology',
        start: '2026-04-13',
        end: '2026-07-15',
        status: 'in progress',
      },
      {
        id: 'term-phase-2',
        label: 'Phase 2 — Identity object terminology',
        start: '2026-07-16',
        end: '2026-10-15',
        status: 'not started',
      },
      {
        id: 'term-phase-3',
        label: 'Phase 3 — Full coverage + GA',
        start: '2026-10-16',
        end: '2026-12-30',
        status: 'not started',
      },
    ],
  },
  {
    id: 'onboarding-education',
    name: 'Onboarding education',
    description: 'First-run guidance and contextual education for new Network users.',
    group: 'Onboarding',
    dri: 'traceyv',
    priority: 'P0',
    size: '—',
    status: 'not started',
    first_milestone: 'M1',
    ga_milestone: 'GA',
    kickoff: '2026-10-01',
    doc_url: '',
  },
  {
    id: 'network-org-level',
    name: 'Network @ org-level',
    description: 'Org-scoped rollup and permissions outside a single connected account.',
    group: 'Identity',
    dri: '',
    priority: 'P1',
    size: 'S',
    status: 'not started',
    first_milestone: 'GA',
    ga_milestone: 'GA',
    kickoff: '2026-09-01',
    doc_url: '',
  },
  {
    id: 'compliance-remediation',
    name: 'Network — compliance remediation',
    description: 'Risk, restrictions, and remediation flows with Compliance partners.',
    group: 'Compliance',
    dri: 'grabelnikov',
    priority: 'P2+',
    size: 'M',
    status: 'not started',
    first_milestone: '—',
    ga_milestone: '—',
    kickoff: '2026-06-01',
    doc_url: '',
  },
  {
    id: 'capability-management',
    name: 'UAD — capability management',
    description: 'Cross-sell and attach patterns for capabilities from account context.',
    group: 'UAD',
    dri: 'grabelnikov',
    priority: 'P2+',
    size: 'M',
    status: 'not started',
    first_milestone: '—',
    ga_milestone: '—',
    kickoff: '2026-07-01',
    doc_url: '',
  },
]

export const milestones: Milestone[] = [
  {
    milestone: 'M0',
    release_date: '2026-07-15',
    configs: 'Merchant, Customer',
    status: 'in progress',
  },
  {
    milestone: 'M0.5',
    release_date: '2026-07-30',
    configs: 'Merchant, Customer',
    status: 'not started',
  },
  {
    milestone: 'M1',
    release_date: '2026-08-14',
    configs: 'Merchant, Customer, Recipient',
    status: 'not started',
  },
  {
    milestone: 'M1.5',
    release_date: '2026-08-14',
    configs: 'Merchant, Customer',
    status: 'not started',
  },
  {
    milestone: 'M2',
    release_date: '2026-09-29',
    configs: 'Recipient',
    status: 'not started',
  },
  {
    milestone: 'M2.5',
    release_date: '2026-10-15',
    configs: 'Recipient, Settings',
    status: 'not started',
  },
  {
    milestone: 'M3',
    release_date: '2026-11-14',
    configs: 'Storer, Cardholder, Borrower',
    status: 'not started',
  },
  {
    milestone: 'M3.5',
    release_date: '2026-11-29',
    configs: 'Storer, Cardholder, Borrower',
    status: 'not started',
  },
  {
    milestone: 'GA',
    release_date: '2026-12-30',
    configs: 'All + Orgs',
    status: 'not started',
  },
  {
    milestone: 'GA+',
    release_date: '',
    configs: 'Business Profiles',
    status: 'not started',
  },
]

/** Empty, em dash, or whitespace — not a milestone gate on the roadmap. */
export function milestoneKeyInvalid(key: string): boolean {
  const t = key.trim()
  return !t || t === '—'
}

const MILESTONE_ROW_INDEX_BY_KEY: ReadonlyMap<string, number> = new Map(
  milestones.map((row, i) => [row.milestone.trim(), i]),
)

function parseYmdData(ymd: string): Date | null {
  const t = ymd.trim()
  if (!t) return null
  const [y, mo, d] = t.split('-').map(Number)
  if (!y || !mo || !d) return null
  return new Date(y, mo - 1, d, 12, 0, 0, 0)
}

function formatDisplayDateData(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function milestoneRowForKey(key: string): Milestone | undefined {
  const k = key.trim()
  return milestones.find((m) => m.milestone.trim() === k)
}

/** `M2.5 · Oct 15, 2026` or gate label only when `release_date` is empty. */
export function formatMilestoneKeyWithRelease(milestoneKey: string): string {
  const row = milestoneRowForKey(milestoneKey)
  if (!row) return milestoneDisplayLabel(milestoneKey)
  const label = row.milestone.trim()
  const d = parseYmdData(row.release_date)
  if (!d) return label
  return `${label} · ${formatDisplayDateData(d)}`
}

/**
 * When `kickoff` is empty, derive YYYY-MM-DD as first milestone release minus 30 days (local calendar).
 * Does not overwrite a non-empty `kickoff`.
 */
export function resolveKickoff(ws: Workstream): string {
  if (ws.kickoff.trim()) return ws.kickoff
  if (milestoneKeyInvalid(ws.first_milestone)) return ''
  const row = milestoneRowForKey(ws.first_milestone.trim())
  if (!row?.release_date?.trim()) return ''
  const base = parseYmdData(row.release_date)
  if (!base) return ''
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12, 0, 0, 0)
  d.setDate(d.getDate() - 30)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

export function milestoneSortIndex(key: string): number {
  const i = milestones.findIndex((m) => m.milestone.trim() === key.trim())
  return i === -1 ? 999 : i
}

/** Milestone plan table: streams whose first gate is this milestone row. */
export function workstreamsWithFirstMilestoneKey(milestoneKey: string): Workstream[] {
  const k = milestoneKey.trim()
  return workstreams
    .filter((ws) => ws.first_milestone.trim() === k)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

/**
 * Inclusive [first_milestone … ga_milestone] row indices in `milestones` order.
 * Used by the milestone plan drawer and “view by milestone” so streams that span
 * multiple gates appear under every column they touch (aligned to planning fields,
 * same keys as timeline milestone lines).
 */
export function workstreamMilestoneSpan(ws: Workstream): { lo: number; hi: number } | null {
  const last = milestones.length - 1
  const firstInv = milestoneKeyInvalid(ws.first_milestone)
  const gaInv = milestoneKeyInvalid(ws.ga_milestone)
  const rawFirst = ws.first_milestone.trim()
  const rawGa = ws.ga_milestone.trim()
  let lo = firstInv ? null : (MILESTONE_ROW_INDEX_BY_KEY.get(rawFirst) ?? null)
  let hi = gaInv ? null : (MILESTONE_ROW_INDEX_BY_KEY.get(rawGa) ?? null)
  if (lo == null && hi == null) return null
  if (lo == null) lo = 0
  if (hi == null) hi = last
  if (lo > hi) {
    const t = lo
    lo = hi
    hi = t
  }
  return { lo, hi }
}

export function workstreamTouchesMilestoneAtRowIndex(ws: Workstream, rowIndex: number): boolean {
  const s = workstreamMilestoneSpan(ws)
  if (!s) return false
  return rowIndex >= s.lo && rowIndex <= s.hi
}

export function workstreamsForMilestoneRowIndex(rowIndex: number): Workstream[] {
  return workstreams
    .filter((ws) => workstreamTouchesMilestoneAtRowIndex(ws, rowIndex))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

/** Milestones whose `release_date` falls within the phase window (inclusive), YYYY-MM-DD string order. */
export function getPhaseMilestones(phase: Phase): Milestone[] {
  return milestones.filter((m) => {
    if (!m.release_date?.trim()) return false
    return m.release_date >= phase.start && m.release_date <= phase.end
  })
}

/**
 * Timeline / drawer copy for a marker: remove a leading month+day prefix when present
 * (the real date is shown separately). E.g. "June 2 regional crit" → "Regional crit".
 */
export function markerDisplayLabel(label: string): string {
  const t = label.trim()
  const month =
    '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
  const re = new RegExp(`^${month}\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+`, 'i')
  const stripped = t.replace(re, '').trim()
  if (!stripped) return t
  if (stripped === t) return t
  return stripped.charAt(0).toUpperCase() + stripped.slice(1)
}

export const markers: Marker[] = [
  { workstream_id: 'uad-header', date: '2026-04-28', label: 'Local crit', type: 'review' },
  { workstream_id: 'uad-header', date: '2026-05-07', label: 'Local crit', type: 'review' },
  { workstream_id: 'uad-header', date: '2026-05-08', label: 'Regional crit', type: 'review' },
  { workstream_id: 'uad-header', date: '2026-06-30', label: 'M1.5 handoff', type: 'handoff' },
  { workstream_id: 'uad-composition', date: '2026-02-26', label: 'Stakeholder review', type: 'review' },
  { workstream_id: 'uad-composition', date: '2026-03-13', label: 'Local crit', type: 'review' },
  { workstream_id: 'uad-composition', date: '2026-03-16', label: 'ER sessions review', type: 'review' },
  { workstream_id: 'uad-composition', date: '2026-03-26', label: 'Stakeholder review', type: 'review' },
  { workstream_id: 'uad-composition', date: '2026-04-13', label: 'M0 handoff', type: 'handoff' },
  { workstream_id: 'uad-composition', date: '2026-06-02', label: 'Regional crit', type: 'review' },
  { workstream_id: 'uad-composition', date: '2026-06-28', label: 'Local crit', type: 'review' },
  { workstream_id: 'uad-composition', date: '2026-07-31', label: 'GA handoff', type: 'handoff' },
  { workstream_id: 'unified-account-list', date: '2026-04-24', label: 'M0 handoff', type: 'handoff' },
  { workstream_id: 'uad-financial-summary', date: '2026-06-02', label: 'Regional crit', type: 'review' },
  { workstream_id: 'uad-financial-summary', date: '2026-06-28', label: 'Local crit', type: 'review' },
]

/** DRI column / sidebar: `—` when unset or legacy `tbd`; otherwise `@handle`. */
export function formatDriLabel(dri: string): string {
  const core = dri.replace(/^@/, '').trim()
  if (!core || core.toLowerCase() === 'tbd') return '—'
  const t = dri.trim()
  return t.startsWith('@') ? t : `@${core}`
}

/** Sentence case for UI (e.g. "In progress", "Not started"). */
export function formatWorkstreamStatusLabel(status: WorkstreamStatus): string {
  const lower = status.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}
