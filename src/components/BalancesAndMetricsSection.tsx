/**
 * Balances section for Account detail Overview tab.
 * Figma 24:12288: SectionHeader "Balances" + offset container with composite card (Incoming + Held in reserve) + Financial accounts card.
 */

import BalancesCard from './BalancesCard'
import MiniBarSparkline from './metrics/MiniBarSparkline'
import { GramIcon } from '../icons/GramIcon'
import { DailyPayoutIcon } from '../icons/DailyPayoutIcon'

export type BalancesAndMetricsSectionProps = {
  /** When set, Financial accounts card links to embedded financial-accounts page. */
  accountId?: string
  /** When set, Financial accounts card shows a ghost icon that deep-links to Money management. */
  onOpenMoneyMovement?: () => void
}

export default function BalancesAndMetricsSection({ accountId, onOpenMoneyMovement }: BalancesAndMetricsSectionProps = {}) {
  return (
    <div
      className="flex w-full flex-col gap-2"
      data-name="Balances"
      data-node-id="24:12288"
    >
      <div className="flex flex-col gap-2 rounded-[length:var(--radius-xlarge)] bg-offset p-2">
        {/* Composite card: Incoming earnings (sparkline) + Held in reserve (actions) */}
        <div className="overflow-hidden rounded-[12px] shadow-[0px_2px_5px_0px_rgba(48,49,61,0.08),0px_1px_1px_0px_rgba(0,0,0,0.12)]">
          <BalancesCard
            variant="stackedWithSparkline"
            iconName="refund"
            iconRotate={180}
            label="Incoming earnings"
            subtitle="3 currencies"
            value="$4,321.11"
            valueSubtitle="$2,422.11 available instantly"
            sparkline={<MiniBarSparkline />}
            className="rounded-t-[12px]"
          />
          <BalancesCard
            variant="stacked"
            iconName="lock"
            rowBackground="offset"
            label="Held in reserve"
            subtitle="1 currency"
            value="$321.89"
            onMore={() => {}}
            compactRow
            className="rounded-b-[12px]"
          />
        </div>
        {/* Standalone card: Payouts balance — Figma 23:8880 */}
        <BalancesCard
          variant="payouts"
          iconName="balance"
          label="Payouts balance"
          subtitle="3 currencies"
          value="$6,382.23"
          valueSubtitle="$7,600.00 in transit to bank"
          footerLabel="Daily payouts"
          footerIcon={<DailyPayoutIcon size={12} />}
          onMore={() => {}}
        />
        {/* Standalone card: Financial accounts — blurple icon box, links to financial-accounts page */}
        <BalancesCard
          variant="default"
          icon={<GramIcon size={15} />}
          label="Financial accounts"
          subtitle="6 active"
          value="$6,382.23"
          valueSubtitle="$7,600.00 in transit to bank"
          footerLabel="Earnings settle daily"
          footerIcon={<DailyPayoutIcon size={12} />}
          onMore={() => {}}
          onSecondaryAction={accountId == null ? onOpenMoneyMovement : undefined}
          secondaryActionLabel="Financial accounts"
          href={accountId ? `/network/${accountId}/financial-accounts` : undefined}
          iconBoxClassName="bg-[#635BFF]"
        />
      </div>
    </div>
  )
}