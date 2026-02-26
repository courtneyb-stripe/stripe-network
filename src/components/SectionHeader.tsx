/**
 * Section header — Figma node 2:6463.
 * Title on the left (Medium 20px or Small 18px), optional badge, action button on the right.
 * Right arrow = navigate to another surface/tab → use actionLabel "View all".
 * Expand icon (arrows outward) = open drawer/modal on same surface → use actionLabel "View details"; keep icon standard gray (icon-subdued).
 */

import type { IconButtonVariant } from './IconButton'
import type { TooltipPlacement } from './LabelTooltip'
import { RightArrowIcon } from './metrics/MetricCard'
import { IconButton } from './IconButton'
import { PlusIcon } from '../icons/PlusIcon'
import { EditIcon } from '../icons/EditIcon'

export type SectionHeaderSize = 'medium' | 'small'

const SIZE_CLASSES: Record<SectionHeaderSize, string> = {
  medium: 'text-[20px] leading-[28px] font-semibold tracking-[-0.15px] text-default',
  small: 'text-[18px] leading-[26px] font-semibold tracking-[-0.15px] text-default',
}

type SectionHeaderProps = {
  title: string
  /** Optional description/subheading directly under the title (no gap). When set, 8px bottom padding wraps title + description. */
  description?: string
  /** Small = 18px (default for section headings). Medium = 20px. */
  size?: SectionHeaderSize
  badge?: React.ReactNode
  onAction?: () => void
  /** Custom icon for the action button (e.g. expand/arrows-outward). Default: right arrow. */
  actionIcon?: React.ReactNode
  /** Accessible label and tooltip. Default "View all" (right arrow). Use "View details" when actionIcon is expand (arrows outward). */
  actionLabel?: string
  /** Action button style. Use "ghost" for edit buttons in drawers. */
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
  actionVariant = 'ghost',
  tooltipPlacement = 'top',
  onAdd,
  addLabel = 'Create',
  onEdit,
  editLabel = 'Edit',
}: SectionHeaderProps) {
  const tooltipId = sectionHeaderTooltipId(title)
  const addTooltipId = sectionHeaderAddTooltipId(title)
  const editTooltipId = sectionHeaderEditTooltipId(title)
  return (
    <div className="flex w-full flex-col gap-0 pb-2" data-node-id="2:6463">
      {/* min-h-8 keeps row height consistent when action/add icons are missing (reduces tab-switch jump) */}
      <div className="flex min-h-8 w-full items-center gap-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <p className={`min-w-0 w-fit whitespace-pre-wrap ${SIZE_CLASSES[size]}`}>
            {title}
          </p>
          {badge}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onEdit != null && (
            <IconButton
              label={editLabel}
              tooltipId={editTooltipId}
              variant="ghost"
              tooltipPlacement={tooltipPlacement}
              onClick={onEdit}
            >
              <EditIcon size={12} fill="var(--color-icon-subdued)" />
            </IconButton>
          )}
          {/* Create (add) icon left of View all arrow */}
          {onAdd != null && (
            <IconButton
              label={addLabel}
              tooltipId={addTooltipId}
              variant="create"
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
              data-name="Container"
              data-node-id="2:6466"
            >
              {actionIcon ?? <RightArrowIcon size={12} fill="var(--color-icon-subdued)" />}
            </IconButton>
          )}
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
