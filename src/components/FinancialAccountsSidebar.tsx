/**
 * Financial accounts sidebar block.
 * Variants: Multi-currency (Figma 29:14328) — sections with currency rows; account cards (Figma 29:15531) — flat list (name, mask, balance).
 * When accountId and card.id are set, cards link to FA detail with soft gray hover.
 */

import { Link } from 'react-router-dom'
import { Icon } from '../icons/SailIcons'
import { GramIcon } from '../icons/GramIcon'
import { IconButton } from './IconButton'
import { RightArrowIcon } from './metrics/MetricCard'
import SectionHeader from './SectionHeader'

export type FinancialAccountRow = {
  currency: string
  accountMask: string
  amount: string
  /** Optional flag/icon for currency (e.g. US, EU, GB). When omitted, shows currency code in offset box. */
  flagIcon?: React.ReactNode
}

export type FinancialAccountsSection = {
  label: string
  accounts: FinancialAccountRow[]
  onMore?: () => void
}

/** Single account card for variant="accounts" (Figma 29:15531). id required for link to FA detail. */
export type FinancialAccountCard = {
  id?: string
  accountName: string
  accountMask: string
  amount: string
  icon?: React.ReactNode
}

export type FinancialAccountsSidebarProps = {
  /** Multi-currency: sections with currency rows (29:14328). */
  sections?: FinancialAccountsSection[]
  /** Account cards: flat list of cards with name, mask, amount (29:15531). When set, ignores sections. */
  accountCards?: FinancialAccountCard[]
  /** When set with card.id, cards link to /network/:accountId/financial-accounts/:faId with hover state. */
  accountId?: string
  onHeaderAction?: () => void
  className?: string
}

function CurrencyFlagPlaceholder({ currency }: { currency: string }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-offset font-label-small-emphasized text-subdued"
      aria-hidden
    >
      {currency.slice(0, 2)}
    </div>
  )
}

const cardContentClass =
  'flex w-full items-center justify-between gap-2 overflow-hidden rounded-[8px] border border-neutral-50 bg-surface p-3 transition-colors hover:bg-offset'

/** Single account card — Figma 29:15532 / 29:15541. When href set, renders as Link with soft gray hover. */
function AccountCard({
  id,
  accountName,
  accountMask,
  amount,
  icon,
  href,
}: FinancialAccountCard & { href?: string }) {
  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[7px] bg-offset">
          {icon != null ? icon : <GramIcon size={15} />}
        </div>
        <div className="flex min-w-0 flex-col">
          <p className="font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default">
            {accountName}
          </p>
          <p className="font-label-small text-subdued leading-4">
            {accountMask}
          </p>
        </div>
      </div>
      <p className="shrink-0 text-right font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default tabular-nums">
        {amount}
      </p>
    </>
  )
  if (href) {
    return (
      <Link
        to={href}
        className={`${cardContentClass} block focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-inset`}
        data-name="Card-layout"
        data-node-id="29:15532"
      >
        {content}
      </Link>
    )
  }
  return (
    <div className={cardContentClass} data-name="Card-layout" data-node-id="29:15532">
      {content}
    </div>
  )
}

export default function FinancialAccountsSidebar({
  sections,
  accountCards,
  accountId,
  onHeaderAction,
  className = '',
}: FinancialAccountsSidebarProps) {
  const isAccountsVariant = accountCards != null && accountCards.length > 0

  return (
    <div
      className={`flex min-w-[320px] w-full shrink-0 flex-col gap-2 ${className}`.trim()}
      data-node-id={isAccountsVariant ? '29:15531' : '29:14328'}
    >
      <div className="pb-2" data-node-id="29:14317">
        <SectionHeader
          title="Financial accounts"
          size="small"
          onAction={onHeaderAction}
          actionLabel="View all"
        />
      </div>

      {isAccountsVariant ? (
        <div className="flex w-full flex-col gap-2" data-node-id="29:15531">
          {accountCards.map((card, i) => (
            <AccountCard
              key={card.id ?? `${card.accountName}-${i}`}
              id={card.id}
              accountName={card.accountName}
              accountMask={card.accountMask}
              amount={card.amount}
              icon={card.icon}
              href={
                accountId != null && card.id != null && card.id !== ''
                  ? `/network/${accountId}/financial-accounts/${card.id}`
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div
          className="flex w-full flex-col gap-3 rounded-[16px] bg-offset px-2 pt-2 pb-3"
          data-name="FA container"
          data-node-id="29:12123"
        >
          {(sections ?? []).map((section) => (
            <div
              key={section.label}
              className="flex w-full flex-col gap-3"
              data-name="FA-wrapper"
            >
              <div className="flex w-full items-center justify-between pl-3 pr-5" data-node-id="29:13634">
                <p className="font-label-small-emphasized text-default tracking-[-0.024px] leading-4">
                  {section.label}
                </p>
                {section.onMore != null && (
                  <IconButton
                    label="More"
                    tooltipId={`financial-accounts-sidebar-more-${section.label}-tooltip`}
                    variant="ghost"
                    className="!h-8 !w-8 !min-h-8 !min-w-8"
                    onClick={section.onMore}
                  >
                    <Icon name="more" size={16} fill="var(--color-icon-default)" aria-hidden />
                  </IconButton>
                )}
              </div>
              <div className="overflow-hidden rounded-[12px] bg-surface shadow-[0px_2px_5px_0px_rgba(48,49,61,0.08),0px_1px_1px_0px_rgba(0,0,0,0.12)]">
                {section.accounts.map((account, i) => (
                  <div
                    key={`${account.currency}-${i}`}
                    className="flex w-full items-center justify-between gap-2 border-b border-neutral-50 p-3 last:border-b-0"
                    data-name="Card-layout"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {account.flagIcon != null ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-offset">
                          {account.flagIcon}
                        </div>
                      ) : (
                        <CurrencyFlagPlaceholder currency={account.currency} />
                      )}
                      <div className="flex min-w-0 flex-col">
                        <p className="font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default">
                          {account.currency}
                        </p>
                        <p className="font-label-small text-subdued leading-4">
                          {account.accountMask}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-right font-label-medium-emphasized text-[14px] leading-5 tracking-[-0.15px] text-default tabular-nums">
                      {account.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
