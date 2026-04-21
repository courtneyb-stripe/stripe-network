/**
 * Action required detail — Blank page with global nav, search bar, breadcrumbs.
 * Opened in a new tab when user clicks an item in the Actions required fullscreen modal.
 * Breadcrumbs: Network → Account name → Action required title.
 */

import { useParams } from 'react-router-dom'
import AccountDetailHeader from '../components/AccountDetailHeader'
import { PillBadge } from '../components/PillBadge'
import { getActionTitle } from '../data/actionsRequired'
import { getAccountById } from '../data/mockAccounts'
import type { AccountStatusKind } from '../components/AccountDetailsSidebar'
import { slugToDisplayName } from '../utils/string'

export default function ActionRequiredDetail() {
  const { id, actionId } = useParams<{ id: string; actionId: string }>()

  const mockAccount = getAccountById(id)
  const accountName =
    mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')
  const actionTitle = actionId ? getActionTitle(actionId) : '—'
  const hasMerchantConfig = mockAccount?.configurations?.includes('Merchant') ?? false
  const status: AccountStatusKind | undefined = hasMerchantConfig ? (mockAccount?.status ?? 'enabled') : undefined

  const headerStatusBadge =
    status === 'restricted'
      ? <PillBadge label="Restricted" variant="critical" />
      : status === 'restricted_soon'
        ? <PillBadge label="Restricted soon" variant="attention" />
        : status === 'enabled'
          ? <PillBadge label="Enabled" variant="success" />
          : undefined
  const headerBadge =
    headerStatusBadge != null || mockAccount?.isRadarRuleMatch ? (
      <div className="flex items-center gap-1">
        {headerStatusBadge}
        {mockAccount?.isRadarRuleMatch && (
          <PillBadge label="High risk" variant="critical" />
        )}
      </div>
    ) : undefined

  const breadcrumbs = [
    { label: 'Network', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
    { label: actionTitle, href: null },
  ]

  return (
    <div className="flex h-full w-full flex-col" data-name="ActionRequiredDetail">
      {/* Same header position as Account detail main: min-h-[160px], pt-6, items-start, px-10 */}
      <div className="flex min-h-[160px] shrink-0 items-start gap-6 px-10 pt-6 pb-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <AccountDetailHeader
              accountName={accountName}
              breadcrumbs={breadcrumbs}
              heading={actionTitle}
              badge={headerBadge}
              identityBleedClassName="-mx-10 px-10"
            />
          </div>
        </div>
      </div>
      {/* Rest of page blank */}
      <div className="min-h-0 flex-1" />
    </div>
  )
}
