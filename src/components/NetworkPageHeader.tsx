/**
 * NetworkPageHeader — Figma Page Title node 2:10678 (Stripe Network Cursor SRC).
 * Title row + action buttons + tabs for the Network screen.
 */

import { Icon } from '../icons/SailIcons'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'merchants', label: 'Merchants' },
  { id: 'customers', label: 'Customers' },
] as const

export type NetworkTabId = (typeof TABS)[number]['id']

function PageActionButton({
  iconOnly = false,
  children,
  className = '',
  ...props
}: {
  iconOnly?: boolean
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      type="button"
      className={`inline-flex h-[28px] min-h-[28px] shrink-0 items-center justify-center rounded-[length:var(--radius-action)] border border-neutral-100 bg-surface font-label-medium-emphasized text-default transition-colors hover:bg-offset focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary ${iconOnly ? 'min-w-[28px] px-0' : 'w-fit gap-[8px] px-[8px] py-[4px]'} ${className}`}
      style={{ boxShadow: 'var(--shadow-button)' }}
      {...props}
    >
      {children}
    </button>
  )
}

export default function NetworkPageHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: NetworkTabId
  onTabChange: (tabId: NetworkTabId) => void
}) {

  return (
    <div
      className="flex w-full flex-col gap-[4px] px-[40px] pt-[16px] pb-[8px]"
      data-name="Page Title"
      data-node-id="2:10678"
    >
      {/* Title row */}
      <div
        className="flex w-full items-center justify-between shrink-0"
        data-name="Title"
      >
        <h1 className="font-heading-xlarge shrink-0" data-name="Page heading">
          Network
        </h1>
        <div
          className="flex shrink-0 items-center gap-[8px]"
          data-name="Page Actions"
        >
          <PageActionButton iconOnly aria-label="More options">
            <Icon name="more" size={12} fill="var(--color-icon-default)" />
          </PageActionButton>
          <PageActionButton>Analyze</PageActionButton>
          <PageActionButton>
            <Icon name="add" size={12} fill="var(--color-icon-default)" />
            Add customer
          </PageActionButton>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex w-full shrink-0 flex-col"
        data-name="Tabs"
        role="tablist"
      >
        <div className="flex gap-[16px]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className="group relative h-fit shrink-0 cursor-pointer pt-[4px] pb-[4px] font-label-medium-emphasized transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary"
                style={{
                  color: isActive ? 'var(--color-action-primary)' : 'var(--color-subdued)',
                  borderBottom: isActive ? '2px solid var(--color-action-primary)' : '2px solid transparent',
                }}
              >
                <span className="block rounded-[length:var(--radius-action)] px-[8px] py-[4px] transition-colors group-hover:bg-offset">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
        <div
          className="h-px w-full shrink-0 bg-neutral-100 -mt-[2px]"
          aria-hidden
        />
      </div>
    </div>
  )
}
