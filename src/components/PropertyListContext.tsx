/**
 * Context for PropertyList orientation. Used by PropertyListItem.
 */

import { createContext, useContext } from 'react'

export type PropertyListOrientation = 'vertical' | 'horizontal'

const PropertyListContext = createContext<PropertyListOrientation>('vertical')

export function usePropertyListOrientation() {
  return useContext(PropertyListContext)
}

export const PropertyListContextProvider = PropertyListContext.Provider
