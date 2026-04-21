/**
 * Financial accounts — Nested page: Network / Account name / Financial accounts.
 * Same header position as Account detail main.
 */

import { useParams, useNavigate } from 'react-router-dom'
import AccountDetailHeader from '../components/AccountDetailHeader'
import AccountDetailActionBar, { AccountDetailMainActions, getActionBarVisibility } from '../components/AccountDetailActionBar'
import { PillBadge } from '../components/PillBadge'
import { getAccountById } from '../data/mockAccounts'
import { configTemplates } from '../data/accountConfigs'
import type { AccountStatusKind } from '../components/AccountDetailsSidebar'
import { slugToDisplayName } from '../utils/string'
import { useState } from 'react'
import AccountDrawer from '../components/AccountDrawer'

export default function FinancialAccountsList() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false)
  const [actionsModalOpen, setActionsModalOpen] = useState(false)
  const [actionsModalFilter, setActionsModalFilter] = useState<'all' | 'payouts' | 'payments'>('all')

  const mockAccount = getAccountById(id)
  const accountName = mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')
  const hasMerchantConfig = mockAccount?.configurations?.includes('Merchant') ?? false
  const status: AccountStatusKind | undefined = hasMerchantConfig ? (mockAccount?.status ?? 'enabled') : undefined
  const config = configTemplates[mockAccount?.configType ?? 'merchant']
  const visibility = getActionBarVisibility(config, { hasMerchantConfig: hasMerchantConfig ?? false, isRadarRuleMatch: mockAccount?.isRadarRuleMatch })

  const breadcrumbs = [
    { label: 'Network', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
    { label: 'Financial accounts', href: null },
  ]

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

  return (
    <div className="flex h-full w-full flex-col" data-name="FinancialAccountsList">
      <div className="flex min-h-[160px] shrink-0 items-start gap-6 px-10 pt-6 pb-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <AccountDetailHeader
              accountName={accountName}
              breadcrumbs={breadcrumbs}
              badge={headerBadge}
              identityBleedClassName="-mx-10 px-10"
              trailing={
                <AccountDetailMainActions
                  visibility={visibility}
                  onOpenAccountDrawer={() => setAccountDrawerOpen(true)}
                  accountId={id}
                />
              }
            />
          </div>
          <div className="-ml-10 pl-10 pt-0">
            <AccountDetailActionBar
              status={status}
              visibility={visibility}
              onOpenAccountDrawer={() => setAccountDrawerOpen(true)}
              accountId={id}
              actionsModalOpen={actionsModalOpen}
              actionsModalInitialFilter={actionsModalFilter}
              actionsModalInitialSegment="actions"
              onOpenActionsModal={(f) => { setActionsModalOpen(true); setActionsModalFilter(f ?? 'all') }}
              onCloseActionsModal={() => setActionsModalOpen(false)}
              onOpenSettingsSection={(sectionId) => id && navigate(`/network/${id}/settings`, { state: { sectionId } })}
            />
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-10 pt-6 pb-6">
        <div
          className="flex min-h-[200px] w-full items-center justify-center rounded-[12px] bg-neutral-50 text-subdued font-label-medium"
          data-name="FA list placeholder"
        >
          Financial accounts list
        </div>
      </div>
      <AccountDrawer
        open={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
        status={status}
        showAccountRisk={mockAccount?.isRadarRuleMatch ?? false}
        accountId={id}
        variant="account"
      />
    </div>
  )
}
