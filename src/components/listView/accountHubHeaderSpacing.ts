/**
 * Account hub header (Figma **6269:112612**) — spacing between logo, breadcrumb, title, badge, metadata, and capability cards.
 *
 * Adjust values here (or pass overrides to {@link accountHubHeaderCssVariables}). Variables inherit to
 * `AccountDetailHeader` when rendered inside {@link AccountHubHeaderChrome}.
 *
 * Fallbacks in class names keep nested routes that only use `AccountDetailHeader` unchanged.
 */

import type { CSSProperties } from 'react'

export const ACCOUNT_HUB_HEADER_SPACE = {
  /** Horizontal gap between 68×68 logo tile and text column. */
  logoTextGap: '16px',
  /** Vertical gap between: breadcrumb row → title+badge row → email/metadata. */
  identityStackGap: '0px',
  /** Horizontal gap between page title and status badges. */
  titleBadgeGap: '8px',
  /** Gap inside metadata row (e.g. icon + email). */
  metadataInnerGap: '4px',
  /** Vertical gap between the identity row (logo + text + actions) and the capability card row. */
  identityToCapabilityCards: '20px',
} as const

export type AccountHubHeaderSpaceOverrides = Partial<typeof ACCOUNT_HUB_HEADER_SPACE>

/** Sets `--account-hub-*` custom properties on a wrapper (e.g. {@link AccountHubHeaderChrome}). */
export function accountHubHeaderCssVariables(
  overrides?: AccountHubHeaderSpaceOverrides
): CSSProperties {
  const s = { ...ACCOUNT_HUB_HEADER_SPACE, ...overrides }
  return {
    '--account-hub-logo-text-gap': s.logoTextGap,
    '--account-hub-identity-stack-gap': s.identityStackGap,
    '--account-hub-title-badge-gap': s.titleBadgeGap,
    '--account-hub-metadata-inner-gap': s.metadataInnerGap,
    '--account-hub-identity-to-cards': s.identityToCapabilityCards,
  }
}

/** Tailwind-friendly arbitrary gaps (with fallbacks for usage outside hub chrome). */
export const accountHubHeaderGap = {
  logoText: 'gap-[var(--account-hub-logo-text-gap,16px)]',
  identityStack: 'gap-[var(--account-hub-identity-stack-gap,0px)]',
  titleBadge: 'gap-[var(--account-hub-title-badge-gap,8px)]',
  metadataInner: 'gap-[var(--account-hub-metadata-inner-gap,4px)]',
  identityToCards: 'gap-[var(--account-hub-identity-to-cards,20px)]',
} as const
