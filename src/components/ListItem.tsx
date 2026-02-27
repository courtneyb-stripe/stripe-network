/**
 * ListItem — Sail-style list row with icon, title, description, trailing content.
 * Rich content variant: pass children to render below description (e.g. body copy + Link).
 * API aligned with Sail ListItem for easy migration to @sail/ui.
 */

import { useListAction } from './List'

type ListItemProps = {
  id: string | number
  /** Left-aligned icon (e.g. payment, transfer). */
  icon: React.ReactNode
  /** Main line; can be string or ReactNode (e.g. title + Tooltip). */
  title: React.ReactNode
  /** Sub line (e.g. email, date • status). */
  description?: string
  /** Right-aligned content (e.g. amount, badge). */
  trailingContent?: React.ReactNode
  /** Rich content below description (e.g. body text + Link). */
  children?: React.ReactNode
  /** When true, show selected state (e.g. in Needs Attention list). */
  active?: boolean
  /** Icon container: default = gray offset box; critical = no box (e.g. red circle X for blocking issues). */
  iconVariant?: 'default' | 'critical'
}

export function ListItem({
  id,
  icon,
  title,
  description,
  trailingContent,
  children,
  active = false,
  iconVariant = 'default',
}: ListItemProps) {
  const onAction = useListAction()
  const iconWrapperClass =
    iconVariant === 'critical'
      ? 'flex h-fit w-fit shrink-0 items-start justify-start'
      : 'flex h-fit w-fit shrink-0 items-start justify-start rounded-[length:var(--radius-small)] bg-offset text-icon-subdued'
  const content = (
    <>
      <span className={iconWrapperClass} aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-label-medium text-[14px] leading-5 text-default truncate">
          {title}
        </div>
        {description != null && (
          <div className="font-label-small text-[12px] leading-4 text-subdued mt-0.5">
            {description}
          </div>
        )}
        {children != null && (
          <div className="font-label-medium text-[14px] leading-5 text-subdued mt-1">
            {children}
          </div>
        )}
      </div>
      {trailingContent != null && (
        <div className="shrink-0 flex items-center gap-1.5 self-center pl-2">
          {trailingContent}
        </div>
      )}
    </>
  )

  const rowClass =
    'flex items-start gap-3 py-2 min-h-[52px] min-w-0 text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-inset rounded-[8px]'

  if (onAction != null) {
    return (
      <li className="-mx-2" role="listitem" data-name="ListItem">
        <button
          type="button"
          onClick={() => onAction(id)}
          className={`${rowClass} group/row cursor-pointer hover:bg-offset transition-colors w-full px-2 ${active ? 'bg-offset' : ''}`}
        >
          {content}
        </button>
      </li>
    )
  }

  return (
    <li className={`-mx-2 px-2 ${rowClass}`} role="listitem" data-name="ListItem">
      {content}
    </li>
  )
}
