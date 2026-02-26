/**
 * Financial accounts — Nested page: Network / Account name / Financial accounts.
 * Same header position as Account detail main.
 */

import { useParams } from 'react-router-dom'
import AccountDetailHeader from '../components/AccountDetailHeader'
import AccountDetailActionBar from '../components/AccountDetailActionBar'
import { getAccountById } from '../data/mockAccounts'
import type { AccountStatusKind } from '../components/AccountDetailsSidebar'
import { slugToDisplayName } from '../utils/string'
import { useState } from 'react'
import AccountDrawer from '../components/AccountDrawer'

export default function FinancialAccountsList() {
  const { id } = useParams<{ id: string }>()
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false)

  const mockAccount = getAccountById(id)
  const accountName = mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')
  const hasMerchantConfig = mockAccount?.configurations?.includes('Merchant') ?? false
  const status: AccountStatusKind | undefined = hasMerchantConfig ? (mockAccount?.status ?? 'enabled') : undefined

  const breadcrumbs = [
    { label: 'Network IA (onsite)', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
    { label: 'Financial accounts', href: null },
  ]

  return (
    <div className="flex h-full w-full flex-col" data-name="FinancialAccountsList">
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
