/**
 * AccountDetail — Config-driven account detail. Status from route/mock drives badge.
 * configType from account drives which sections render (see accountConfigs.ts).
 */

import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import AccountDetailHeader from '../components/AccountDetailHeader'
import AccountDetailActionBar, { getActionBarVisibility } from '../components/AccountDetailActionBar'
import MetricCard from '../components/metrics/MetricCard'
import type { ActionsRequiredFilter } from '../components/ActionsRequiredModal'
import AccountDrawer from '../components/AccountDrawer'
import AccountDetailsSidebar, { type AccountStatusKind } from '../components/AccountDetailsSidebar'
import SettingsModal from '../components/SettingsModal'
import TabBar from '../components/TabBar'
import { SECTION_COMPONENTS, BillingSidebar } from '../components/sections'
import RadarHighRiskCard from '../components/RadarHighRiskCard'
import ThirdPartyActivityToggle from '../components/ThirdPartyActivityToggle'
import { usePrototypeOptional } from '../context/PrototypeContext'
import { configTemplates, SECTION_LABELS, type ConfigType } from '../data/accountConfigs'
import { getAccountById } from '../data/mockAccounts'
import { slugToDisplayName } from '../utils/string'

export type AccountDetailStatus = 'enabled' | 'restricted' | 'restricted_soon'

/** Status from network list link state (row.status). When present, used for badge/sidebar/drawer. */
type RouteStateStatus = AccountDetailStatus | null

type AccountDetailProps = {
  /** Drives badge in account section and drawer. Defaults from link state (view chip) or mock when not passed. */
  status?: AccountDetailStatus
}

export default function AccountDetail({ status: statusProp }: AccountDetailProps) {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false)
  const [actionsModalOpen, setActionsModalOpen] = useState(false)
  const [actionsModalInitialFilter, setActionsModalInitialFilter] = useState<ActionsRequiredFilter>('all')
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [settingsSectionId, setSettingsSectionId] = useState<string | undefined>(undefined)
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false)
  const prototype = usePrototypeOptional()
  const activityFilter = prototype?.activityFilter ?? 'viewChip'

  const mockAccount = getAccountById(id)
  const routeState = location.state as { status?: RouteStateStatus; accountName?: string } | null

  const accountName =
    mockAccount?.name ?? routeState?.accountName ?? (id ? slugToDisplayName(id) : '—')
  const statusFromRoute =
    routeState?.status === 'enabled' || routeState?.status === 'restricted' || routeState?.status === 'restricted_soon'
      ? routeState.status
      : undefined
  /** Only merchant configs get a status; customer-only accounts have no status (undefined). */
  const hasMerchantConfig = mockAccount?.configurations?.includes('Merchant') ?? false
  const status: AccountStatusKind | undefined = hasMerchantConfig
    ? (statusProp ?? statusFromRoute ?? mockAccount?.status ?? 'enabled')
    : undefined
  const configType: ConfigType = mockAccount?.configType ?? 'merchant'
  const config = configTemplates[configType]
  /** Sections to hide from the tab bar (keep in config for later). */
  const HIDDEN_SECTIONS = ['products'] as const
  const visibleSections = config.sections.filter((id) => !HIDDEN_SECTIONS.includes(id as (typeof HIDDEN_SECTIONS)[number]))
  const sectionTabs = visibleSections.map((sectionId) => ({
    id: sectionId,
    label: SECTION_LABELS[sectionId] ?? sectionId,
  }))
  const firstSectionId = visibleSections[0] ?? config.sections[0] ?? 'overview'
  const [activeSectionId, setActiveSectionId] = useState<string>(firstSectionId)
  useEffect(() => {
    setActiveSectionId(firstSectionId)
  }, [id, configType, firstSectionId])
  /** When active section is hidden (e.g. products), show first visible section. */
  const effectiveSectionId = visibleSections.includes(activeSectionId)
    ? activeSectionId
    : firstSectionId

  const breadcrumbs = [{ label: 'Network', href: '/network' }]

  const LTV_METRIC_OPTIONS = [
    { id: 'volume', label: 'Lifetime volume' },
    { id: 'value', label: 'Lifetime value' },
  ] as const
  const [ltvMetric, setLtvMetric] = useState<'volume' | 'value'>('volume')
  const ltvDisplay = ltvMetric === 'volume'
    ? { value: '$9.88K', changePercent: '+2.4%' }
    : { value: '$24.6K', changePercent: '-0.8%' }

  return (
    <div className="flex h-full w-full flex-col" data-name="AccountDetail">
      {/* Header + action bar + LTV card grouped; top-aligned so header position is stable across detail and nested pages. */}
      <div className="flex min-h-[160px] shrink-0 items-start gap-6 px-10 pt-6 pb-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <AccountDetailHeader accountName={accountName} breadcrumbs={breadcrumbs} />
          </div>
          <div className="pt-6">
            <AccountDetailActionBar
              status={status}
              visibility={getActionBarVisibility(config, { isRadarRuleMatch: mockAccount?.isRadarRuleMatch })}
              onOpenAccountDrawer={() => setAccountDrawerOpen(true)}
              accountId={id}
              actionsModalOpen={actionsModalOpen}
              actionsModalInitialFilter={actionsModalInitialFilter}
              onOpenActionsModal={(filter) => {
                setActionsModalOpen(true)
                setActionsModalInitialFilter(filter ?? 'all')
              }}
              onCloseActionsModal={() => setActionsModalOpen(false)}
              onOpenSettings={() => {
                setSettingsSectionId(undefined)
                setSettingsModalOpen(true)
              }}
            />
          </div>
        </div>
        <div className="flex h-[120px] w-[200px] shrink-0 items-center justify-center">
          <MetricCard
            variant="labelValueSparkline"
            label="Lifetime volume"
            value={ltvDisplay.value}
            changePercent={ltvDisplay.changePercent}
            changeTooltipLabel="Change over last 30 days"
            metricOptions={[...LTV_METRIC_OPTIONS]}
            metricValue={ltvMetric}
            onMetricChange={(id) => setLtvMetric(id as 'volume' | 'value')}
            className="h-full w-full"
          />
        </div>
      </div>
      {/* Tab row: full-width tab bar; toggle floats above on the right so tab bottom border extends beneath it. */}
      <div className="relative w-full shrink-0 pl-10 pr-10 pt-2" data-name="Tabs">
        <TabBar
          tabs={sectionTabs}
          activeId={effectiveSectionId}
          onChange={setActiveSectionId}
          variant="primary"
          gap={12}
        />
        {activityFilter === 'universalToggle' && (
          <div className="absolute right-10 top-0 z-10 flex h-full items-center">
            <ThirdPartyActivityToggle />
          </div>
        )}
      </div>
      {/* Content: 24px below tab bar; all section first headings align to this */}
      <div className="min-h-0 flex-1 overflow-auto pb-6 pt-[24px] pl-[40px] pr-[40px]">
        {effectiveSectionId === 'overview' && (
          <div className="flex w-full items-stretch gap-10">
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              {mockAccount?.isRadarRuleMatch && (
                <RadarHighRiskCard accountId={id} />
              )}
              {(() => {
                const OverviewSection = SECTION_COMPONENTS.overview
                return (
                  <OverviewSection
                    config={config}
                    accountId={id}
                    accountName={accountName}
                    onPaymentRowClick={() => setPaymentDrawerOpen(true)}
                    onOpenMoneyMovement={() => setActiveSectionId('moneyMovement')}
                  />
                )
              })()}
            </div>
            <div className="min-w-[320px] w-[30%] shrink-0">
                <AccountDetailsSidebar
                status={status}
                accountDrawerOpen={accountDrawerOpen}
                onOpenAccountDrawer={() => setAccountDrawerOpen(true)}
                onCloseAccountDrawer={() => setAccountDrawerOpen(false)}
                onOpenActionsModal={() => {
                  setActionsModalOpen(true)
                  setActionsModalInitialFilter('all')
                }}
                onOpenSettings={() => {
                  setSettingsSectionId(undefined)
                  setSettingsModalOpen(true)
                }}
                showAccountRisk={mockAccount?.isRadarRuleMatch ?? false}
                accountId={id}
                />
            </div>
          </div>
        )}
        {effectiveSectionId === 'billing' && (
          <div className="flex w-full items-stretch gap-10">
            {(() => {
              const BillingSection = SECTION_COMPONENTS.billing
              return <BillingSection />
            })()}
            <div className="min-w-[320px] w-[30%] shrink-0">
              <BillingSidebar />
            </div>
          </div>
        )}
        {effectiveSectionId !== 'overview' && effectiveSectionId !== 'billing' && (() => {
          const SectionComponent = SECTION_COMPONENTS[effectiveSectionId]
          if (!SectionComponent) return null
          if (effectiveSectionId === 'moneyMovement') {
            return (
              <SectionComponent
                onTransactionRowClick={() => setPaymentDrawerOpen(true)}
              />
            )
          }
          return <SectionComponent />
        })()}
      </div>
      <AccountDrawer
        open={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
        status={status}
        showAccountRisk={mockAccount?.isRadarRuleMatch ?? false}
        accountId={id}
        variant="account"
        onOpenEdit={(section) => {
          setSettingsSectionId(section === 'contact' ? 'contact-information' : 'business-details')
          setSettingsModalOpen(true)
        }}
        onOpenCapabilitiesEdit={() => {
          setSettingsSectionId('capabilities')
          setSettingsModalOpen(true)
        }}
      />
      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        initialSectionId={settingsSectionId}
        accountStatus={status}
      />
      <AccountDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        variant="payment-details"
      />
    </div>
  )
}
