/**
 * Financial account detail — Nested page: Network / Account name / Financial accounts / FA name.
 * Chrome: Figma nested header **6256:22471** + M1 chip row + search; capability action bar below filter.
 */

import { useParams, useNavigate } from 'react-router-dom'
import AccountDetailActionBar, {
  AccountDetailMainActions,
  getActionBarVisibility,
} from '../components/AccountDetailActionBar'
import { PillBadge } from '../components/PillBadge'
import { getAccountById } from '../data/mockAccounts'
import { configTemplates } from '../data/accountConfigs'
import type { AccountStatusKind } from '../components/AccountDetailsSidebar'
import { slugToDisplayName } from '../utils/string'
import { useState, useMemo } from 'react'
import AccountDrawer from '../components/AccountDrawer'
import { usePrototypeOptional } from '../context/PrototypeContext'
import { buildCapabilityDrawerGroupRows } from '../data/capabilityDrawerModel'
import NestedPageHeader from '../components/NestedPageHeader'
import { NestedObjectListFilterGroup } from '../components/NetworkFilterGroup'
import {
  ListViewBody,
  NestedDetailViewHeaderStack,
  NestedDetailViewRoot,
} from '../components/listView/ListViewTemplates'
import { NESTED_FINANCIAL_ACCOUNT_VIEW_CHIPS } from '../data/nestedListViewChips'

/** Map faId slug to display name for breadcrumb. */
function getFinancialAccountName(faId: string): string {
  const names: Record<string, string> = {
    main: 'Main',
    savings: 'Savings',
  }
  return names[faId] ?? faId
}

export default function FinancialAccountDetail() {
  const { id, faId } = useParams<{ id: string; faId: string }>()
  const navigate = useNavigate()
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false)
  const [actionsModalOpen, setActionsModalOpen] = useState(false)
  const [actionsModalFilter, setActionsModalFilter] = useState<'all' | 'payouts' | 'payments'>('all')
  const [capabilityDrawerOpen, setCapabilityDrawerOpen] = useState(false)
  const [capabilityDrawerPanelId, setCapabilityDrawerPanelId] = useState<string | null>(null)
  const [selectedChipId, setSelectedChipId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const openAccountDrawer = () => {
    setCapabilityDrawerOpen(false)
    setCapabilityDrawerPanelId(null)
    setAccountDrawerOpen(true)
  }

  const openCapabilityPanel = (panelId: string) => {
    setAccountDrawerOpen(false)
    setCapabilityDrawerPanelId(panelId)
    setCapabilityDrawerOpen(true)
  }

  const mockAccount = getAccountById(id)
  const accountName = mockAccount?.name ?? (id ? slugToDisplayName(id) : '—')
  const hasMerchantConfig = mockAccount?.configurations?.includes('Merchant') ?? false
  const status: AccountStatusKind | undefined = hasMerchantConfig ? (mockAccount?.status ?? 'enabled') : undefined
  const faName = faId ? getFinancialAccountName(faId) : '—'
  const config = configTemplates[mockAccount?.configType ?? 'merchant']
  const visibility = getActionBarVisibility(config, { hasMerchantConfig: hasMerchantConfig ?? false, isRadarRuleMatch: mockAccount?.isRadarRuleMatch })
  const prototype = usePrototypeOptional()

  const capabilityDrawerGroups = useMemo(() => {
    if (prototype == null) return []
    return buildCapabilityDrawerGroupRows(prototype, visibility)
  }, [prototype, visibility])

  const breadcrumbs = [
    { label: 'Network', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
    { label: 'Financial accounts', href: id ? `/network/${id}/financial-accounts` : null },
  ]

  const headerStatusBadge =
    status === 'restricted'
      ? <PillBadge label="Restricted" variant="critical" dense />
      : status === 'restricted_soon'
        ? <PillBadge label="Restricted soon" variant="attention" dense />
        : status === 'enabled'
          ? <PillBadge label="Enabled" variant="success" dense />
          : undefined
  const headerBadge =
    headerStatusBadge != null || mockAccount?.isRadarRuleMatch ? (
      <div className="flex items-center gap-1">
        {headerStatusBadge}
        {mockAccount?.isRadarRuleMatch && (
          <PillBadge label="High risk" variant="critical" dense />
        )}
      </div>
    ) : undefined

  const chips = NESTED_FINANCIAL_ACCOUNT_VIEW_CHIPS.map((c) => ({ ...c }))

  return (
    <NestedDetailViewRoot dataName="FinancialAccountDetail">
      <NestedDetailViewHeaderStack>
        <NestedPageHeader
          breadcrumbs={breadcrumbs}
          title={faName}
          badge={headerBadge}
          trailing={
            <AccountDetailMainActions
              visibility={visibility}
              onOpenAccountDrawer={openAccountDrawer}
              accountId={id}
              merchantNameForMenu={accountName}
            />
          }
        />
        <NestedObjectListFilterGroup
          chips={chips}
          selectedChipId={selectedChipId}
          onChipSelect={setSelectedChipId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search transactions…"
        />
        <div className="w-full min-w-0 pt-2">
          <AccountDetailActionBar
            status={status}
            visibility={visibility}
            onOpenAccountDrawer={openAccountDrawer}
            accountId={id}
            actionsModalOpen={actionsModalOpen}
            actionsModalInitialFilter={actionsModalFilter}
            actionsModalInitialSegment="actions"
            onOpenActionsModal={(f) => {
              setActionsModalOpen(true)
              setActionsModalFilter(f === 'both' || f === 'other' ? 'all' : (f ?? 'all'))
            }}
            onCloseActionsModal={() => setActionsModalOpen(false)}
            onOpenSettingsSection={(sectionId) => id && navigate(`/network/${id}/settings`, { state: { sectionId } })}
            onOpenCapabilityPanel={openCapabilityPanel}
          />
        </div>
      </NestedDetailViewHeaderStack>
      <ListViewBody className="pb-9 pt-9">
        <div
          className="flex min-h-[200px] w-full items-center justify-center rounded-[12px] bg-neutral-50 text-subdued font-label-medium"
          data-name="FA detail placeholder"
        >
          Financial account detail
        </div>
      </ListViewBody>
      <AccountDrawer
        open={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
        status={status}
        showAccountRisk={mockAccount?.isRadarRuleMatch ?? false}
        accountId={id}
        variant="account"
      />
      <AccountDrawer
        open={capabilityDrawerOpen}
        onClose={() => {
          setCapabilityDrawerOpen(false)
          setCapabilityDrawerPanelId(null)
        }}
        variant="capability-group"
        capabilityDrawerGroups={capabilityDrawerGroups}
        capabilityDrawerFocusedPanelId={capabilityDrawerPanelId}
        onOpenCapabilitiesEdit={() => {
          id && navigate(`/network/${id}/settings`, { state: { sectionId: 'capabilities' } })
        }}
      />
    </NestedDetailViewRoot>
  )
}
