/**
 * Account detail page header — Figma Stripe Network ’26 **6269:112612** (account hub header).
 *
 * **6269 layout:** Spacing is driven by `accountHubHeaderSpacing.ts` (`--account-hub-*` vars).
 * Edit {@link ACCOUNT_HUB_HEADER_SPACE} or wrap with {@link AccountHubHeaderChrome} `spacing` prop.
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { accountNameInitials } from '../utils/accountInitials'
import { parseGutterBleed } from '../utils/gutterBleed'
import {
  ACCOUNT_BREADCRUMB_CURRENT_CLASS,
  ACCOUNT_BREADCRUMB_LINK_CLASS,
  ACCOUNT_BREADCRUMB_NAV_CLASS,
  PAGE_HEADER_ACCOUNT_HEADING_CLASS,
  PAGE_HEADER_ACCOUNT_HEADING_STYLE,
  type AccountIdentityLayout,
} from './pageHeader'
import { accountHubHeaderGap } from './listView/accountHubHeaderSpacing'

/** 8px breadcrumb separator — matches M1 / nested chrome. */
function BreadcrumbSeparator() {
  return (
    <span className="flex shrink-0 items-center justify-center text-subdued" aria-hidden>
      <svg width={8} height={8} viewBox="0 0 8 8" fill="none" className="shrink-0">
        <path
          d="M3 2L5 4L3 6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/** Figma 145:61888 — 16px envelope beside email (optional; ’26 hub omits icon). */
function EmailGlyph({ className }: { className?: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M2.5 4.5h11v7h-11v-7Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 5.5 8 9l5.5-3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export type { AccountIdentityLayout } from './pageHeader'

export type BreadcrumbItem = { label: string; href: string | null }

/** Brand logo tile — 68×68, 8px radius; fill matches artwork matte (#2D6A6A). */
function AccountHeaderLogoTile({ accountName, src }: { accountName: string; src: string }) {
  return (
    <div
      role="img"
      aria-label={`${accountName} logo`}
      className="size-[68px] shrink-0 overflow-hidden rounded-lg bg-[#2D6A6A]"
      data-name="Logo"
      data-node-id="6269:112624"
    >
      <img src={src} alt="" className="size-full rounded-[8px] object-cover object-center" />
    </div>
  )
}

/** Fallback when `accountLogoSrc` is not set — same frame as logo tile. */
function AccountInitialsMark({ accountName }: { accountName: string }) {
  const initials = accountNameInitials(accountName)
  return (
    <div
      role="img"
      aria-label={`${accountName} (${initials})`}
      className="flex size-[68px] shrink-0 items-center justify-center rounded-lg bg-[#3d4d5c] text-[22px] font-semibold leading-none tracking-[-0.02em] text-white font-label-medium"
      data-name="Account initials"
      data-node-id="6269:112624"
    >
      {initials}
    </div>
  )
}

export default function AccountDetailHeader({
  accountName,
  breadcrumbs = [{ label: 'Network', href: '/network' }],
  heading,
  badge,
  accountEmail,
  /** When false, omit envelope glyph (Figma 6269 email row is text-only). */
  showEmailIcon = false,
  /** Figma logo art — 68×68 tile; initials when omitted. */
  accountLogoSrc,
  showAccountAvatar = true,
  trailing,
  identityLayout = 'full',
  identityBleedClassName,
  /**
   * **surface** — bleed + neutral/25 fill + vertical padding (nested routes with their own gutters).
   * **bare** — identity row only; parent supplies 6269 hub chrome (`bg-neutral-25`, `p-6`, `gap-6`).
   */
  chrome = 'surface',
}: {
  accountName: string
  breadcrumbs?: BreadcrumbItem[]
  heading?: string
  badge?: ReactNode
  accountEmail?: string
  showEmailIcon?: boolean
  accountLogoSrc?: string
  showAccountAvatar?: boolean
  trailing?: ReactNode
  identityLayout?: AccountIdentityLayout
  identityBleedClassName?: string
  chrome?: 'surface' | 'bare'
}) {
  const displayHeading = heading ?? accountName
  const identityBleed = parseGutterBleed(identityBleedClassName)
  /**
   * `accountIdentityCardPaddingClass` retained for layout variant vertical rhythm;
   * 6269 uses uniform padding — compact tightens vertical only.
   */
  const verticalPad =
    identityLayout === 'compact' ? 'py-4' : 'py-6'
  const shellClassName = [
    'bg-neutral-25',
    verticalPad,
    identityBleed?.paddingClass ?? 'px-6',
  ]
    .filter(Boolean)
    .join(' ')

  const identityRow = (
    <div className="flex w-full min-w-0 items-start justify-between gap-4">
      <div className={`flex min-w-0 flex-1 items-center ${accountHubHeaderGap.logoText}`} data-name="Details">
        {showAccountAvatar ? (
          accountLogoSrc ? (
            <AccountHeaderLogoTile accountName={accountName} src={accountLogoSrc} />
          ) : (
            <AccountInitialsMark accountName={accountName} />
          )
        ) : null}
        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col self-start ${accountHubHeaderGap.identityStack} h-fit`}
        >
          <nav
            className={`${ACCOUNT_BREADCRUMB_NAV_CLASS} -mt-1 py-0.5`}
            aria-label="Breadcrumb"
            data-name="Breadcrumbs"
          >
            {breadcrumbs.map((item, i) => (
              <span key={i} className="flex items-center gap-[length:var(--spacing-xsmall)]">
                {item.href ? (
                  <Link to={item.href} className={ACCOUNT_BREADCRUMB_LINK_CLASS}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={ACCOUNT_BREADCRUMB_CURRENT_CLASS}>{item.label}</span>
                )}
                {i < breadcrumbs.length - 1 ? <BreadcrumbSeparator /> : null}
              </span>
            ))}
          </nav>
          <div className={`flex min-w-0 flex-nowrap items-center ${accountHubHeaderGap.titleBadge}`}>
            <h1
              className={`${PAGE_HEADER_ACCOUNT_HEADING_CLASS} m-0`}
              style={PAGE_HEADER_ACCOUNT_HEADING_STYLE}
              data-name="heading"
            >
              {displayHeading}
            </h1>
            {badge != null ? <span className="shrink-0">{badge}</span> : null}
          </div>
          {accountEmail ? (
            <div
              className={`flex items-center justify-start ${accountHubHeaderGap.metadataInner}`}
              data-name="Email"
            >
              {showEmailIcon ? <EmailGlyph className="shrink-0 text-icon-subdued" /> : null}
              <span className="truncate font-label-medium leading-5 tracking-[-0.15px] text-subdued">
                {accountEmail}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      {trailing != null ? (
        <div className="shrink-0 self-start pt-0.5" data-name="Buttons">
          {trailing}
        </div>
      ) : null}
    </div>
  )

  if (chrome === 'bare') {
    return (
      <header className="relative z-20 w-full min-w-0" data-name="Account hub page header">
        {identityRow}
      </header>
    )
  }

  const inner = (
    <div className={shellClassName} data-name="Header" data-node-id="6269:112612">
      {identityRow}
    </div>
  )

  return (
    <header className="relative z-20 w-full min-w-0" data-name="Account hub page header">
      {identityBleed ? <div className={identityBleed.marginClass}>{inner}</div> : inner}
    </header>
  )
}
