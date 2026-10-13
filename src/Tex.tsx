import { useMemo } from 'react'
import katex from 'katex'

/** Typeset a TeX string with KaTeX. Falls back to the raw text if parsing fails. */
export function Tex({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = useMemo(() => {
    try { return katex.renderToString(tex, { displayMode: block, throwOnError: false, strict: 'ignore' }) } catch { return tex }
  }, [tex, block])
  return <span className={block ? 'tex-block' : 'tex-inline'} dangerouslySetInnerHTML={{ __html: html }} />
}
