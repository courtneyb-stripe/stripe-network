/**
 * Sidebar — Figma Overview node 1982:16465, Account node 1982:16466
 * Design tokens: Background/Surface, Neutral/50, spacing, Label/Medium, Icon/Default, Text/Action Primary
 * Logo from Figma AccountIcon (234:14311).
 */

import { Icon } from '../icons/SailIcons'

const ACCOUNT_NAME = 'Cactus Practice'
/** Figma asset for Account/logo (Cactus Practice). Replace with local asset if needed after expiry. */
const ACCOUNT_LOGO_URL = 'https://www.figma.com/api/mcp/asset/548f58e9-33ce-4e7b-b059-71df5c1aae9f'

const topLevelNav = [
  { label: 'Home', icon: 'home' as const },
  { label: 'Balances', icon: 'balance' as const },
  { label: 'Transactions', icon: 'arrowsLoop' as const },
  { label: 'Network', icon: 'person' as const, active: true },
  { label: 'Product catalog', icon: 'product' as const },
]

const productGroups = [
  { label: 'Connect', icon: 'platform' as const },
  { label: 'Payments', icon: 'wallet' as const },
  { label: 'Billing', icon: 'barChart' as const },
  { label: 'Reporting', icon: 'barChart' as const },
  { label: 'More', icon: 'more' as const },
]

function NavItem({
  label,
  icon,
  active = false,
}: {
  label: string
  icon: string
  active?: boolean
}) {
  return (
    <div className="relative flex h-[30px] w-full shrink-0 items-center gap-[length:var(--spacing-small)] isolate">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[length:var(--radius-small)] z-[3]">
        <Icon name={icon as never} size={16} fill={active ? 'var(--color-icon-action)' : 'var(--color-icon-default)'} />
      </div>
      <div
        className={`min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap z-[2] ${active ? 'font-label-medium-emphasized' : 'font-label-medium'}`}
        style={{ color: active ? 'var(--color-action-primary)' : 'var(--color-default)' }}
      >
        {label}
      </div>
      <div className="absolute inset-[-1px_-4px] -z-[1] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <div className="h-full w-full flex-1 min-w-px min-h-px rounded-[length:var(--radius-action)] bg-offset" />
      </div>
    </div>
  )
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="flex h-[26px] w-full items-center gap-[length:var(--spacing-small)] shrink-0">
      <span className="font-heading-xsmall-subdued text-subdued truncate">{label}</span>
    </div>
  )
}

function ProductGroup({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex w-full shrink-0 flex-col items-start">
      <div className="relative flex w-full items-center gap-[length:var(--spacing-small)] h-[30px]">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[length:var(--radius-small)]">
          <Icon name={icon as never} size={16} fill="var(--color-icon-default)" />
        </div>
        <div className="min-w-0 flex-1 font-label-medium text-default truncate">{label}</div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-[length:var(--radius-small)]">
          <Icon name="chevronDown" size={8} fill="var(--color-icon-subdued)" />
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-10 flex h-[1000px] w-[240px] flex-col items-start border-r border-neutral-50 bg-surface rounded-l-[20px]"
      data-name="Sidebar"
    >
      {/* Account — sticky, left-aligned with nav (Figma 1982:16466) */}
      <div
        className="sticky top-0 z-[3] flex h-[60px] w-full shrink-0 items-center justify-start bg-surface px-[length:var(--spacing-250)] rounded-tl-[20px]"
        data-name="Account"
      >
        <div className="flex items-center gap-[length:var(--spacing-small)] min-w-0 shrink">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[length:var(--radius-xsmall)] z-[3]"
            data-name="AccountIcon"
          >
            <img
              src={ACCOUNT_LOGO_URL}
              alt=""
              className="h-full w-full object-cover"
              aria-hidden
            />
          </div>
          <div className="min-w-0 shrink-0 font-label-medium-emphasized text-default truncate z-[2]">
            {ACCOUNT_NAME}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        className="flex flex-col items-start gap-[length:var(--spacing-350)] px-[length:var(--spacing-250)] pt-[length:var(--spacing-250)] pb-[length:var(--spacing-800)] shrink-0 z-[2]"
        data-name="Nav"
      >
        <div className="flex w-[188px] flex-col items-start shrink-0 gap-0">
          {topLevelNav.map((item) => (
            <NavItem key={item.label} label={item.label} icon={item.icon} active={item.active} />
          ))}
        </div>

        <div className="flex w-[188px] flex-col items-start shrink-0">
          <SectionHeading label="Products" />
          <div className="mt-0 flex w-full flex-col gap-0">
            {productGroups.map((group) => (
              <ProductGroup key={group.label} label={group.label} icon={group.icon} />
            ))}
          </div>
        </div>
      </nav>

      {/* Developers footer */}
      <div
        className="absolute bottom-0 left-0 flex w-[227px] flex-col items-start px-[20px] py-4 z-[1]"
        data-name="Wrapper"
      >
        <div className="relative flex h-[30px] w-full items-center gap-[length:var(--spacing-small)] shrink-0">
          <div
            className="absolute right-[185px] top-[15px] h-[240px] w-px border-l border-neutral-100 z-[4]"
            data-name="Divider"
            aria-hidden
          />
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[length:var(--radius-small)] z-[3]">
            <Icon name="api" size={16} fill="var(--color-icon-default)" />
          </div>
          <div className="min-w-0 flex-1 font-label-medium text-default truncate z-[2]">
            Developers
          </div>
        </div>
      </div>
    </aside>
  )
}
