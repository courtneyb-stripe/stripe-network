/**
 * Account details sidebar — Figma baby/card/prop-list_vertical (node 2:6692).
 * When restricted: Actions required section (Figma 18-7608) first, then 40px gap, then Account card.
 * Account heading (SectionHeader with expand icon), optional badge, and property list.
 * Expand opens half-screen drawer (Figma 16:6868).
 * When showAccountRisk (e.g. radar rule matches), show Account risk + View risk analysis below ID (Figma 1966:24837).
 */

import { Icon } from '../icons/SailIcons'
import { ArrowsOutwardIcon } from '../icons/ArrowsOutwardIcon'
import SectionHeader from './SectionHeader'
import { PillBadge, RestrictedIcon } from './PillBadge'
import ActionsRequiredSidebarSection from './ActionsRequiredSidebarSection'
import ProfileSectionContent from './ProfileSectionContent'

const ENABLED_BADGE = (
  <PillBadge
    label="Enabled"
    variant="success"
    icon={<Icon name="checkCircleFilled" size={12} fill="var(--color-feedback-success-on)" />}
  />
)

export type AccountStatusKind = 'enabled' | 'restricted' | 'restricted_soon'

type AccountDetailsSidebarProps = {
  /** When 'restricted', shows Restricted badge and Actions required section above Account card. Undefined = customer-only (no status). */
  status?: AccountStatusKind | undefined
  /** Controlled account drawer open state (shared with action bar verification button). */
  accountDrawerOpen?: boolean
  onOpenAccountDrawer?: () => void
  onCloseAccountDrawer?: () => void
  /** When restricted, opens the fullscreen Actions required modal (from section header expand / "N actions required"). */
  onOpenActionsModal?: () => void
  /** When provided, Profile header shows Edit (ghost) button left of expand; opens Settings (deep link). */
  onOpenSettings?: () => void
  /** When true (e.g. radar rule matches), show Account risk (High) + View risk analysis below ID. */
  showAccountRisk?: boolean
  /** Account id for View risk analysis link. */
  accountId?: string
}

export default function AccountDetailsSidebar({
  status,
  accountDrawerOpen = false,
  onOpenAccountDrawer,
  onCloseAccountDrawer,
  onOpenActionsModal,
  onOpenSettings,
  showAccountRisk = false,
  accountId,
}: AccountDetailsSidebarProps) {
  const statusBadge =
    status === 'restricted'
      ? <PillBadge label="Restricted" variant="critical" icon={<RestrictedIcon />} />
      : status === 'restricted_soon'
        ? <PillBadge label="Restricted soon" variant="attention" />
        : status === 'enabled'
          ? ENABLED_BADGE
          : undefined
  const badge =
    statusBadge != null || showAccountRisk ? (
      <div className="flex items-center gap-1">
        {statusBadge}
        {showAccountRisk && (
          <PillBadge label="High risk" variant="critical" />
        )}
      </div>
    ) : status === undefined ? (
      <span className="font-label-medium text-subdued">–</span>
    ) : undefined
  const isRestricted = status === 'restricted'

  return (
    <>
      <div className="flex min-w-[320px] w-full shrink-0 flex-col">
        {isRestricted && onOpenActionsModal && (
          <>
            <ActionsRequiredSidebarSection
              onOpenActionsModal={onOpenActionsModal}
              accountId={accountId}
            />
            <div className="h-[40px] shrink-0" aria-hidden />
          </>
        )}
        <div
          className="flex w-full flex-col gap-2 overflow-hidden rounded-[12px] bg-surface px-4 pb-4 pt-0"
          data-name="baby/card/prop-list_vertical"
          data-node-id="2:6692"
        >
        <div className="flex flex-col w-full shrink-0" data-node-id="2:6693">
          <SectionHeader
            title="Profile"
            size="small"
            badge={badge}
            onEdit={onOpenSettings}
            editLabel="Settings"
            onAction={onOpenAccountDrawer}
            actionIcon={<ArrowsOutwardIcon size={12} fill="var(--color-icon-subdued)" />}
            actionLabel="View details"
          />
        </div>
        <ProfileSectionContent showAccountRisk={showAccountRisk} accountId={accountId} />
        </div>

        {/* 40px gap then placeholder sections */}
        <div className="h-[40px] shrink-0" aria-hidden />
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center rounded-[12px] bg-offset px-4 py-3"
            data-name="Sidebar placeholder: Note"
          >
            <p className="text-[14px] text-subdued">Note — placeholder</p>
          </div>
          <div
            className="flex items-center rounded-[12px] bg-offset px-4 py-3"
            data-name="Sidebar placeholder: Metadata"
          >
            <p className="text-[14px] text-subdued">Metadata — placeholder</p>
          </div>
        </div>
      </div>
    </>
  )
}
