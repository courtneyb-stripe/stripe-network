/** 16×12 region flags — assets in `public/flags/` (EU, US, GB). */
export type FlagCode = 'EU' | 'US' | 'GB'

const FLAG_SRC: Record<FlagCode, string> = {
  EU: '/flags/EU.svg',
  US: '/flags/US.svg',
  GB: '/flags/GB.svg',
}

export default function FlagImg({
  code,
  className = 'h-3 w-4 shrink-0 object-cover',
}: {
  code: FlagCode
  className?: string
}) {
  return (
    <img
      src={FLAG_SRC[code]}
      alt=""
      width={16}
      height={12}
      className={className}
      aria-hidden
    />
  )
}
