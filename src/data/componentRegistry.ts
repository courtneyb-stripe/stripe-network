/**
 * Component inventory registry — single source of truth for the Components page (audit artifact).
 * What exists, what state it's in, what it looks like.
 */

export type ComponentStatus = 'ready' | 'in_progress' | 'placeholder'
export type ComponentSource = 'custom' | 'sail' | 'sail_riff' | 'borrowed'

export type ComponentEntry = {
  name: string
  description: string
  status: ComponentStatus
  source: ComponentSource
  /** When source is 'borrowed', badge shows this (e.g. "List view"). Omit to show "Borrowed". */
  borrowedSourceLabel?: string
  /** One-line audit note only if needed (e.g. "TODO: action not wired", "HIDDEN FOR NOW"). Max one line. */
  auditNote?: string
}

/** Components: have visual preview on the page. */
export const COMPONENT_REGISTRY: ComponentEntry[] = [
  { name: 'ActionButton', description: 'Pill action button for header bar. Standard, outline, iconOnly.', status: 'ready', source: 'custom' },
  { name: 'BalancesCard', description: 'Balance metrics. Variants: default, payouts, stacked, stackedWithSparkline, amountRight.', status: 'in_progress', source: 'borrowed', borrowedSourceLabel: 'FA for Platforms' },
  { name: 'DescriptionTooltip', description: 'Dashed light-gray underline trigger with description-style tooltip panel.', status: 'ready', source: 'sail' },
  { name: 'FinancialAccountsSidebar', description: 'Sidebar for Financial Accounts. Account cards or Multi-currency (sections with currency rows).', status: 'placeholder', source: 'borrowed', borrowedSourceLabel: 'FA for Platforms' },
  { name: 'FinancialSnapshot', description: 'Money movement: net flow sparkline, money in/out bars, time range selector.', status: 'placeholder', source: 'custom' },
  { name: 'IconButton', description: 'Icon-only button. Create, standard, ghost, display.', status: 'ready', source: 'sail_riff' },
  { name: 'List', description: 'Generic list container. variant: default | noDividers. Used for Transactions, Actions required, and other row lists.', status: 'ready', source: 'sail' },
  { name: 'ListItem', description: 'Row within List. Icon, label, subtitle, value, status.', status: 'ready', source: 'sail' },
  { name: 'MetricCard', description: 'Metric card. LTV variant: labelValueSparkline with optional sparkline.', status: 'in_progress', source: 'borrowed', borrowedSourceLabel: 'Customer detail' },
  { name: 'MetricDropdown', description: 'Time range selector. Used in FinancialSnapshot, MetricCard.', status: 'placeholder', source: 'custom' },
  { name: 'Badge', description: 'Status badge. Success, attention, critical, neutral. Restricted = critical + icon.', status: 'ready', source: 'sail' },
  { name: 'PropertyList', description: 'Key-value display. Vertical (sidebar) or horizontal (drawer).', status: 'ready', source: 'sail' },
  { name: 'SectionHeader', description: 'Section title with optional action link (View all) and add.', status: 'in_progress', source: 'sail_riff' },
  {
    name: 'SignalGroupPopover',
    description:
      'Fixed popover anchored below a signal group chip (portal). Default: title + placeholder; optional children replace shell (e.g. PaymentsPopoverPanel). Escape and outside click close.',
    status: 'in_progress',
    source: 'custom',
  },
  { name: 'SubscriptionCard', description: 'Billing subscription summary. Badges, plan name, invoice frequency, next invoice.', status: 'in_progress', source: 'borrowed', borrowedSourceLabel: 'Customer detail' },
  { name: 'TabBar', description: 'Horizontal tab navigation. Primary and secondary variants.', status: 'in_progress', source: 'sail_riff' },
  { name: 'ViewChip', description: 'Toggle chip for filtering. Default and compact sizes.', status: 'in_progress', source: 'borrowed', borrowedSourceLabel: 'List view' },
  { name: 'ActionRequiredDescriptionRow', description: 'Single action item: description, impact badges, due date.', status: 'placeholder', source: 'sail_riff' },
  { name: 'PaymentMethods', description: 'Default payment methods display for sidebar.', status: 'placeholder', source: 'custom', auditNote: 'Placeholder; minimal implementation.' },
  { name: 'LoanDetails', description: 'Loan balance and repayment details. Visible when products.loans = true.', status: 'placeholder', source: 'custom' },
  { name: 'Repayments', description: 'Loan repayment schedule and history.', status: 'placeholder', source: 'custom' },
]

/** Compositions: List-based patterns (e.g. Transaction list, Actions required list). In progress, Sail-riff. */
export const COMPOSITION_REGISTRY: ComponentEntry[] = [
  { name: 'Transaction list', description: 'List composition: latest or upcoming transactions. SectionHeader + List of transaction rows; row click opens drawer.', status: 'in_progress', source: 'sail_riff' },
  { name: 'Actions required list', description: 'List composition: actions required. SectionHeader + List (noDividers) of ActionRequiredDescriptionRow; used in sidebar, modal, dropdowns.', status: 'in_progress', source: 'sail_riff' },
]

/** Resources: no visual preview. Name, status, source, description only. */
export const RESOURCES_REGISTRY: ComponentEntry[] = [
  { name: 'accountConfigs', description: 'Account type → feature/product/capability mappings.', status: 'ready', source: 'custom' },
  { name: 'actionsRequired', description: 'Data + helpers for actions required display.', status: 'ready', source: 'custom' },
  { name: 'SECTION_COMPONENTS', description: 'Section key → component registry for tab rendering.', status: 'ready', source: 'custom' },
  { name: 'ROW_HEIGHT', description: 'Shared table row height (52px).', status: 'ready', source: 'custom' },
  { name: 'slugToDisplayName', description: 'URL slug → display name conversion.', status: 'ready', source: 'custom' },
  { name: 'TIME_RANGE_OPTIONS', description: 'Shared time range options for dropdowns.', status: 'ready', source: 'custom' },
  { name: 'AccountDetailActionBar', description: 'Assembles action buttons for account detail header.', status: 'in_progress', source: 'custom' },
  { name: 'ModalBackdrop', description: 'Fixed overlay; click calls onClose. Used by SettingsModal, EditDetailsModal.', status: 'ready', source: 'custom' },
  { name: 'LabelTooltip', description: 'Wraps trigger; hover shows tooltip. Dark or light (description) variant.', status: 'in_progress', source: 'sail_riff' },
]

const STATUS_ORDER: ComponentStatus[] = ['ready', 'in_progress', 'placeholder']

export function componentSlug(name: string): string {
  return name.replace(/\s+/g, '-').toLowerCase()
}

export function groupRegistryByStatus(entries: ComponentEntry[]): Map<ComponentStatus, ComponentEntry[]> {
  const map = new Map<ComponentStatus, ComponentEntry[]>()
  for (const status of STATUS_ORDER) {
    map.set(status, [])
  }
  for (const entry of entries) {
    const list = map.get(entry.status)
    if (list) list.push(entry)
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }
  return map
}
