/**
 * Balances-only section for V1 (Global IA) account detail tab.
 */

import BalancesAndMetricsSection from '../BalancesAndMetricsSection'

export default function BalancesSection() {
  return (
    <div className="flex min-w-0 max-w-[1120px] flex-1 flex-col">
      <BalancesAndMetricsSection />
    </div>
  )
}
