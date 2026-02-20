# Design tokens — Figma map (Stripe Network H1 '26)

Tokens are defined in `src/index.css` under `@theme` and used via Tailwind utilities (e.g. `bg-surface`, `text-subdued`) or `var(--color-*)` in custom CSS.

## Colors

| Token | Value | Usage |
|-------|--------|--------|
| `--color-surface` | `#ffffff` | Backgrounds |
| `--color-offset` | `#f5f6f8` | Hover/offset backgrounds |
| `--color-neutral-0` | `#ffffff` | White |
| `--color-neutral-50` | `#ebeef1` | Borders, dividers |
| `--color-neutral-100` | `#d8dee4` | Borders |
| `--color-neutral-700` | `#474e5a` | Text/icons |
| `--color-default` | `#353a44` | Primary text |
| `--color-subdued` | `#596171` | Secondary text |
| `--color-action-primary` | `#533afd` | Primary actions, focus ring |
| `--color-icon-default` | `#474e5a` | Default icon |
| `--color-icon-subdued` | `#6c7688` | Subdued icon |
| `--color-icon-action` | `#675dff` | Action icon |
| `--color-brand-25` | `#f7f5fd` | Brand tint |
| `--color-feedback-success-subdued` | `#eafcdd` | Success badge bg |
| `--color-feedback-success-on` | `#217005` | Success badge text |
| `--color-feedback-attention-subdued` | `#fdf8c9` | Attention badge bg |
| `--color-feedback-attention-on` | `#b13600` | Attention badge text |
| `--color-feedback-critical-subdued` | `#fef4f6` | Critical badge bg |
| `--color-feedback-critical-on` | `#c0123c` | Critical badge text |
| `--color-icon-feedback-critical` | `#e61947` | Critical icon (e.g. restricted) |

## Spacing

| Token | Value |
|-------|--------|
| `--spacing-xsmall` | 4px |
| `--spacing-small` | 8px |
| `--spacing-150` | 12px |
| `--spacing-medium` | 16px |
| `--spacing-250` | 20px |
| `--spacing-350` | 28px |
| `--spacing-xlarge` | 32px |
| `--spacing-large` / `--spacing-300` | 24px |
| `--spacing-800` | 64px |

## Border radius

| Token | Value |
|-------|--------|
| `--radius-xsmall` | 4px |
| `--radius-small` / `--radius-form` / `--radius-action` | 6px |
| `--radius-xlarge` | 16px |
| `--radius-rounded` | 9999px |

## Shadow

| Token | Value |
|-------|--------|
| `--shadow-button` | `0 1px 1px rgba(33, 37, 44, 0.16)` |

## Typography (utility classes)

| Class | Figma style | Specs |
|-------|-------------|--------|
| `.font-label-medium` | Label/Medium | 14px Regular, 20px line-height, -0.15px letter-spacing |
| `.font-label-medium-emphasized` | Label/Medium emphasized | 14px Semibold, 20px line-height, -0.15px letter-spacing |
| `.font-label-small` | Label/Small | 12px Regular, 16px line-height |
| `.font-label-small-emphasized` | Label/Small emphasized | 12px Semibold, 16px line-height, -0.2px letter-spacing |
| `.font-heading-xsmall-subdued` | Heading/XSmall subdued | 12px Regular, 20px line-height |
| `.font-heading-large-subdued` | Heading/Large subdued | 24px Regular, 32px line-height, 0.3px letter-spacing |
| `.font-heading-xlarge` | Heading/XLarge | 28px Bold, 36px line-height, 0.38px letter-spacing |

Body base: SF Pro Text, 14px, 20px line-height, -0.15px letter-spacing.
