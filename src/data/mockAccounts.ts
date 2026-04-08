/**
 * Mock accounts for account detail view and network list.
 * status drives the header badge (Enabled vs Restricted) and action bar (Payouts/Payments paused when restricted).
 * configType drives which sections render (see accountConfigs.ts).
 * isRadarRuleMatch: when true, show Account risk section in sidebar/drawer (any config).
 * riskLevel: optional; omit for Low. Radar matches use riskLevel 'high' (syncs prototype risk when route account id changes).
 * Rule: getAccountById must resolve for any id from the network list so status is consistent (no reliance on link state only).
 */

import type { ConfigType } from './accountConfigs'
import type { RiskLevel } from './configMatrix'
import { generateNetworkRows } from './networkDummyData'

export type AccountStatus = 'enabled' | 'restricted' | 'restricted_soon'

export type MockAccount = {
  id: string
  name: string
  status: AccountStatus
  configType: ConfigType
  /** When true, account appears under Radar rule match — show Account risk + View risk analysis regardless of configType. */
  isRadarRuleMatch?: boolean
  /** When set, seeds prototype risk for this account (e.g. high for Radar matches). Omit for Low. */
  riskLevel?: RiskLevel
  email: string
  configurations: string
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 'toybox-labs',
    name: 'Toybox Labs',
    status: 'enabled',
    configType: 'merchant',
    email: 'contact@example.com',
    configurations: 'Merchant, Customer',
  },
  {
    id: 'acme-corp',
    name: 'Acme Corp',
    status: 'restricted',
    configType: 'merchant',
    email: 'billing@acmecorp.example',
    configurations: 'Merchant, Customer',
  },
  {
    id: 'summit-inc',
    name: 'Summit Inc',
    status: 'enabled',
    configType: 'customer',
    email: 'hello@summitinc.example',
    configurations: 'Merchant, Customer',
  },
  {
    id: 'radar-match-demo',
    name: 'Radar Match Demo',
    status: 'enabled',
    configType: 'merchant',
    isRadarRuleMatch: true,
    riskLevel: 'high',
    email: 'risk@example.com',
    configurations: 'Merchant',
  },
  {
    id: 'atlas-corp-15',
    name: 'Atlas Corp',
    status: 'enabled',
    configType: 'merchant',
    isRadarRuleMatch: true,
    riskLevel: 'high',
    email: 'atlas@example.com',
    configurations: 'Merchant',
  },
]

/** Map of id -> account for all network list rows (mock + generated) so status is consistent on direct load/refresh. */
const ACCOUNTS_BY_ID = ((): Map<string, MockAccount> => {
  const map = new Map<string, MockAccount>()
  for (const a of MOCK_ACCOUNTS) {
    map.set(a.id, a)
  }
  const configType = (config: string): ConfigType =>
    config.includes('Merchant') ? 'merchant' : 'customer'
  const toStatus = (s: 'enabled' | 'restricted_soon' | 'restricted' | null): AccountStatus =>
    s === 'restricted_soon' ? 'restricted_soon' : s === 'restricted' ? 'restricted' : 'enabled'
  for (const row of generateNetworkRows()) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        name: row.account,
        status: toStatus(row.status),
        configType: configType(row.configurations),
        isRadarRuleMatch: row.isRadarRuleMatch || undefined,
        riskLevel: row.isRadarRuleMatch ? 'high' : undefined,
        email: row.email,
        configurations: row.configurations,
      })
    }
  }
  return map
})()

export function getAccountById(id: string | undefined): MockAccount | undefined {
  if (!id) return undefined
  return ACCOUNTS_BY_ID.get(id)
}
