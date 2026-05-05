/**
 * AccountDetail — Config-driven account detail. Status from route/mock drives badge.
 * configType from account drives which sections render (see accountConfigs.ts).
 */

import { useState, useEffect, useMemo } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import AccountDetailHeader from '../components/AccountDetailHeader'
import AccountDetailActionBar, { AccountDetailMainActions, getActionBarVisibility } from '../components/AccountDetailActionBar'
import { PillBadge } from '../components/PillBadge'
import type { ActionsRequiredFilter } from '../components/ActionsRequiredModal'
import AccountDrawer, { type ProfileDrawerTabId } from '../components/AccountDrawer'
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
import { deriveAccountStatus, resolveCapabilityGroups } from '../data/uadVisibility'
import { slugToDisplayName } from '../utils/string'
import PrototypeFloatie from '../components/PrototypeFloatie'
import PrototypeWorkbenchBar from '../components/PrototypeWorkbenchBar'

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
  const [accountDrawerProfileTab, setAccountDrawerProfileTab] = useState<ProfileDrawerTabId>('details')

  const openAccountDrawer = (opts?: { profileTab?: ProfileDrawerTabId }) => {
    setAccountDrawerProfileTab(opts?.profileTab ?? 'details')
    setAccountDrawerOpen(true)
  }
  const [actionsModalOpen, setActionsModalOpen] = useState(false)
  const [actionsModalInitialFilter, setActionsModalInitialFilter] = useState<ActionsRequiredFilter>('all')
  const [actionsModalInitialSegment, setActionsModalInitialSegment] = useState<'blocking' | 'actions' | undefined>(undefined)
  const [actionsModalInitialSelectedActionId, setActionsModalInitialSelectedActionId] = useState<string | undefined>(undefined)
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false)
  const [configureModalOpen, setConfigureModalOpen] = useState(false)
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
  const mockAccountStatus: AccountStatusKind | undefined = hasMerchantConfig
    ? (statusProp ?? statusFromRoute ?? mockAccount?.status ?? 'enabled')
    : undefined
  /** Floatie roles + capabilities drive badge, action bar, drawer, and V2 “Needs attention” (when prototype context exists). */
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
      <PillBadge label="High risk" variant="critical" />
    ) : prototype?.riskLevel === 'elevated' ? (
      <PillBadge label="Elevated risk" variant="attention" />
    ) : null

  const radarOnlyRiskHeaderBadge =
    prototype == null && (mockAccount?.isRadarRuleMatch ?? false) ? (
      <PillBadge label="High risk" variant="critical" />
    ) : null

  const riskHeaderBadge = prototypeRiskHeaderBadge ?? radarOnlyRiskHeaderBadge
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
  const actionBarVisibility = getActionBarVisibility(config, { hasMerchantConfig: hasMerchantConfig ?? false, isRadarRuleMatch: mockAccount?.isRadarRuleMatch })

  const headerStatusBadge =
    status === 'restricted'
      ? <PillBadge label="Restricted" variant="critical" />
      : status === 'restricted_soon'
        ? <PillBadge label="Restricted soon" variant="attention" />
        : status === 'enabled'
          ? <PillBadge label="Enabled" variant="success" />
          : undefined
  const headerBadge =
    headerStatusBadge != null || riskHeaderBadge != null ? (
      <div className="flex items-center gap-1">
        {headerStatusBadge}
        {riskHeaderBadge}
      </div>
    ) : undefined

  return (
    <div className="flex h-full w-full min-w-0 flex-col px-6" data-name="AccountDetail">
      {/* Header + action bar — flush under shell global bar; horizontal gutter px-6. Identity card keeps internal top padding. */}
      <div className="flex w-full min-w-0 shrink-0 flex-col">
        <AccountDetailHeader
          accountName={accountName}
          breadcrumbs={breadcrumbs}
          badge={headerBadge}
          accountEmail={mockAccount?.email}
          showAccountAvatar={hasMerchantConfig}
          identityBleedClassName="-mx-6 px-6"
          trailing={
            <AccountDetailMainActions
              visibility={actionBarVisibility}
              onOpenAccountDrawer={openAccountDrawer}
              accountId={id}
              onOpenSettings={id ? () => navigate(`/network/${id}/settings`) : undefined}
            />
          }
        />
        <div className="w-full">
          <AccountDetailActionBar
              status={status}
              visibility={actionBarVisibility}
              signalRowBorderBleedClassName="-mx-6 px-6"
              onOpenAccountDrawer={openAccountDrawer}
              accountId={id}
              accountName={accountName}
              actionsModalOpen={actionsModalOpen}
              actionsModalInitialFilter={actionsModalInitialFilter}
              actionsModalInitialSegment={actionsModalInitialSegment}
              actionsModalInitialSelectedActionId={actionsModalInitialSelectedActionId}
              onOpenActionsModal={(filter, initialSegment) => {
                setActionsModalOpen(true)
                setActionsModalInitialFilter(filter ?? 'all')
                setActionsModalInitialSegment(initialSegment ?? 'actions')
                setActionsModalInitialSelectedActionId(undefined)
              }}
              onCloseActionsModal={() => setActionsModalOpen(false)}
              onOpenSettings={() => id && navigate(`/network/${id}/settings`)}
              onOpenSettingsSection={(sectionId) => id && navigate(`/network/${id}/settings`, { state: { sectionId } })}
            />
        </div>
      </div>
      {/* Tab row: full-width tab bar; toggle floats above on the right so tab bottom border extends beneath it. */}
      <div className="relative w-full min-w-0 shrink-0 pt-2" data-name="Tabs">
        <TabBar
          tabs={sectionTabs}
          activeId={effectiveSectionId}
          onChange={setActiveSectionId}
          variant="primary"
          gap={12}
        />
        {activityFilter === 'universalToggle' && (
          <div className="absolute right-0 top-0 z-10 flex h-full items-center">
            <ThirdPartyActivityToggle />
          </div>
        )}
      </div>
      {/* Content: 24px below tab bar; gutter matches header (px-6 on page root). */}
      <div className="min-h-0 flex-1 pb-6 pt-6">
        {effectiveSectionId === 'overview' && (
          <div className="flex w-full items-stretch gap-10">
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              {showHighRiskUi && <RadarHighRiskCard accountId={id} />}
              {(() => {
                const OverviewSection = SECTION_COMPONENTS.overview
                return (
                  <OverviewSection
                    config={config}
                    accountId={id}
                    accountName={accountName}
                    onPaymentRowClick={() => setPaymentDrawerOpen(true)}
                    onOpenMoneyMovement={() => setActiveSectionId('moneyMovement')}
                    onOpenActionsModal={(actionId, segment) => {
                      setActionsModalOpen(true)
                      setActionsModalInitialFilter('all')
                      setActionsModalInitialSegment(
                        segment ?? (actionId != null ? 'actions' : undefined)
                      )
                      setActionsModalInitialSelectedActionId(actionId)
                    }}
                  />
                )
              })()}
            </div>
            <div className="min-w-[320px] w-[30%] shrink-0">
                <AccountDetailsSidebar
                status={status}
                accountDrawerOpen={accountDrawerOpen}
                onOpenAccountDrawer={openAccountDrawer}
                onCloseAccountDrawer={() => setAccountDrawerOpen(false)}
                onOpenActionsModal={() => {
                  setActionsModalOpen(true)
                  setActionsModalInitialFilter('all')
                  setActionsModalInitialSegment(undefined)
                  setActionsModalInitialSelectedActionId(undefined)
                }}
                onOpenSettings={() => id && navigate(`/network/${id}/settings`)}
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
            effectiveSectionId === 'financialSnapshot'
              ? {
                  onRowClick: () => setPaymentDrawerOpen(true),
                  onOpenActionsModal: (actionId?: string, segment?: 'blocking' | 'actions') => {
                    setActionsModalOpen(true)
                    setActionsModalInitialFilter('all')
                    setActionsModalInitialSegment(
                      segment ?? (actionId != null ? 'actions' : undefined)
                    )
                    setActionsModalInitialSelectedActionId(actionId)
                  },
                  accountId: id,
                }
              : effectiveSectionId === 'myRevenue' || effectiveSectionId === 'toyboxRevenue'
                ? { onRowClick: () => setPaymentDrawerOpen(true), accountName }
                : { onRowClick: () => setPaymentDrawerOpen(true) }
          return (
            <div className="flex w-full items-stretch gap-10">
              <div className="min-w-0 flex-1 flex-col gap-6 flex">
                {isFirstV2Tab && showHighRiskUi && <RadarHighRiskCard accountId={id} />}
                <SectionComponent {...sectionProps} />
              </div>
              <div className="min-w-[320px] w-[30%] shrink-0">
                <AccountDetailsSidebar
                  status={status}
                  accountDrawerOpen={accountDrawerOpen}
                  onOpenAccountDrawer={openAccountDrawer}
                  onCloseAccountDrawer={() => setAccountDrawerOpen(false)}
                  onOpenActionsModal={() => {
                    setActionsModalOpen(true)
                    setActionsModalInitialFilter('all')
                    setActionsModalInitialSegment(undefined)
                  }}
                  onOpenSettings={() => id && navigate(`/network/${id}/settings`)}
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
              return <SectionComponent />
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
        initialProfileTabId={accountDrawerProfileTab}
        status={status}
        showAccountRisk={showHighRiskUi}
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
      <PrototypeWorkbenchBar onConfigureClick={() => setConfigureModalOpen(true)} />
      <PrototypeFloatie open={configureModalOpen} onClose={() => setConfigureModalOpen(false)} />
    </div>
  )
}
