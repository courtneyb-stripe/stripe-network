/**
 * Money management section — Main: Balances and Financial snapshot.
 * Sidebar: Financial accounts only.
 */

import { useState } from 'react'
import { TIME_RANGE_OPTIONS, type TimeRange } from '../metrics/constants'
import { useNavigate, useParams } from 'react-router-dom'
import BalancesCard from '../BalancesCard'
import FinancialAccountsSidebar from '../FinancialAccountsSidebar'
import type { FinancialAccountCard } from '../FinancialAccountsSidebar'
import FinancialSnapshot from '../FinancialSnapshot'

const FINANCIAL_ACCOUNT_CARDS: FinancialAccountCard[] = [
  { id: 'main', accountName: 'Main', accountMask: '••1547', amount: '$8,092.34' },
  { id: 'savings', accountName: 'Savings', accountMask: '••7782', amount: '$25,092.34' },
]

export default function MoneyMovement() {
  const { id: accountId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [financialTimeRange, setFinancialTimeRange] = useState<TimeRange>('Last 30 days')

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full gap-[40px]">
          {/* Main content: Balances (Figma 29:10264) + Financial snapshot */}
          <div className="flex min-w-0 flex-1 flex-col gap-10">
            {/* Balances section — content ref Figma 29:10264; built with BalancesCard */}
            <div className="flex w-full flex-col gap-2" data-node-id="29:10264">
              <div className="flex flex-col gap-2 rounded-[16px] bg-offset p-2">
                <div className="overflow-hidden rounded-[12px] shadow-[0px_2px_5px_0px_rgba(48,49,61,0.08),0px_1px_1px_0px_rgba(0,0,0,0.12)]">
                  <BalancesCard
                    variant="stackedWithSparkline"
                    iconName="refund"
                    iconRotate={180}
                    label="Total balance"
                    subtitle="3 currencies"
                    value="$4,321.11"
                    valueSubtitle="$2,422.11 available instantly"
                    className="rounded-t-[12px]"
                  />
                  <BalancesCard
                    variant="stacked"
                    iconName="lock"
                    rowBackground="offset"
                    label="Pending"
                    subtitle="1 currency"
                    value="$321.89"
                    compactRow
                    className="rounded-b-[12px]"
                  />
                </div>
                <BalancesCard
                  variant="default"
                  iconName="balance"
                  label="Funds on hold"
                  subtitle="3 currencies"
                  value="$6,382.23"
                  valueSubtitle="$7,600.00 in transit to bank"
                />
              </div>
            </div>
            <FinancialSnapshot
              moneyIn="$84,200.00"
              moneyOut="$36,800.00"
              netFlow="$47,400"
              timeRangeValue={financialTimeRange}
              timeRangeOptions={TIME_RANGE_OPTIONS}
              onTimeRangeChange={setFinancialTimeRange}
            />
          </div>
          {/* Sidebar: Financial accounts only */}
          <div className="flex min-w-[320px] w-[30%] shrink-0 flex-col gap-6">
            <FinancialAccountsSidebar
              accountCards={FINANCIAL_ACCOUNT_CARDS}
              accountId={accountId}
              onHeaderAction={
                accountId
                  ? () => navigate(`/network/${accountId}/financial-accounts`)
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </>
  )
}
