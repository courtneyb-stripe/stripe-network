/**
 * Nested object chrome — Figma Stripe Network ’26 **6256:22471** (breadcrumbs + page title + offset actions).
 * Sits above the M1 chip row + {@link NestedObjectListFilterGroup} on account-scoped list and detail routes.
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../icons/SailIcons'
import {
  ACCOUNT_BREADCRUMB_CURRENT_CLASS,
  ACCOUNT_BREADCRUMB_LINK_CLASS,
  ACCOUNT_BREADCRUMB_NAV_CLASS,
  PAGE_HEADER_ACCOUNT_HEADING_CLASS,
  PAGE_HEADER_ACCOUNT_HEADING_STYLE,
  ParentListHeaderActions,
  ParentListHeaderCreateButton,
  ParentListHeaderIconPillButton,
} from './pageHeader'

export type NestedPageBreadcrumbItem = { label: string; href: string | null }

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

/** Default trailing toolbar — analytics, export, create (matches parent list header controls). */
export function NestedPageHeaderDefaultActions() {
  return (
    <ParentListHeaderActions>
      <ParentListHeaderIconPillButton aria-label="Analytics">
        <Icon name="barChart" size={12} fill="var(--color-icon-default)" />
      </ParentListHeaderIconPillButton>
      <ParentListHeaderIconPillButton aria-label="Export">
        <Icon name="export" size={12} fill="var(--color-icon-default)" />
      </ParentListHeaderIconPillButton>
      <ParentListHeaderCreateButton
        aria-label="Create"
        icon={<Icon name="add" size={12} fill="var(--color-icon-default)" />}
      >
        Create
      </ParentListHeaderCreateButton>
    </ParentListHeaderActions>
  )
}

export default function NestedPageHeader({
  breadcrumbs,
  title,
  badge,
  trailing = <NestedPageHeaderDefaultActions />,
}: {
  breadcrumbs: NestedPageBreadcrumbItem[]
  title: string
  badge?: ReactNode
  /** Right-side toolbar; default matches Figma 6256:22471. */
  trailing?: ReactNode
}) {
  return (
    <header
      className="relative z-30 w-full min-w-0 shrink-0 py-2"
      data-name="Nested page header"
      data-node-id="6256:22471"
    >
      <div className="flex w-full min-w-0 items-start justify-between gap-4 pt-2">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0">
          <nav
            className={`${ACCOUNT_BREADCRUMB_NAV_CLASS} py-0.5`}
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
          <div className="flex min-w-0 flex-wrap items-center gap-[length:var(--spacing-150)]">
            <h1
              className={PAGE_HEADER_ACCOUNT_HEADING_CLASS}
              style={PAGE_HEADER_ACCOUNT_HEADING_STYLE}
              data-name="Page title"
            >
              {title}
            </h1>
            {badge != null ? <span className="shrink-0">{badge}</span> : null}
          </div>
        </div>
        {trailing != null ? <div className="shrink-0 self-center">{trailing}</div> : null}
      </div>
    </header>
  )
}
