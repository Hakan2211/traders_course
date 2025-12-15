import type { ComponentType, ReactNode } from 'react'

export type MDXComponents = {
  [key: string]: ComponentType<any>
}

declare const COMPONENT_MAP: MDXComponents
export default COMPONENT_MAP
