/**
 * Section header — Figma Stripe Network ’26 **6232:150998** (section header + control).
 * Title: 20px bold, page-header ink, tabular lining; 16px gap to trailing controls.
 * Controls: 28×28, 6px radius, 1px neutral-100 border, surface fill (see {@link IconButton} `sectionHeader`).
 */

import type { IconButtonVariant } from './IconButton'
import type { TooltipPlacement } from './LabelTooltip'
import { RightArrowIcon } from './metrics/MetricCard'
import { IconButton } from './IconButton'
import { PlusIcon } from '../icons/PlusIcon'
import { EditIcon } from '../icons/EditIcon'

export type SectionHeaderSize = 'medium' | 'small'

/** Both sizes match Figma 6232:150998 heading scale on account hub / detail surfaces. */
const SIZE_CLASSES: Record<SectionHeaderSize, string> = {
  medium: 'text-[20px] leading-[28px] font-bold tracking-0 text-page-header-ink',
  small: 'text-[20px] leading-[28px] font-bold tracking-0 text-page-header-ink',
}

const TITLE_STYLE = { fontFeatureSettings: "'lnum' 1, 'pnum' 1" } as const

type SectionHeaderProps = {
  title: string
  /** Optional description/subheading directly under the title (16px gap). */
  description?: string
  /** Small = 18px (default for section headings). Medium = 20px. */
  size?: SectionHeaderSize
  badge?: React.ReactNode
  onAction?: () => void
  /** Custom icon for the action button (e.g. expand/arrows-outward). Default: right arrow. */
  actionIcon?: React.ReactNode
  /** Accessible label and tooltip. Default "View all" (right arrow). Use "View details" when actionIcon is expand (arrows outward). */
  actionLabel?: string
  /** Default `sectionHeader` (Figma 6232:150998). Use `ghost` when embedding in non-hub chrome (e.g. transaction cards). */
  actionVariant?: IconButtonVariant
  /** Tooltip position for the action button. Use "bottom" in drawers. */
  tooltipPlacement?: TooltipPlacement
  /** Optional add action; shows purple plus button. */
  onAdd?: () => void
  /** Label for the add button tooltip. Default: "Create". */
  addLabel?: string
  /** Optional edit action; shows ghost edit button to the left of the main action (e.g. deep link to Settings). */
  onEdit?: () => void
  /** Label for the edit button tooltip. Default: "Edit". */
  editLabel?: string
  /** Optional trailing element (e.g. time range dropdown) rendered after the action buttons. */
  trailing?: React.ReactNode
}

function sectionHeaderTooltipId(title: string): string {
  return `section-header-${title.replace(/\s+/g, '-').toLowerCase()}-tooltip`
}

function sectionHeaderAddTooltipId(title: string): string {
  return `section-header-${title.replace(/\s+/g, '-').toLowerCase()}-add-tooltip`
}

function sectionHeaderEditTooltipId(title: string): string {
  return `section-header-${title.replace(/\s+/g, '-').toLowerCase()}-edit-tooltip`
}

export default function SectionHeader({
  title,
  description,
  size = 'small',
  badge,
  onAction,
  actionIcon,
  actionLabel = 'View all',
  actionVariant = 'sectionHeader',
  tooltipPlacement = 'top',
  onAdd,
  addLabel = 'Create',
  onEdit,
  editLabel = 'Edit',
  trailing,
}: SectionHeaderProps) {
  const tooltipId = sectionHeaderTooltipId(title)
  const addTooltipId = sectionHeaderAddTooltipId(title)
  const editTooltipId = sectionHeaderEditTooltipId(title)
  return (
    <div className="flex h-fit w-full flex-col gap-4" data-node-id="6232:150998" data-name="Section header">
      {/* min-h-7 aligns row to 28px controls (Figma 6232:150998); gap-4 = 16px title ↔ actions */}
      <div className="flex min-h-7 w-full items-center gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <p
            className={`min-w-0 w-fit whitespace-pre-wrap ${SIZE_CLASSES[size]}`}
            style={TITLE_STYLE}
          >
            {title}
          </p>
          {badge != null && <span className="ml-auto shrink-0">{badge}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onEdit != null && (
            <IconButton
              label={editLabel}
              tooltipId={editTooltipId}
              variant="sectionHeader"
              tooltipPlacement={tooltipPlacement}
              onClick={onEdit}
            >
              <EditIcon size={12} fill="var(--color-icon-default)" />
            </IconButton>
          )}
          {onAdd != null && (
            <IconButton
              label={addLabel}
              tooltipId={addTooltipId}
              variant="sectionHeader"
              tooltipPlacement={tooltipPlacement}
              onClick={onAdd}
            >
              <PlusIcon size={12} fill="var(--color-action-primary)" />
            </IconButton>
          )}
          {onAction != null && (
            <IconButton
              label={actionLabel}
              tooltipId={tooltipId}
              variant={actionVariant}
              tooltipPlacement={tooltipPlacement}
              onClick={onAction}
              data-name="Section header button"
            >
              {actionIcon ?? <RightArrowIcon size={12} fill="var(--color-icon-default)" />}
            </IconButton>
          )}
          {trailing != null && <span className="flex shrink-0 items-center">{trailing}</span>}
        </div>
      </div>
      {description != null && description !== '' && (
        <p className="font-body-small text-subdued leading-4 mt-0">
          {description}
        </p>
      )}
    </div>
  )
}
