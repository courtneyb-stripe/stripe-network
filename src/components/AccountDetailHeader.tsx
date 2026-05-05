/**
 * Account detail page header — Figma **baby/PageHeader** (node `145:61868`) + identity card (`145:61871`).
 *
 * Dev: https://www.figma.com/design/le2cUdg8571ODSCAPVliJO/Stripe-Network--Cursor-SRC-?node-id=145-61868&m=dev
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { accountNameInitials } from '../utils/accountInitials'
import { parseGutterBleed } from '../utils/gutterBleed'

/** Figma 145:61871 — soft horizontal tint over white. */
const HEADER_CARD_BACKGROUND =
  'linear-gradient(90deg, rgb(244, 247, 250) 0%, rgba(244, 247, 250, 0) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)'

/** 8px breadcrumb separator per Figma (baby/breadcrumb). */
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

/** Figma 145:61888 — 16px envelope beside email (Icon/Subdued). */
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

export type BreadcrumbItem = { label: string; href: string | null }

function AccountInitialsMark({ accountName }: { accountName: string }) {
  const initials = accountNameInitials(accountName)
  return (
    <div
      role="img"
      aria-label={`${accountName} (${initials})`}
      className="flex size-[54px] shrink-0 items-center justify-center rounded-xl bg-[#3d4d5c] font-label-medium text-[18px] font-semibold leading-none tracking-[-0.02em] text-white"
      data-name="Account initials"
      data-node-id="145:61877"
    >
      {initials}
    </div>
  )
}

export default function AccountDetailHeader({
  accountName,
  breadcrumbs = [{ label: 'Network', href: '/network' }],
  /** When set, used for the main heading (e.g. action required title). */
  heading,
  /** Badge(s) shown next to the account name (e.g. Enabled, Restricted, High risk). */
  badge,
  /** Contact line under title (Figma 145:61889). */
  accountEmail,
  /** When false, the initials tile is hidden (default: show). */
  showAccountAvatar = true,
  /** Rendered upper right on the title row (e.g. Move money + icon actions). */
  trailing,
  /**
   * Widen the identity card so background + top border span the full main column (into parent horizontal padding).
   * Match parent gutters, e.g. `-mx-6 px-6` when the page uses `px-6`, or `-mx-10 px-10` for `px-10`.
   */
  identityBleedClassName,
}: {
  accountName: string
  breadcrumbs?: BreadcrumbItem[]
  heading?: string
  badge?: ReactNode
  accountEmail?: string
  showAccountAvatar?: boolean
  trailing?: ReactNode
  identityBleedClassName?: string
}) {
  const displayHeading = heading ?? accountName
  const identityBleed = parseGutterBleed(identityBleedClassName)
  /**
   * Figma 145:61871 — padding 24 top / 40 bottom; 16px stack gap (breadcrumbs → title block).
   * Bottom hairline matches AccountDetailActionBar signal wrapper (`border-b border-neutral-50`); signal row uses `py-4` below.
   */
  /** `overflow-visible` so Move money (and other header) dropdowns are not clipped; border still defines the card edge. */
  const identityCardClassName = `flex w-full min-w-0 flex-col gap-[length:var(--spacing-medium)] overflow-visible border-x-0 border-b border-t border-neutral-50 pb-10 pt-[length:var(--spacing-large)] ${identityBleed?.paddingClass ?? 'px-0'}`

  const identityCard = (
    <div
      className={identityCardClassName}
      style={{ backgroundImage: HEADER_CARD_BACKGROUND }}
      data-node-id="145:61871"
    >
      <nav
        className="flex flex-wrap items-center gap-[length:var(--spacing-small)]"
        aria-label="Breadcrumb"
        data-name="Breadcrumbs"
        data-node-id="145:61873"
      >
        {breadcrumbs.map((item, i) => (
          <span key={i} className="flex items-center gap-[length:var(--spacing-xsmall)]">
            {item.href ? (
              <Link
                to={item.href}
                className="rounded-[length:var(--radius-xsmall)] font-label-small-emphasized tracking-[-0.024px] text-page-header-ink transition-colors hover:text-default focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-label-small-emphasized tracking-[-0.024px] text-page-header-ink whitespace-nowrap">
                {item.label}
              </span>
            )}
            {i < breadcrumbs.length - 1 ? <BreadcrumbSeparator /> : null}
          </span>
        ))}
      </nav>

      <div
        className="flex w-full min-w-0 items-start justify-between gap-4"
        data-node-id="145:61876"
      >
        <div className="flex min-w-0 flex-1 items-start gap-[length:var(--spacing-small)]">
          {showAccountAvatar ? <AccountInitialsMark accountName={accountName} /> : null}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5" data-node-id="145:61878">
            <div className="flex min-w-0 flex-wrap items-center gap-[length:var(--spacing-150)]" data-node-id="145:61879">
              <h1
                className="min-w-0 truncate font-heading-xlarge text-page-header-ink"
                style={{ fontFeatureSettings: "'lnum' 1, 'pnum' 1" }}
                data-name="heading"
                data-node-id="145:61880"
              >
                {displayHeading}
              </h1>
              {badge != null ? <span className="shrink-0">{badge}</span> : null}
            </div>
            {accountEmail ? (
              <div
                className="flex items-start justify-start gap-[6px]"
                data-name="Profile email"
                data-node-id="145:61886"
              >
                  <EmailGlyph className="shrink-0 text-icon-subdued" />
                <span className="truncate font-label-small leading-4 text-page-header-ink" data-node-id="145:61889">
                  {accountEmail}
                </span>
              </div>
            ) : null}
          </div>
        </div>
        {trailing != null ? (
          <div className="shrink-0" data-node-id="145:61890">
            {trailing}
          </div>
        ) : null}
      </div>
    </div>
  )

  return (
    <header
      className="relative z-20 w-full min-w-0"
      data-name="baby/PageHeader"
      data-node-id="145:61868"
    >
      {identityBleed ? (
        <div className={identityBleed.marginClass}>{identityCard}</div>
      ) : (
        identityCard
      )}
    </header>
  )
}
