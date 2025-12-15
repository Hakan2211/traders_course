// @ts-nocheck
import React from 'react'
import * as ReactKatex from 'react-katex'
import 'katex/dist/katex.min.css'

// Handle CommonJS/ESM interop
const katexModule = (ReactKatex as any).default || ReactKatex
const BlockMath = katexModule.BlockMath
const InlineMath = katexModule.InlineMath

interface MathProps {
  children: React.ReactNode
  inline?: boolean
}

export function Math({ children, inline = false }: MathProps) {
  // Convert children to string, handling React nodes
  const mathString =
    typeof children === 'string'
      ? children
      : String(children).replace(/\n/g, ' ').trim()

  if (inline) {
    return <InlineMath math={mathString} />
  }
  return (
    <div className="my-4 overflow-x-auto">
      <BlockMath math={mathString} />
    </div>
  )
}
