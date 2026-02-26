/**
 * Risk analysis — Nested page under account: Network / Account name / Risk analysis.
 * Same header and action bar as account detail; no tabs; placeholder content.
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import AccountDetailHeader from '../components/AccountDetailHeader'
import AccountDetailActionBar from '../components/AccountDetailActionBar'
import AccountDrawer from '../components/AccountDrawer'
import { getAccountById } from '../data/mockAccounts'
import type { AccountStatusKind } from '../components/AccountDetailsSidebar'
import { slugToDisplayName } from '../utils/string'

export default function RiskAnalysis() {
  const { id } = useParams<{ id: string }>()
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false)

  const mockAccount = getAccountById(id)
  const accountName =
    mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')
  const hasMerchantConfig = mockAccount?.configurations?.includes('Merchant') ?? false
  const status: AccountStatusKind | undefined = hasMerchantConfig ? (mockAccount?.status ?? 'enabled') : undefined

  const breadcrumbs = [
    { label: 'Network', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
    { label: 'Risk analysis', href: null },
  ]

  return (
    <div className="flex h-full w-full flex-col" data-name="RiskAnalysis">
      {/* Same header position as Account detail main: min-h-[160px], pt-6, items-start, px-10 */}
      <div className="flex min-h-[160px] shrink-0 items-start gap-6 px-10 pt-6 pb-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <AccountDetailHeader accountName={accountName} breadcrumbs={breadcrumbs} />
          </div>
          <div className="pt-6">
            <AccountDetailActionBar
              status={status}
              onOpenAccountDrawer={() => setAccountDrawerOpen(true)}
              accountId={id}
            />
          </div>
        </div>
      </div>
      {/* No tabs — placeholder content */}
      <div className="min-h-0 flex-1 overflow-auto px-10 pt-6 pb-6">
        <div
          className="flex min-h-[280px] w-full items-center justify-center rounded-[12px] bg-neutral-100 text-subdued font-label-medium"
          data-name="Risk page placeholder"
        >
          Risk — placeholder
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
