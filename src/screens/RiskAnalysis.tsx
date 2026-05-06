/**
 * Risk analysis — Nested page under account: Network / Account name / Risk analysis.
 * Same header and action bar as account detail (including prototype-configured status + risk badges); no tabs.
 */

import { useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import AccountDetailHeader from '../components/AccountDetailHeader'
import AccountDetailActionBar, {
  AccountDetailMainActions,
  getActionBarVisibility,
} from '../components/AccountDetailActionBar'
import AccountDrawer from '../components/AccountDrawer'
import { PillBadge } from '../components/PillBadge'
import { getAccountById } from '../data/mockAccounts'
import { configTemplates } from '../data/accountConfigs'
import type { AccountStatusKind } from '../components/AccountDetailsSidebar'
import { slugToDisplayName } from '../utils/string'
import { usePrototypeOptional } from '../context/PrototypeContext'
import { deriveAccountStatus, resolveCapabilityGroups } from '../data/uadVisibility'
import { buildCapabilityDrawerGroupRows } from '../data/capabilityDrawerModel'

type RouteStateStatus = 'enabled' | 'restricted' | 'restricted_soon' | null

export default function RiskAnalysis() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const prototype = usePrototypeOptional()
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false)
  const [actionsModalOpen, setActionsModalOpen] = useState(false)
  const [actionsModalFilter, setActionsModalFilter] = useState<'all' | 'payouts' | 'payments'>('all')
  const [capabilityDrawerOpen, setCapabilityDrawerOpen] = useState(false)
  const [capabilityDrawerPanelId, setCapabilityDrawerPanelId] = useState<string | null>(null)

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
  const routeState = location.state as { status?: RouteStateStatus; accountName?: string } | null
  const statusFromRoute =
    routeState?.status === 'enabled' ||
    routeState?.status === 'restricted' ||
    routeState?.status === 'restricted_soon'
      ? routeState.status
      : undefined
  const accountName =
    mockAccount?.name ?? routeState?.accountName ?? (id ? slugToDisplayName(id) : '—')
  const hasMerchantConfig = mockAccount?.configurations?.includes('Merchant') ?? false
  const mockAccountStatus: AccountStatusKind | undefined = hasMerchantConfig
    ? (statusFromRoute ?? mockAccount?.status ?? 'enabled')
    : undefined
  const status: AccountStatusKind | undefined = useMemo(() => {
    if (!hasMerchantConfig) return undefined
    if (prototype == null) return mockAccountStatus
    const groups = resolveCapabilityGroups(new Set(prototype.activeRoles), prototype.hasBilling)
    const d = deriveAccountStatus(prototype.capabilityStatuses, groups)
    if (d == null) return undefined
    return d
  }, [hasMerchantConfig, prototype, mockAccountStatus])

  const showHighRiskUi =
    (mockAccount?.isRadarRuleMatch ?? false) || prototype?.riskLevel === 'high'

  const prototypeRiskHeaderBadge =
    prototype?.riskLevel === 'high' ? (
      <PillBadge label="High risk" variant="critical" dense />
    ) : prototype?.riskLevel === 'elevated' ? (
      <PillBadge label="Elevated risk" variant="attention" dense />
    ) : null

  const radarOnlyRiskHeaderBadge =
    prototype == null && (mockAccount?.isRadarRuleMatch ?? false) ? (
      <PillBadge label="High risk" variant="critical" dense />
    ) : null

  const riskHeaderBadge = prototypeRiskHeaderBadge ?? radarOnlyRiskHeaderBadge

  const config = configTemplates[mockAccount?.configType ?? 'merchant']
  const visibility = getActionBarVisibility(config, {
    hasMerchantConfig: hasMerchantConfig ?? false,
    isRadarRuleMatch: mockAccount?.isRadarRuleMatch,
  })

  const capabilityDrawerGroups = useMemo(() => {
    if (prototype == null) return []
    return buildCapabilityDrawerGroupRows(prototype, visibility)
  }, [prototype, visibility])

  const breadcrumbs = [
    { label: 'Network', href: '/network' },
    { label: accountName, href: id ? `/network/${id}` : null },
    { label: 'Risk analysis', href: null },
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
    headerStatusBadge != null || riskHeaderBadge != null ? (
      <div className="flex items-center gap-1">
        {headerStatusBadge}
        {riskHeaderBadge}
      </div>
    ) : undefined

  return (
    <div className="flex h-full w-full flex-col" data-name="RiskAnalysis">
      <div className="flex min-h-[160px] shrink-0 items-start gap-6 px-10 pt-6 pb-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <AccountDetailHeader
              accountName={accountName}
              accountLogoSrc={mockAccount?.headerLogoSrc}
              breadcrumbs={breadcrumbs}
              badge={headerBadge}
              identityBleedClassName="-mx-10 px-10"
              trailing={
                <AccountDetailMainActions
                  visibility={visibility}
                  onOpenAccountDrawer={openAccountDrawer}
                  accountId={id}
                  onOpenSettings={id ? () => navigate(`/network/${id}/settings`) : undefined}
                  merchantNameForMenu={accountName}
                />
              }
            />
          </div>
          <div className="-ml-10 pl-10">
            <AccountDetailActionBar
              status={status}
              visibility={visibility}
              onOpenAccountDrawer={openAccountDrawer}
              accountId={id}
              accountName={accountName}
              actionsModalOpen={actionsModalOpen}
              actionsModalInitialFilter={actionsModalFilter}
              actionsModalInitialSegment="actions"
              onOpenActionsModal={(f) => {
                setActionsModalOpen(true)
                setActionsModalFilter(f === 'both' || f === 'other' ? 'all' : (f ?? 'all'))
              }}
              onCloseActionsModal={() => setActionsModalOpen(false)}
              onOpenSettings={() => id && navigate(`/network/${id}/settings`)}
              onOpenSettingsSection={(sectionId) =>
                id && navigate(`/network/${id}/settings`, { state: { sectionId } })
              }
              onOpenCapabilityPanel={openCapabilityPanel}
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
        showAccountRisk={showHighRiskUi}
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
    </div>
  )
}
