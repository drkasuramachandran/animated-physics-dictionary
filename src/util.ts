import type { CSSProperties } from 'react'

/** Inline style that sets the --accent custom property used for per-topic colour. */
export const accentVar = (color: string): CSSProperties => ({ '--accent': color } as CSSProperties)
