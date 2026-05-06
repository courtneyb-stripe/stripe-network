/**
 * TransactionListCard — One list component with two variants: latest (past) and upcoming.
 * Row icon: list icon container (bg-offset, not IconButton). Optional subheading "with [accountName]".
 * Row click opens transaction in drawer (via onRowAction).
 */

import { Icon } from '../icons/SailIcons'
import SectionHeader from './SectionHeader'
import { List, ListItem } from './List'
import InlineListPagination from './InlineListPagination'

export type TransactionListVariant = 'latest' | 'upcoming'

/** Transaction type: card (payment) or transfer (payout/transfer). Gray icon in gray box. */
export type TransactionListRowType = 'card' | 'transfer'

const ICON_BY_TYPE: Record<TransactionListRowType, string> = {
  card: 'addCircle',
  transfer: 'transfer',
}

const ICON_FILL = 'var(--color-icon-subdued)'

export type TransactionListRow = {
  id: string
  transactionType: TransactionListRowType
  /** Main line (e.g. "KEEP THE CHANGE CREDIT FROM ACCT7280", "Amazon"). */
  description: string
  /** Sub line (e.g. "Feb 21 • Pending", "Mar 1 • Scheduled"). */
  subline: string
  /** Amount (e.g. "+$0.70", "$102.65"). */
  amount: string
  /** When true, amount uses success (green). */
  isCredit?: boolean
  /** When true, show a "hidden" indicator next to amount. */
  isHidden?: boolean
}

type TransactionListCardProps = {
  /** latest = past/recent transactions; upcoming = scheduled. Drives empty state and any variant-specific behavior. */
  variant?: TransactionListVariant
  title: string
  /** Subheading below title: "with [accountName]" to clarify platform–account only (not customer payments). */
  accountName?: string
  onAdd?: () => void
  onRowAction?: (id: string) => void
  rows: TransactionListRow[]
  className?: string
  /** When set, shows Figma-style “1–N of M results” footer linked to the parent list. */
  listPagination?: {
    pageStart: number
    pageEnd: number
    totalResults: number
    to?: string
    linkState?: object
    onViewFullList?: () => void
  }
}

const EMPTY_COPY: Record<TransactionListVariant, string> = {
  latest: 'No recent transactions',
  upcoming: 'No upcoming transactions',
}

function HiddenIcon() {
  return (
    <span className="text-icon-subdued" aria-label="Hidden">
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M8 4C4.5 4 2 8 2 8s2.5 4 6 4 6-4 6-4-2.5-4-6-4zm0 6.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export default function TransactionListCard({
  variant = 'latest',
  title,
  accountName,
  onAdd,
  onRowAction,
  rows,
  className = '',
  listPagination,
}: TransactionListCardProps) {
  return (
    <div
      className={`flex w-full flex-col gap-4 ${className}`.trim()}
      data-name="TransactionListCard"
      data-variant={variant}
    >
      <SectionHeader
        title={title}
        description={accountName != null ? `with ${accountName}` : undefined}
        size="small"
        onAdd={onAdd}
      />
      <List
        onAction={onRowAction != null ? (id) => onRowAction(String(id)) : undefined}
        aria-label={title}
      >
        {rows.length === 0 ? (
          <li className="py-4 font-body-small text-subdued" role="listitem" aria-hidden>
            {EMPTY_COPY[variant]}
          </li>
        ) : null}
        {rows.map((row) => {
          const typeIcon = (
            <Icon
              name={ICON_BY_TYPE[row.transactionType]}
              size={16}
              fill={ICON_FILL}
            />
          )
          return (
            <ListItem
              key={row.id}
              id={row.id}
              icon={typeIcon}
              title={row.description}
              description={row.subline}
              trailingContent={
                <span className="flex items-center gap-1.5">
                  {row.isHidden === true && <HiddenIcon />}
                  <span
                    className="font-label-medium tabular-nums text-[14px] leading-5"
                    style={
                      row.isCredit === true
                        ? { color: 'var(--color-feedback-success-on)' }
                        : undefined
                    }
                  >
                    {row.amount}
                  </span>
                </span>
              }
            />
          )
        })}
      </List>
      {listPagination != null ? (
        <InlineListPagination
          pageStart={listPagination.pageStart}
          pageEnd={listPagination.pageEnd}
          totalResults={listPagination.totalResults}
          to={listPagination.to}
          linkState={listPagination.linkState}
          onViewFullList={listPagination.onViewFullList}
        />
      ) : null}
    </div>
  )
}
