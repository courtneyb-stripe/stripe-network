export type HubDecisionStatus = 'open' | 'resolved' | 'superseded'

export type HubDecisionRow = {
  id: string
  decision: string
  rationale: string
  dri: string
  date: string
  status: HubDecisionStatus
}

export const HUB_DECISIONS: HubDecisionRow[] = [
  {
    id: 'uad-organizing',
    decision: 'UAD organizing principle',
    rationale:
      'Unified Account Detail is the primary surface for account context; secondary patterns defer to UAD hierarchy.',
    dri: '@traceyv',
    date: 'Mar 2026',
    status: 'resolved',
  },
  {
    id: 'cap-pill',
    decision: 'Capability pill placement',
    rationale:
      'Capability signals live in the account header row; mesh explorer remains the drill-down for cross-cap views.',
    dri: '@courtneyb',
    date: 'Apr 2026',
    status: 'open',
  },
  {
    id: 'ar-surface',
    decision: 'AR surface parked as P2',
    rationale:
      'Actions-required density and IA are deferred until UAD M1 stabilizes; track as follow-up with Compliance.',
    dri: '@grabelnikov',
    date: 'Apr 2026',
    status: 'open',
  },
  {
    id: 'econ-tabs',
    decision: 'Economic direction as tab structure',
    rationale:
      'Revenue vs money movement vs balances ship as explicit tabs under Financials, not a single blended view.',
    dri: '@angelal',
    date: 'May 2026',
    status: 'resolved',
  },
  {
    id: 'header-status',
    decision: 'Header = status only',
    rationale:
      'Account header communicates lifecycle status only; product-specific signals move to body modules.',
    dri: '@courtneyb',
    date: 'May 2026',
    status: 'superseded',
  },
]
