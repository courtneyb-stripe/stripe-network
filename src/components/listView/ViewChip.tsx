/**
 * View chips — M1 list toolbar chip (visualVariant `"list"`, Figma 6256:26549), legacy section pills (`"pill"`),
 * and account hub capability rows (`"headerCard"`).
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../icons/SailIcons'
import { CapabilityGroupCard } from './CapabilityGroupCard'

export type ViewChipSize = 'default' | 'compact'

/** `pill` = legacy section filters; `list` = Parent list / Network toolbar; `headerCard` = account hub capability row. */
export type ViewChipVisualVariant = 'pill' | 'list' | 'headerCard'

const VIEW_CHIP_SIZE_CLASSES: Record<ViewChipSize, string> = {
  default: 'h-9 min-h-9 rounded-[10px] px-3 py-2',
  compact: 'h-8 min-h-8 rounded-[8px] px-2 py-1.5',
}

/** Figma 6256:26549 — M1 List Chip frame (single-line + optional count). */
const LIST_CHIP_CLASS =
  'h-9 min-h-9 gap-2 rounded-[8px] border border-solid px-3 py-2'

export function ViewChip({
  label,
  count,
  active,
  onClick,
  /** When set on non–header-card variants, renders a {@link Link} instead of a button (parent-list navigation). */
  href,
  showMoreIcon = false,
  size = 'default',
  visualVariant = 'pill',
  /** Second line on `headerCard` (Label/Small, neutral/600). */
  subtitle,
  /** Trailing 12px status graphic on `headerCard` (e.g. {@link CapabilityStatusIcon}). */
  statusIcon,
  /** Overrides accessible name for list/pill chip (visible label unchanged). */
  accessibilityLabel,
}: {
  label: string
  count?: number
  active: boolean
  onClick?: () => void
  href?: string
  showMoreIcon?: boolean
  size?: ViewChipSize
  visualVariant?: ViewChipVisualVariant
  subtitle?: string
  statusIcon?: ReactNode
  accessibilityLabel?: string
}) {
  const isList = visualVariant === 'list'
  const isHeaderCard = visualVariant === 'headerCard'

  if (isHeaderCard) {
    const aria = accessibilityLabel ?? `${label}, ${subtitle ?? ''}`.trim()
    return (
      <CapabilityGroupCard
        label={label}
        subtitle={subtitle}
        statusIcon={statusIcon}
        accessibilityLabel={aria}
        onClick={onClick ?? (() => {})}
      />
    )
  }

  const sizeClass = isList ? LIST_CHIP_CLASS : `${VIEW_CHIP_SIZE_CLASSES[size]} gap-2`

  const stateClass = isList
    ? active
      ? 'relative border-2 border-default bg-surface text-default shadow-[0px_2px_3px_0px_rgba(33,37,44,0.16)]'
      : 'border border-neutral-50 bg-surface text-subdued hover:border-neutral-50 hover:bg-offset'
    : active
      ? 'border-default bg-default text-neutral-0'
      : 'border-neutral-100 bg-surface text-subdued hover:border-neutral-100 hover:bg-offset'

  const interactiveProps =
    href != null && !isHeaderCard
      ? { to: href, 'aria-current': active ? ('page' as const) : undefined }
      : null

  const labelClass = isList
    ? `shrink-0 truncate text-[14px] leading-5 tracking-[-0.15px] font-label-medium-emphasized ${active ? 'text-default' : 'text-subdued'}`
    : 'shrink-0 truncate text-[14px] leading-5 tracking-[-0.15px] font-[500]'

  const countClass = isList
    ? active
      ? 'shrink-0 font-label-medium leading-5 tracking-[-0.15px] tabular-nums text-subdued'
      : 'shrink-0 font-label-medium leading-5 tracking-[-0.15px] tabular-nums text-icon-subdued'
    : 'shrink-0 font-label-small leading-4 tabular-nums'

  const surfaceClass = `flex shrink-0 items-center overflow-clip transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary ${sizeClass} ${stateClass}`
  const nodeMeta = {
    'data-name': isList ? 'M1 List Chip' : 'View Chip 2.0',
    'data-node-id': isList ? '6256:26549' : '6:5122',
  } as const

  const ariaForInteractive =
    !isHeaderCard && accessibilityLabel != null ? { 'aria-label': accessibilityLabel } : {}

  const inner = (
    <>
      <span className={labelClass}>{label}</span>
      {count !== undefined && <span className={countClass}>{count.toLocaleString()}</span>}
      {showMoreIcon && active && !isList && (
        <Icon name="more" size={16} fill="currentColor" className="shrink-0" />
      )}
    </>
  )

  if (interactiveProps != null) {
    return (
      <Link {...interactiveProps} {...ariaForInteractive} className={surfaceClass} {...nodeMeta}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" {...ariaForInteractive} onClick={onClick} className={surfaceClass} {...nodeMeta}>
      {inner}
    </button>
  )
}
