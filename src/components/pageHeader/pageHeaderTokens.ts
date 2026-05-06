/**
 * Shared layout + type scale for page headers. Update here to keep surfaces consistent.
 *
 * **IA variants (prototype):**
 *
 * | Variant | Shell / chrome | Typical routes |
 * |---------|----------------|----------------|
 * | **Parent list** | {@link PARENT_LIST_PAGE_HEADER_SHELL_CLASS} | `/network`, `/transactions` |
 * | **Account hub** | {@link AccountDetailHeader} Figma **6269:112612** (`bg-offset`, 24px padding) | `/network/:id` |
 * | **Nested detail** | Identity compact ({@link ACCOUNT_IDENTITY_CARD_PADDING_COMPACT_CLASS}) or full + M1 filter | Account-scoped lists/hubs (invoices, financial accounts, …) |
 *
 * Parent list header visual: Figma Stripe Network ’26 **6269:112533** (title + pill toolbar + tabs; horizontal inset aligns with M1 filter `px-6`).
 */

/**
 * Parent list shell — Figma 6269:112533 (`pt-[8px] px-[24px]`).
 * Title row and tabs region add their own vertical padding.
 */
export const PARENT_LIST_PAGE_HEADER_SHELL_CLASS = 'flex w-full flex-col px-6 pt-2'

/** Title + actions row (`py-[8px]` in Figma). */
export const PARENT_LIST_TITLE_ROW_CLASS =
  'flex w-full min-h-8 shrink-0 items-center justify-between gap-4 py-2'

/** Primary tabs row (`pb-[8px]` in Figma). */
export const PARENT_LIST_TABS_REGION_CLASS = 'flex w-full shrink-0 flex-col pb-2'

export const PAGE_HEADER_ACTIONS_ROW_GAP_CLASS = 'gap-2'

/**
 * H1 — Figma 6269:112533: 28px bold, 36 line-height, **Text/Default** as page title ink (#1a2c44).
 */
export const PAGE_HEADER_PARENT_LIST_HEADING_CLASS =
  'font-heading-xlarge shrink-0 text-page-header-ink'

/** Tabular figures for parent-list titles (matches account hub heading). */
export const PAGE_HEADER_PARENT_LIST_HEADING_STYLE = {
  fontFeatureSettings: "'lnum' 1, 'pnum' 1",
} as const

/** H1 on account / nested chrome (baby/PageHeader). */
export const PAGE_HEADER_ACCOUNT_HEADING_CLASS =
  'min-w-0 truncate font-heading-xlarge text-page-header-ink'

/** Apply to {@link PAGE_HEADER_ACCOUNT_HEADING_CLASS} elements. */
export const PAGE_HEADER_ACCOUNT_HEADING_STYLE = {
  fontFeatureSettings: "'lnum' 1, 'pnum' 1",
} as const

export const ACCOUNT_BREADCRUMB_NAV_CLASS =
  'flex flex-wrap items-center gap-[length:var(--spacing-small)]'

export const ACCOUNT_BREADCRUMB_LINK_CLASS =
  'rounded-[length:var(--radius-xsmall)] font-label-small-emphasized tracking-[-0.024px] text-page-header-ink transition-colors hover:text-default focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary'

export const ACCOUNT_BREADCRUMB_CURRENT_CLASS =
  'font-label-small-emphasized tracking-[-0.024px] text-page-header-ink whitespace-nowrap'

/** Shared card frame (gradient applied in component). */
export const ACCOUNT_IDENTITY_CARD_FRAME_CLASS =
  'flex w-full min-w-0 flex-col gap-[length:var(--spacing-medium)] overflow-visible border-x-0 border-b border-t border-neutral-50'

/** Main account hub — Figma 145:61871 (24 top / 40 bottom). */
export const ACCOUNT_IDENTITY_CARD_PADDING_FULL_CLASS =
  'pb-10 pt-[length:var(--spacing-large)]'

/** Nested detail object lists — tighter bottom before M1 filter / table. */
export const ACCOUNT_IDENTITY_CARD_PADDING_COMPACT_CLASS =
  'pb-6 pt-[length:var(--spacing-large)]'

export type AccountIdentityLayout = 'full' | 'compact'

export function accountIdentityCardPaddingClass(layout: AccountIdentityLayout): string {
  return layout === 'compact'
    ? ACCOUNT_IDENTITY_CARD_PADDING_COMPACT_CLASS
    : ACCOUNT_IDENTITY_CARD_PADDING_FULL_CLASS
}
