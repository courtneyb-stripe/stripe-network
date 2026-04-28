/**
 * Account details sidebar — Figma baby/card/prop-list_vertical (node 2:6692).
 * When restricted: Actions required section (Figma 18-7608) first, then 40px gap, then Account card.
 * Account heading (SectionHeader with expand icon), optional badge, and property list.
 * Expand opens half-screen drawer (Figma 16:6868).
 * Risk level in the profile list follows PrototypeContext (synced from mock account riskLevel, default Low).
 */

import { ArrowsOutwardIcon } from '../icons/ArrowsOutwardIcon'
import SectionHeader from './SectionHeader'
import ProfileSectionContent from './ProfileSectionContent'

export type AccountStatusKind = 'enabled' | 'restricted' | 'restricted_soon'

type AccountDetailsSidebarProps = {
  /** When 'restricted', shows Actions required section above Account card. Badges (Enabled/Restricted/High risk) are shown in the page header next to account name. */
  status?: AccountStatusKind | undefined
  /** Controlled account drawer open state (shared with action bar verification button). */
  accountDrawerOpen?: boolean
  onOpenAccountDrawer?: () => void
  onCloseAccountDrawer?: () => void
  /** When restricted, opens the fullscreen Actions required modal (from action bar). Kept for API compatibility; Needs attention is shown in main when restricted. */
  onOpenActionsModal?: () => void
  /** When provided, Profile header shows Edit (ghost) button left of expand; opens Settings (deep link). */
  onOpenSettings?: () => void
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
  accountId,
}: AccountDetailsSidebarProps) {
  return (
    <>
      <div className="flex min-w-[320px] w-full shrink-0 flex-col">
        <div
          className="flex w-full flex-col gap-2 overflow-hidden rounded-[12px] bg-surface px-4 pb-4 pt-0"
          data-name="baby/card/prop-list_vertical"
          data-node-id="2:6692"
        >
        <div className="flex flex-col w-full shrink-0" data-node-id="2:6693">
          <SectionHeader
            title="Profile"
            size="small"
            onEdit={onOpenSettings}
            editLabel="Settings"
            onAction={onOpenAccountDrawer}
            actionIcon={<ArrowsOutwardIcon size={12} fill="var(--color-icon-subdued)" />}
            actionLabel="View details"
          />
        </div>
        <ProfileSectionContent accountId={accountId} />
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
