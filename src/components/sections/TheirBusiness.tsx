/**
 * Payment processing — IA V2/V3. Main = Subscriptions, Payments and invoices (400px tall placeholders);
 * sidebar (320px) = product catalog, payment methods, customers, recipient.
 */

const MAIN_PLACEHOLDERS = ['Subscriptions', 'Payments and invoices'] as const

function mainPlaceholderLabel(name: string) {
  return `${name} with account's customers`
}

const SIDEBAR_LABELS = [
  "Account's product catalog",
  'Local payment methods enabled',
  'Account customers',
  'Account recipients',
] as const

function PlaceholderBox({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div
      className={`flex rounded-[12px] bg-offset px-4 py-4 ${tall ? 'min-h-[400px] items-center justify-center' : 'items-center'}`}
      data-name={`TheirBusiness-${label.replace(/\s+/g, '-')}`}
    >
      <p className={`text-[14px] text-subdued ${tall ? 'text-center' : ''}`}>{label}</p>
    </div>
  )
}

export default function TheirBusiness() {
  return (
    <div className="flex w-full items-stretch gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {MAIN_PLACEHOLDERS.map((name) => (
          <PlaceholderBox key={name} label={mainPlaceholderLabel(name)} tall />
        ))}
      </div>
      <div className="min-w-[320px] w-[30%] shrink-0 flex flex-col gap-6">
        {SIDEBAR_LABELS.map((label) => (
          <PlaceholderBox key={label} label={label} />
        ))}
      </div>
    </div>
  )
}
