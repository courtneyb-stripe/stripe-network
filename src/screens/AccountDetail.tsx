/**
 * AccountDetail — Config-driven account detail. Status from route/mock drives badge.
 * configType from account drives which sections render (see accountConfigs.ts).
 */

import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import AccountDetailHeader from '../components/AccountDetailHeader'
import AccountDetailActionBar, { AccountDetailHeaderStatusButtons, getActionBarVisibility } from '../components/AccountDetailActionBar'
import type { ActionsRequiredFilter } from '../components/ActionsRequiredModal'
import AccountDrawer from '../components/AccountDrawer'
import AccountDetailsSidebar, { type AccountStatusKind } from '../components/AccountDetailsSidebar'
import TabBar from '../components/TabBar'
import { SECTION_COMPONENTS, BillingSidebar, CommerceSidebar } from '../components/sections'
import RadarHighRiskCard from '../components/RadarHighRiskCard'
import ThirdPartyActivityToggle from '../components/ThirdPartyActivityToggle'
import { usePrototypeOptional } from '../context/PrototypeContext'
import type { IaVersionId } from '../context/PrototypeContext'
import {
  configTemplates,
  SECTION_LABELS,
  V1_SECTIONS,
  V1_SECTION_LABELS,
  V2_SECTIONS,
  V2_SECTION_LABELS,
  type ConfigType,
} from '../data/accountConfigs'

const V2_SECTION_IDS = new Set(V2_SECTIONS)
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
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false)
  const navigate = useNavigate()
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
  const iaVersion: IaVersionId = prototype?.iaVersion ?? 'v2-money-movement'

  /** Sections and labels driven by IA version. V0 uses config; V1/V2 use fixed tab sets. */
  const { visibleSections, sectionLabels } = (() => {
    if (iaVersion === 'v1-global-ia') {
      return {
        visibleSections: [...V1_SECTIONS],
        sectionLabels: V1_SECTION_LABELS as Record<string, string>,
      }
    }
    if (iaVersion === 'v2-money-movement') {
      return {
        visibleSections: [...V2_SECTIONS],
        sectionLabels: V2_SECTION_LABELS as Record<string, string>,
      }
    }
    const HIDDEN_SECTIONS = ['products'] as const
    const filtered = config.sections.filter(
      (id) => !HIDDEN_SECTIONS.includes(id as (typeof HIDDEN_SECTIONS)[number])
    )
    return {
      visibleSections: filtered,
      sectionLabels: SECTION_LABELS,
    }
  })()

  const sectionTabs = visibleSections.map((sectionId) => ({
    id: sectionId,
    label: sectionLabels[sectionId] ?? sectionId,
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
  const actionBarVisibility = getActionBarVisibility(config, { isRadarRuleMatch: mockAccount?.isRadarRuleMatch })

  return (
    <div className="flex h-full w-full flex-col" data-name="AccountDetail">
      {/* Header + action bar; top-aligned so header position is stable across detail and nested pages. */}
      <div className="flex h-fit shrink-0 items-start gap-0 pl-10 pr-10 pt-5 pb-0 tracking-normal">
        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <AccountDetailHeader
              accountName={accountName}
              breadcrumbs={breadcrumbs}
              trailing={
                (actionBarVisibility.showPayouts || actionBarVisibility.showPayments) ? (
                  <AccountDetailHeaderStatusButtons
                    showPayouts={actionBarVisibility.showPayouts ?? false}
                    showPayments={actionBarVisibility.showPayments ?? false}
                    status={status}
                    onOpenActionsModal={(filter) => {
                      setActionsModalOpen(true)
                      setActionsModalInitialFilter(filter ?? 'all')
                    }}
                  />
                ) : null
              }
            />
          </div>
          <div className="pt-2">
            <AccountDetailActionBar
              status={status}
              visibility={actionBarVisibility}
              onOpenAccountDrawer={() => setAccountDrawerOpen(true)}
              accountId={id}
              accountName={accountName}
              actionsModalOpen={actionsModalOpen}
              actionsModalInitialFilter={actionsModalInitialFilter}
              onOpenActionsModal={(filter) => {
                setActionsModalOpen(true)
                setActionsModalInitialFilter(filter ?? 'all')
              }}
              onCloseActionsModal={() => setActionsModalOpen(false)}
              onOpenSettings={() => id && navigate(`/network/${id}/settings`)}
            />
          </div>
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
                onOpenSettings={() => id && navigate(`/network/${id}/settings`)}
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
        {effectiveSectionId === 'commerce' && (
          <div className="flex w-full items-stretch gap-10">
            {(() => {
              const CommerceSection = SECTION_COMPONENTS.commerce
              return <CommerceSection />
            })()}
            <div className="min-w-[320px] w-[30%] shrink-0">
              <CommerceSidebar />
            </div>
          </div>
        )}
        {effectiveSectionId === 'network' && (
          <div className="flex w-full items-stretch gap-10">
            {(() => {
              const CommerceSection = SECTION_COMPONENTS.commerce
              return <CommerceSection />
            })()}
            <div className="min-w-[320px] w-[30%] shrink-0">
              <CommerceSidebar />
            </div>
          </div>
        )}
        {V2_SECTION_IDS.has(effectiveSectionId as (typeof V2_SECTIONS)[number]) && (() => {
          const SectionComponent = SECTION_COMPONENTS[effectiveSectionId]
          if (!SectionComponent) return null
          const isFirstV2Tab = effectiveSectionId === 'financialSnapshot'
          const sectionProps =
            effectiveSectionId === 'myRevenue' || effectiveSectionId === 'toyboxRevenue'
              ? { onRowClick: () => setPaymentDrawerOpen(true), accountName }
              : { onRowClick: () => setPaymentDrawerOpen(true) }
          return (
            <div className="flex w-full items-stretch gap-10">
              <div className="min-w-0 flex-1 flex-col gap-6 flex">
                {isFirstV2Tab && mockAccount?.isRadarRuleMatch && (
                  <RadarHighRiskCard accountId={id} />
                )}
                <SectionComponent {...sectionProps} />
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
                  onOpenSettings={() => id && navigate(`/network/${id}/settings`)}
                  showAccountRisk={mockAccount?.isRadarRuleMatch ?? false}
                  accountId={id}
                />
              </div>
            </div>
          )
        })()}
        {effectiveSectionId !== 'overview' &&
          effectiveSectionId !== 'billing' &&
          effectiveSectionId !== 'commerce' &&
          effectiveSectionId !== 'network' &&
          !V2_SECTION_IDS.has(effectiveSectionId as (typeof V2_SECTIONS)[number]) &&
          (() => {
            const SectionComponent = SECTION_COMPONENTS[effectiveSectionId]
            if (!SectionComponent) return null
            if (effectiveSectionId === 'moneyMovement') {
              return (
                <SectionComponent
                  onTransactionRowClick={() => setPaymentDrawerOpen(true)}
                />
              )
            }
            if (effectiveSectionId === 'transactions') {
              return (
                <SectionComponent
                  onRowClick={() => setPaymentDrawerOpen(true)}
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
          const sectionId = section === 'contact' ? 'contact-information' : 'business-details'
          id && navigate(`/network/${id}/settings`, { state: { sectionId } })
        }}
        onOpenCapabilitiesEdit={() => {
          id && navigate(`/network/${id}/settings`, { state: { sectionId: 'capabilities' } })
        }}
      />
      <AccountDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        variant="payment-details"
      />
    </div>
  )
}
