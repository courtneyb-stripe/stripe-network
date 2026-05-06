/**
 * Account hub capability summary cards — Figma **6269:112640** (`Payments` tile spec).
 * Reusable layout + chrome tokens; typography uses global `font-label-*` + theme colors.
 *
 * Hover fill matches header {@link AccountDetailActionBar} Move money pill at rest (`HEADER_MAIN_ACTION_PILL` — `#e3eaf0`).
 */

/** Outer button: 144px wide, 8px radius, no stroke (Figma 6269:112640), 12×8 padding, 12px gap to status. */
export const CAPABILITY_GROUP_CARD_BUTTON_CLASS = [
  'flex w-[144px] min-w-[144px] max-w-[144px] shrink-0',
  'items-start',
  'gap-[length:var(--spacing-150)]',
  'rounded-[8px]',
  'border-0',
  'bg-surface',
  'px-[length:var(--spacing-150)] py-[length:var(--spacing-small)]',
  'text-left',
  'overflow-clip',
  'transition-colors hover:bg-[#e3eaf0]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-action-primary',
].join(' ')

/** Figma 6269:112641 — text stack fixed 36px tall (14/20 title + 12/16 subtitle, no extra gap). */
export const CAPABILITY_GROUP_CARD_TEXT_COL_CLASS =
  'flex h-9 min-w-0 flex-1 flex-col justify-center gap-0'

/** Label/Medium, neutral/900 (#1A2C44). */
export const CAPABILITY_GROUP_CARD_TITLE_CLASS = 'truncate font-label-medium text-page-header-ink'

/** Label/Small, neutral/600 (#50617A). */
export const CAPABILITY_GROUP_CARD_SUBTITLE_CLASS = 'truncate font-label-small text-neutral-600'

/** Figma 6269:112644 — 20px-tall well, centers 12×12 status artwork. */
export const CAPABILITY_GROUP_CARD_ICON_WELL_CLASS =
  'flex h-5 shrink-0 items-center justify-center'
