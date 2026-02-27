/**
 * AccountDetailHeader — Figma baby/PageHeader (node 7:6475).
 * Logo + breadcrumbs + account name for the account detail page.
 * Design: Text/Subdued #596171, Text/Default #353A44, 64px logo, 12px breadcrumbs, 28px heading.
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

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

export type BreadcrumbItem = { label: string; href: string | null }

export default function AccountDetailHeader({
  accountName,
  breadcrumbs = [{ label: 'Network', href: '/network' }],
  /** When set, used for the main heading (e.g. action required title); logo initials still use accountName. */
  heading,
  /** Rendered upper right on the same baseline as the page heading (e.g. Payouts/Payments ghost buttons). */
  trailing,
}: {
  accountName: string
  breadcrumbs?: BreadcrumbItem[]
  heading?: string
  trailing?: ReactNode
}) {
  const displayHeading = heading ?? accountName

  return (
    <header
      className="flex w-full flex-col items-start gap-0"
      data-name="baby/PageHeader"
      data-node-id="7:6475"
    >
      {/* Breadcrumbs — 12px Semibold, subdued, 8px gap (Figma baby/breadcrumb) */}
      <nav
        className="flex flex-wrap items-center gap-[8px]"
        aria-label="Breadcrumb"
        data-name="Breadcrumbs"
      >
        {breadcrumbs.map((item, i) => (
          <span key={i} className="flex items-center gap-[8px]">
            {item.href ? (
              <Link
                to={item.href}
                className="font-label-small-emphasized text-subdued whitespace-nowrap transition-colors hover:text-default focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary rounded-[length:var(--radius-xsmall)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-label-small-emphasized text-subdued whitespace-nowrap">
                {item.label}
              </span>
            )}
            {i < breadcrumbs.length - 1 ? <BreadcrumbSeparator /> : null}
          </span>
        ))}
      </nav>
      <div className="mt-0 flex w-full items-baseline justify-between gap-4">
        <h1 className="font-heading-xlarge shrink-0" data-name="heading">
          {displayHeading}
        </h1>
        {trailing != null ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  )
}
