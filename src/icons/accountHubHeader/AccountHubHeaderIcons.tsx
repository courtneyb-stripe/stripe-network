/**
 * Account hub header trailing actions (Figma 6269:112625–638).
 * Icon artwork matches design SVGs: 12×12 glyphs centered in a 16×16 control well; More is 16×16.
 */

import { useId, type ReactNode } from 'react'

const moveMoneyPaths = (
  <>
    <path
      d="M8.44526 6.15031C8.21761 5.93892 7.86169 5.9521 7.65031 6.17975C7.43892 6.4074 7.4521 6.76331 7.67975 6.9747L9.25507 8.4375H1.3125C1.00184 8.4375 0.75 8.68934 0.75 9C0.75 9.31066 1.00184 9.5625 1.3125 9.5625H9.25508L7.67975 11.0253C7.4521 11.2367 7.43892 11.5926 7.65031 11.8203C7.76056 11.939 7.91012 11.9994 8.0603 12C8.19806 12.0006 8.33634 11.9508 8.44526 11.8497L11.0703 9.4122C11.1849 9.30577 11.25 9.15642 11.25 9C11.25 8.84359 11.1849 8.69424 11.0703 8.58781L8.44526 6.15031Z"
      fill="currentColor"
    />
    <path
      d="M4.32025 0.974699C4.5479 0.76331 4.56109 0.407398 4.3497 0.179749C4.23963 0.0612204 4.09039 0.000831677 3.94048 8.53091e-06C3.80246 -0.000749287 3.66387 0.048979 3.55475 0.150306L0.931429 2.58624C0.819881 2.68903 0.75 2.83636 0.75 3C0.75 3.1632 0.819496 3.31016 0.930509 3.41291L3.55475 5.8497C3.7824 6.06109 4.13831 6.04791 4.3497 5.82026C4.56109 5.59261 4.5479 5.2367 4.32025 5.02531L2.74492 3.5625H10.6875C10.9982 3.5625 11.25 3.31066 11.25 3C11.25 2.68934 10.9982 2.4375 10.6875 2.4375H2.74493L4.32025 0.974699Z"
      fill="currentColor"
    />
  </>
)

/** 12×12 — center inside 16×16 well (Figma 6269:112627). */
export function AccountHubMoveMoneyIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {moveMoneyPaths}
    </svg>
  )
}

export function AccountHubSettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.00002 5.99989C10.6569 5.99989 12 7.34304 12 8.99989C12 10.6567 10.6569 11.9999 9.00002 11.9999C7.56393 11.9999 6.36472 11.0849 6.07033 9.73708H1.39287C1.03783 9.73708 0.750015 9.35493 0.750015 8.99989C0.750015 8.64485 1.03783 8.27565 1.39287 8.27565H6.07033C6.36472 6.92785 7.56393 5.9999 9.00002 5.99989ZM9.00002 7.28561C8.05325 7.28562 7.28573 8.05313 7.28573 8.99989C7.28573 9.94666 8.05325 10.7142 9.00002 10.7142C9.94679 10.7142 10.7143 9.94667 10.7143 8.99989C10.7143 8.05312 9.94679 7.28561 9.00002 7.28561Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 0C4.4361 0 5.6353 0.928035 5.92969 2.27584H10.6071C10.9622 2.27584 11.25 2.64496 11.25 3C11.25 3.35504 10.9622 3.73727 10.6071 3.73727H5.92969C5.6353 5.08507 4.4361 6 3 6C1.34315 6 0 4.65685 0 3C0 1.34315 1.34315 0 3 0ZM3 1.28571C2.05323 1.28571 1.28571 2.05323 1.28571 3C1.28571 3.94677 2.05323 4.71429 3 4.71429C3.94677 4.71429 4.71429 3.94677 4.71429 3C4.71429 2.05323 3.94677 1.28571 3 1.28571Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function AccountHubProfileIcon({ className = '' }: { className?: string }) {
  const clipId = useId().replace(/:/g, '')
  return (
    <svg
      className={className}
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M7.875 6.75C9.94607 6.75 11.625 8.42893 11.625 10.5C11.625 11.3284 10.9534 12 10.125 12H1.875L1.72168 11.9922C0.965277 11.9154 0.375 11.2767 0.375 10.5C0.375 8.49378 1.95043 6.85551 3.93164 6.75488L4.125 6.75H7.875ZM4.125 8.25C2.88236 8.25 1.875 9.25736 1.875 10.5H10.125C10.125 9.25736 9.11764 8.25 7.875 8.25H4.125ZM6 0C7.65685 0 9 1.34315 9 3C9 4.65685 7.65685 6 6 6C4.34315 6 3 4.65685 3 3C3 1.34315 4.34315 0 6 0ZM6 1.5C5.17157 1.5 4.5 2.17157 4.5 3C4.5 3.82843 5.17157 4.5 6 4.5C6.82843 4.5 7.5 3.82843 7.5 3C7.5 2.17157 6.82843 1.5 6 1.5Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

/** 16×16 — fills control well (Figma 6269:112638). */
export function AccountHubMoreIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 9.5C8.82843 9.5 9.5 8.82843 9.5 8C9.5 7.17157 8.82843 6.5 8 6.5C7.17157 6.5 6.5 7.17157 6.5 8C6.5 8.82843 7.17157 9.5 8 9.5Z"
        fill="currentColor"
      />
      <path
        d="M13.5 9.5C14.3284 9.5 15 8.82843 15 8C15 7.17157 14.3284 6.5 13.5 6.5C12.6716 6.5 12 7.17157 12 8C12 8.82843 12.6716 9.5 13.5 9.5Z"
        fill="currentColor"
      />
      <path
        d="M2.5 9.5C3.32843 9.5 4 8.82843 4 8C4 7.17157 3.32843 6.5 2.5 6.5C1.67157 6.5 1 7.17157 1 8C1 8.82843 1.67157 9.5 2.5 9.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Outer 16×16 well, 12×12 glyph centered (2px inset each side per Figma). */
export function AccountHubIconWell12({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-4 shrink-0 items-center justify-center text-icon-default">
      {children}
    </span>
  )
}
