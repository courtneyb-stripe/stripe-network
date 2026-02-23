/**
 * ReturnToAccountFloating — Figma baby/card/pageHeader (214-63411).
 * Floating bar centered 16px from bottom of viewport: "Return to [Account name]" with left arrow.
 * Shown on Transactions when user came from an account (state has accountId + accountName).
 */

import { Link } from 'react-router-dom'

/** Left arrow — baby/NextIcon arrowLeft (Figma). */
function ArrowLeftIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="shrink-0">
      <path
        d="M4.78596 1.03596C5.04224 0.77968 5.45776 0.77968 5.71404 1.03596C5.97032 1.29224 5.97032 1.70776 5.71404 1.96404L2.33433 5.34375H11.25C11.6124 5.34375 11.9063 5.63756 11.9063 6C11.9063 6.36244 11.6124 6.65625 11.25 6.65625H2.33433L5.71404 10.036C5.97032 10.2922 5.97032 10.7078 5.71404 10.964C5.45776 11.2203 5.04224 11.2203 4.78596 10.964L0.285961 6.46404C0.157821 6.3359 0.0937501 6.16795 0.09375 6C0.0937499 5.83205 0.15782 5.6641 0.285961 5.53596L4.78596 1.03596Z"
        fill="currentColor"
      />
    </svg>
  )
}

type ReturnToAccountFloatingProps = {
  accountId: string
  accountName: string
}

export default function ReturnToAccountFloating({ accountId, accountName }: ReturnToAccountFloatingProps) {
  return (
    <div
      className="fixed left-1/2 bottom-4 z-50 -translate-x-1/2"
      style={{
        boxShadow: '0px 1px 2px -0.5px rgba(0,0,0,0.05)',
      }}
      data-name="baby/card/pageHeader"
      data-node-id="214:63411"
    >
      <Link
        to={`/network/${accountId}`}
        className="flex items-center gap-[6px] rounded-[12px] border border-solid px-3 py-2 font-label-medium-emphasized"
        style={{
          backgroundColor: 'var(--color-default)',
          borderColor: 'var(--color-neutral-50)',
          color: 'var(--color-neutral-50)',
        }}
        aria-label={`Return to ${accountName}`}
      >
        <ArrowLeftIcon size={12} />
        <span className="whitespace-nowrap">Return to {accountName}</span>
      </Link>
    </div>
  )
}
