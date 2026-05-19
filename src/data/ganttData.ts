/** Public URL under `public/assets/avatars/` (served as `/assets/avatars/<file>`; see Vite `public/`). */
const avatar = (file: string) =>
  `${import.meta.env.BASE_URL}assets/avatars/${file}`.replace(/\/{2,}/g, '/')

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
  /** Public URL under `public/assets/avatars/` (see `avatar()` in this module). */
  avatar?: string
  /** Optional delivery phases (Gantt expand demo). */
  phases?: Phase[]
}

export interface Milestone {
  milestone: string
  release_date: string
}

/** UI label for roadmap milestone keys (e.g. sidebar, timeline). */
export function milestoneDisplayLabel(milestone: string): string {
  const t = milestone.trim()
  if (t === 'GA') return 'Last milestone'
  return milestone
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
    group: 'Core surfaces',
    dri: 'grabelnikov',
    priority: 'P0',
    size: 'M',
    status: 'in progress',
    first_milestone: 'M1.5',
    ga_milestone: 'GA',
    kickoff: '2026-04-06',
    doc_url: '',
    avatar: avatar('andrey.svg'),
  },
  {
    id: 'uad-composition',
    name: 'UAD — composition model',
    group: 'Core surfaces',
    dri: 'courtneyb',
    priority: 'P0',
    size: 'L',
    status: 'in progress',
    first_milestone: 'M2.5',
    ga_milestone: 'GA',
    kickoff: '2026-04-02',
    doc_url: '',
    avatar: avatar('courtney.svg'),
  },
  {
    id: 'uad-settings',
    name: 'UAD — settings',
    group: 'Core surfaces',
    dri: 'courtneyb',
    priority: 'P0',
    size: '—',
    status: 'not started',
    first_milestone: 'M2.5',
    ga_milestone: 'GA',
    kickoff: '2026-04-27',
    doc_url: '',
    avatar: avatar('courtney.svg'),
  },
  {
    id: 'unified-account-list',
    name: 'Unified account list',
    group: 'Core surfaces',
    dri: 'cameronsagey',
    priority: 'P0',
    size: '—',
    status: 'in progress',
    first_milestone: 'M0',
    ga_milestone: 'GA',
    kickoff: '',
    doc_url: '',
    avatar: avatar('cameron.svg'),
  },
  {
    id: 'uad-financial-summary',
    name: 'UAD — account financial summary',
    group: 'Financial',
    dri: 'courtneyb',
    priority: 'P0',
    size: 'M',
    status: 'in progress',
    first_milestone: 'M3',
    ga_milestone: 'GA',
    kickoff: '2026-05-08',
    doc_url: '',
    avatar: avatar('courtney.svg'),
  },
  {
    id: 'network-unified-identity',
    name: 'Network unified identity',
    group: 'Identity',
    dri: 'traceyv',
    priority: 'P0',
    size: 'M',
    status: 'in progress',
    first_milestone: 'M1',
    ga_milestone: 'GA',
    kickoff: '2026-04-13',
    doc_url: '',
    avatar: avatar('tracey.svg'),
    phases: [
      {
        id: 'nui-phase-1',
        label: 'Phase 1 — M0 → M1',
        start: '2026-04-13',
        end: '2026-06-26',
        status: 'completed',
      },
      {
        id: 'nui-phase-2',
        label: 'Phase 2 — M1 → M2.5',
        start: '2026-06-27',
        end: '2026-09-01',
        status: 'in progress',
      },
      {
        id: 'nui-phase-3',
        label: 'Phase 3 — M2.5 → GA',
        start: '2026-09-02',
        end: '2026-12-01',
        status: 'not started',
      },
    ],
  },
  {
    id: 'network-terminology',
    name: 'Network terminology',
    group: 'Identity',
    dri: 'traceyv',
    priority: 'P0',
    size: '—',
    status: 'not started',
    first_milestone: '—',
    ga_milestone: 'GA',
    kickoff: '',
    doc_url: '',
    avatar: avatar('tracey.svg'),
  },
  {
    id: 'onboarding-education',
    name: 'Onboarding education',
    group: 'Identity',
    dri: 'traceyv',
    priority: 'P0',
    size: '—',
    status: 'not started',
    first_milestone: 'M1',
    ga_milestone: 'GA',
    kickoff: '',
    doc_url: '',
    avatar: avatar('tracey.svg'),
  },
  {
    id: 'network-org-level',
    name: 'Network @ org-level',
    group: 'Identity',
    dri: 'tbd',
    priority: 'P1',
    size: 'S',
    status: 'not started',
    first_milestone: '—',
    ga_milestone: 'GA',
    kickoff: '',
    doc_url: '',
    avatar: avatar('placeholder.svg'),
  },
  {
    id: 'compliance-remediation',
    name: 'Network — compliance remediation',
    group: 'Compliance',
    dri: 'grabelnikov',
    priority: 'P2+',
    size: 'M',
    status: 'not started',
    first_milestone: '—',
    ga_milestone: '—',
    kickoff: '',
    doc_url: '',
    avatar: avatar('andrey.svg'),
  },
  {
    id: 'capability-management',
    name: 'UAD — capability management',
    group: 'Compliance',
    dri: 'grabelnikov',
    priority: 'P2+',
    size: 'M',
    status: 'not started',
    first_milestone: '—',
    ga_milestone: '—',
    kickoff: '2026-03-31',
    doc_url: '',
    avatar: avatar('andrey.svg'),
  },
]

export const milestones: Milestone[] = [
  { milestone: 'M0', release_date: '2026-04-24' },
  { milestone: 'M0.5', release_date: '' },
  { milestone: 'M1', release_date: '2026-06-26' },
  { milestone: 'M1.5', release_date: '2026-06-01' },
  { milestone: 'M2', release_date: '' },
  { milestone: 'M2.5', release_date: '' },
  { milestone: 'M3', release_date: '' },
  { milestone: 'M3.5', release_date: '' },
  { milestone: 'GA+', release_date: '' },
  { milestone: 'GA', release_date: '' },
]

export const markers: Marker[] = [
  { workstream_id: 'uad-header', date: '2026-05-07', label: 'Local crit', type: 'review' },
  { workstream_id: 'uad-header', date: '2026-05-08', label: 'Regional crit', type: 'review' },
  { workstream_id: 'uad-header', date: '2026-06-01', label: 'M1.5 handoff', type: 'handoff' },
  { workstream_id: 'uad-composition', date: '2026-06-16', label: 'Stakeholder review', type: 'review' },
  { workstream_id: 'uad-composition', date: '2026-07-31', label: 'GA handoff', type: 'handoff' },
  { workstream_id: 'network-unified-identity', date: '2026-06-05', label: 'Local crit', type: 'review' },
  { workstream_id: 'network-unified-identity', date: '2026-06-10', label: 'Regional crit', type: 'review' },
  { workstream_id: 'network-unified-identity', date: '2026-06-26', label: 'M1 handoff', type: 'handoff' },
  { workstream_id: 'unified-account-list', date: '2026-04-24', label: 'M0 handoff', type: 'handoff' },
  { workstream_id: 'uad-financial-summary', date: '2026-05-08', label: 'Kickoff review', type: 'review' },
  { workstream_id: 'capability-management', date: '2026-03-31', label: 'Kickoff review', type: 'review' },
  { workstream_id: 'uad-settings', date: '2026-04-27', label: 'Kickoff review', type: 'review' },
]

/** Sentence case for UI (e.g. "In progress", "Not started"). */
export function formatWorkstreamStatusLabel(status: WorkstreamStatus): string {
  const lower = status.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}
