import type { CSSProperties, ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'

export type IconSize = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | number

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  name: string
  size?: IconSize
  fill?: string
  className?: string
  style?: CSSProperties
}

export const Icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
export const iconNames: string[]

export type BrandIconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  name: string
  size?: 'small' | 'medium' | 'large' | number
  className?: string
  style?: CSSProperties
}

export const BrandIcon: ForwardRefExoticComponent<BrandIconProps & RefAttributes<SVGSVGElement>>
export const brandIconNames: string[]

export type FlagIconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  name: string
  size?: IconSize
  className?: string
  style?: CSSProperties
}

export const FlagIcon: ForwardRefExoticComponent<FlagIconProps & RefAttributes<SVGSVGElement>>
export const flagIconNames: string[]

export type CardIconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  name: string
  size?: IconSize
  className?: string
  style?: CSSProperties
}

export const CardIcon: ForwardRefExoticComponent<CardIconProps & RefAttributes<SVGSVGElement>>
export const cardIconNames: string[]
