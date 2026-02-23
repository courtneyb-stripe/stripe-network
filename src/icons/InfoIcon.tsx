/**
 * Info icon — NextIcon xsmall info (Sail).
 * Use currentColor so parent can set text-icon-subdued or similar.
 */

type InfoIconProps = {
  size?: number
  className?: string
}

export default function InfoIcon({ size = 12, className = '' }: InfoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.75 1.75L3.25 1.75C2.42157 1.75 1.75 2.42157 1.75 3.25L1.75 8.75C1.75 9.57843 2.42157 10.25 3.25 10.25L8.75 10.25C9.57843 10.25 10.25 9.57843 10.25 8.75L10.25 3.25C10.25 2.42157 9.57843 1.75 8.75 1.75ZM3.25 0.25C1.59315 0.25 0.25 1.59315 0.25 3.25L0.25 8.75C0.25 10.4069 1.59315 11.75 3.25 11.75L8.75 11.75C10.4069 11.75 11.75 10.4069 11.75 8.75L11.75 3.25C11.75 1.59315 10.4069 0.25 8.75 0.25L3.25 0.25Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.48182 6.49998C4.48182 6.11338 4.79522 5.79998 5.18182 5.79998H6.27273C6.65933 5.79998 6.97273 6.11338 6.97273 6.49998V8.49998C6.97273 8.88658 6.65933 9.19998 6.27273 9.19998C5.88613 9.19998 5.57273 8.88658 5.57273 8.49998V7.19998H5.18182C4.79522 7.19998 4.48182 6.88658 4.48182 6.49998Z"
        fill="currentColor"
      />
      <path
        d="M4.99994 3.99999C4.99994 3.44858 5.44854 2.99999 5.99994 2.99999C6.55134 2.99999 6.99994 3.44858 6.99994 3.99999C6.99994 4.55139 6.55134 4.99999 5.99994 4.99999C5.44854 4.99999 4.99994 4.55139 4.99994 3.99999Z"
        fill="currentColor"
      />
    </svg>
  )
}
