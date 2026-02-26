/**
 * TransactionsPageHeader — Same structure as NetworkPageHeader (Figma 2:10678).
 * Title "Transactions" + merchant dropdown (chevron only when Shopify; label + chevron otherwise) + action buttons + tabs.
 */

import { useState, useRef, useEffect } from 'react'
import { Icon } from '../icons/SailIcons'
import ChevronDownIcon from '../icons/ChevronDownIcon'
import { PageActionButton } from './PageActionButton'
import TabBar from './TabBar'
import { MOCK_ACCOUNTS } from '../data/mockAccounts'

const TABS = [
  { id: 'payments', label: 'Payments' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'top-ups', label: 'Top ups' },
  { id: 'platform-fees', label: 'Platform fees' },
  { id: 'transfers', label: 'Transfers to connected accounts' },
] as const

/** Shopify at top; then all network merchants (config includes Merchant). */
const MERCHANT_OPTIONS: string[] = [
  'Shopify',
  ...MOCK_ACCOUNTS.filter((a) => a.configurations.includes('Merchant')).map((a) => a.name),
]

const DROPDOWN_MAX_HEIGHT = 280

export type TransactionsTabId = (typeof TABS)[number]['id']

export default function TransactionsPageHeader({
  activeTab,
  onTabChange,
  /** Not used for header selection; header always shows chevron with no account selected. Kept for API compatibility. */
  initialMerchant: _initialMerchant,
  /** Called when user selects a specific account (not "All accounts"); use to clear the search-row account filter. */
  onMerchantChange,
}: {
  activeTab: TransactionsTabId
  onTabChange: (tabId: TransactionsTabId) => void
  initialMerchant?: string
  onMerchantChange?: (merchant: string | null) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  /** No account selected by default across lists, even when navigating from account detail. */
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [dropdownOpen])

  return (
    <div
      className="flex w-full flex-col gap-[4px] px-[40px] pt-[16px] pb-[8px]"
      data-name="Page Title"
      data-node-id="2:10678"
    >
      <div className="flex w-full items-center justify-between shrink-0" data-name="Title">
        <div className="flex shrink-0 items-center gap-2">
          <h1 className="font-heading-xlarge shrink-0" data-name="Page heading">
            Transactions
          </h1>
          <div className="relative shrink-0" ref={containerRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="inline-flex h-8 items-center gap-1.5 rounded-[length:var(--radius-action)] bg-transparent px-2 font-label-medium-emphasized text-default hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              aria-label="Select merchant"
            >
              {selectedMerchant != null && selectedMerchant}
              <ChevronDownIcon size={8} fill="var(--color-icon-subdued)" />
            </button>
            {dropdownOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-[length:var(--radius-small)] border border-neutral-100 bg-surface py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                role="listbox"
                data-name="Merchant dropdown"
              >
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left font-label-medium text-default hover:bg-offset focus:bg-offset focus:outline-none"
                  role="option"
                  aria-selected={selectedMerchant === null}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setSelectedMerchant(null)
                    setDropdownOpen(false)
                  }}
                >
                  All accounts
                </button>
                <div className="my-1 border-t border-neutral-100" aria-hidden />
                <div
                  className="overflow-y-auto overscroll-contain"
                  style={{ maxHeight: DROPDOWN_MAX_HEIGHT }}
                >
                  {MERCHANT_OPTIONS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="w-full px-3 py-2 text-left font-label-medium text-default hover:bg-offset focus:bg-offset focus:outline-none"
                      role="option"
                      aria-selected={selectedMerchant === name}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setSelectedMerchant(name)
                        setDropdownOpen(false)
                        onMerchantChange?.(name)
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-[8px]" data-name="Page Actions">
          <PageActionButton iconOnly aria-label="More options">
            <Icon name="more" size={12} fill="var(--color-icon-default)" />
          </PageActionButton>
          <PageActionButton>Analyze</PageActionButton>
          <PageActionButton>
            <Icon name="add" size={12} fill="var(--color-icon-default)" />
            Add
          </PageActionButton>
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-col" data-name="Tabs">
        <TabBar
          tabs={TABS}
          activeId={activeTab}
          onChange={onTabChange}
          variant="primary"
          gap={16}
        />
      </div>
    </div>
  )
}
