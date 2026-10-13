import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, Download, Maximize2, Pause, Play, RotateCcw } from 'lucide-react'
import { sims } from './sim'
import { W, H, type P, type Param } from './sim/kit'
import { accentVar } from './util'

type Props = { topicId: string; accent: string; preset: string | null; onPresetUsed: () => void }

export default function SimPlayer({ topicId, accent, preset, onPresetUsed }: Props) {
  const sim = sims[topicId]
  const defaults = useMemo<P>(() => Object.fromEntries(sim.params.map((p) => [p.key, p.def])), [sim])
  const [vals, setVals] = useState<P>(defaults)
  const [playing, setPlaying] = useState(() => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  const [speed, setSpeed] = useState(1)
  const [readouts, setReadouts] = useState<[string, string][]>([])
  const [caption, setCaption] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const valsRef = useRef<P>(defaults)
  const stateRef = useRef<any>(null)
  if (stateRef.current === null) stateRef.current = sim.init(defaults) // lazy: init once, not on every render
  const playingRef = useRef(playing), speedRef = useRef(speed)
  const dirty = useRef(true), uiDirty = useRef(true), visible = useRef(true)
  playingRef.current = playing; speedRef.current = speed

  const reinit = (p: P) => { stateRef.current = sim.init(p); dirty.current = true; uiDirty.current = true }
  const setParam = (key: string, value: number) => {
    const next = { ...valsRef.current, [key]: value }
    valsRef.current = next; setVals(next)
    if (sim.resetOn?.includes(key)) reinit(next)
    dirty.current = true; uiDirty.current = true
  }
  const applyPreset = (values: Partial<P>) => {
    const next = { ...valsRef.current, ...values } as P
    valsRef.current = next; setVals(next); reinit(next); setPlaying(true)
  }
  const reset = () => { valsRef.current = defaults; setVals(defaults); reinit(defaults); setPlaying(true) }

  // preset requests coming from the "guided experiments" cards
  useEffect(() => {
    if (!preset) return
    const pr = sim.presets?.find((x) => x.label === preset)
    if (pr) applyPreset(pr.values)
    onPresetUsed()
  }, [preset]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const c = canvasRef.current!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = W * dpr; c.height = H * dpr
    const g = c.getContext('2d')!
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    const k = { g, w: W, h: H }
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; if (e.isIntersecting) dirty.current = true }, { threshold: 0.05 })
    io.observe(c)
    let last = performance.now(), lastUI = 0, raf = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      if (visible.current) {
        const s = stateRef.current, p = valsRef.current
        if (playingRef.current) { sim.step?.(s, p, dt * speedRef.current); dirty.current = true }
        if (dirty.current) { sim.draw(k, s, p); dirty.current = false }
        if ((playingRef.current || uiDirty.current) && now - lastUI > 160) {
          lastUI = now; uiDirty.current = false
          setReadouts(sim.readouts?.(s, p) ?? []); setCaption(sim.caption?.(s, p) ?? '')
        }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [sim])

  const save = () => {
    const a = document.createElement('a'); a.download = `physics-in-motion-${topicId}.png`
    a.href = canvasRef.current!.toDataURL('image/png'); a.click()
  }
  const full = () => { const el = stageRef.current as any; (el?.requestFullscreen ?? el?.webkitRequestFullscreen)?.call(el) }
  const matches = (v: Partial<P>) => Object.entries(v).every(([k, x]) => Math.abs((vals[k] ?? NaN) - (x as number)) < 1e-9)

  const control = (p: Param) => {
    const v = vals[p.key]
    if (p.kind === 'toggle') return (
      <div className="control control-toggle" key={p.key}>
        <span>{p.label}</span>
        <button role="switch" aria-checked={!!v} className={`switch ${v ? 'on' : ''}`} onClick={() => setParam(p.key, v ? 0 : 1)}><span /></button>
      </div>
    )
    if (p.kind === 'choice') return (
      <div className="control" key={p.key}>
        <span className="control-top"><span>{p.label}</span></span>
        <div className="seg" role="radiogroup" aria-label={p.label}>
          {p.choices!.map((c, i) => <button key={c} role="radio" aria-checked={v === i} className={v === i ? 'on' : ''} onClick={() => setParam(p.key, i)}>{c}</button>)}
        </div>
      </div>
    )
    const shown = p.digits !== undefined ? v.toFixed(p.digits) : String(v)
    return (
      <label className="control" key={p.key}>
        <span className="control-top"><span>{p.label}</span><strong>{shown}{p.unit ?? ''}</strong></span>
        <input type="range" min={p.min} max={p.max} step={p.step} value={v} onChange={(e) => setParam(p.key, Number(e.target.value))} aria-label={p.label} />
      </label>
    )
  }

  return (
    <div className="sim-card" style={accentVar(accent)}>
      <div className="sim-head">
        <div><span className="eyebrow"><Activity size={13} /> LIVE LAB</span><h3>Interactive model</h3></div>
        <div className="sim-actions">
          <div className="speed" role="group" aria-label="Animation speed">{[0.25, 0.5, 1, 2].map((s) => <button key={s} className={speed === s ? 'on' : ''} onClick={() => setSpeed(s)}>{s}×</button>)}</div>
          <button className="icon-btn" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
          <button className="icon-btn" onClick={reset} aria-label="Reset to defaults" title="Reset to defaults"><RotateCcw size={17} /></button>
          <button className="icon-btn" onClick={save} aria-label="Save image" title="Save as PNG (for slides)"><Download size={17} /></button>
          <button className="icon-btn" onClick={full} aria-label="Full screen" title="Full screen (for projecting)"><Maximize2 size={17} /></button>
        </div>
      </div>
      <div className="sim-stage" ref={stageRef}>
        <canvas ref={canvasRef} role="img" aria-label={sim.alt} />
      </div>
      <p className="sim-caption" aria-live="polite">{caption}</p>
      {sim.presets && <div className="presets"><span>Try:</span>{sim.presets.map((pr) => <button key={pr.label} className={`chip ${matches(pr.values) ? 'on' : ''}`} onClick={() => applyPreset(pr.values)}>{pr.label}</button>)}</div>}
      <div className="sim-grid">
        <div className="sim-controls">{sim.params.map(control)}</div>
        {readouts.length > 0 && <dl className="readouts" aria-label="Live measurements">{readouts.map(([a, b]) => <div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl>}
      </div>
    </div>
  )
}
