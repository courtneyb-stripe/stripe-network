/**
 * FA list row mark — Figma Cursor SRC 142:61212 (Stripe Network).
 * Purple rounded square + white card glyph; sits centered in the offset well tile in the popover.
 */

export function FinancialAccountWellCardMark({
  size = 16,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="16" height="16" rx="2.22222" fill="var(--color-action-primary)" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 11.9979L12 10.3014V3.99792L4 5.71432L4 11.9979Z"
        fill="white"
      />
    </svg>
  )
}
