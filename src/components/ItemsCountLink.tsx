/**
 * ItemsCountLink — "X of Y items" link with primary-styled total (e.g. "10 of 80 items").
 * Used below embedded transaction/payout tables to link to full list.
 */

import { Link } from 'react-router-dom'

type ItemsCountLinkProps = {
  displayedCount: number
  totalCount: number
  to: string
  linkState?: object
  className?: string
}

export default function ItemsCountLink({
  displayedCount,
  totalCount,
  to,
  linkState,
  className = '',
}: ItemsCountLinkProps) {
  return (
    <p className={`text-[14px] text-default ${className}`}>
      <Link
        to={to}
        state={linkState}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary rounded-[length:var(--radius-xsmall)]"
      >
        {displayedCount} of <span className="text-action-primary">{totalCount}</span> items
      </Link>
    </p>
  )
}
