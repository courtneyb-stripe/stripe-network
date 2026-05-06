/**
 * ItemsCountLink — legacy alias for {@link InlineListPagination} (“1–N of M results”).
 */

import InlineListPagination from './InlineListPagination'

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
    <InlineListPagination
      pageStart={1}
      pageEnd={displayedCount}
      totalResults={totalCount}
      to={to}
      linkState={linkState}
      className={className}
    />
  )
}
