// Shared types and drawing helpers for every simulation.
// Each simulation is a small, declarative object (see `Sim`). The generic <SimPlayer>
// component supplies the animation loop, controls, presets, readouts, and export tools.

export const W = 640
export const H = 360
export const TAU = Math.PI * 2

export const col = {
  cyan: '#70e1ff', purple: '#b5a1ff', amber: '#ffbd76', green: '#6ee7b7',
  pink: '#ff85c2', red: '#ff7898', blue: '#70aaff', ink: '#eaf2ff', mute: '#8497b1',
  grid: 'rgba(152,181,218,.13)', axis: 'rgba(152,181,218,.45)',
}

export type Ctx = { g: CanvasRenderingContext2D; w: number; h: number }
export type P = Record<string, number>

export type Param = {
  key: string
  label: string
  min: number
  max: number
  step: number
  def: number
  unit?: string
  digits?: number
  kind?: 'slider' | 'toggle' | 'choice'
  choices?: string[]
}

export type Preset = { label: string; values: Partial<P>; note?: string }

export type Sim = {
  params: Param[]
  presets?: Preset[]
  /** Changing any of these parameters re-initialises the simulation state. */
  resetOn?: string[]
  init: (p: P) => any
  /** Advance the model by dt seconds of simulated time. `s.t` is the running time. */
  step?: (s: any, p: P, dt: number) => void
  draw: (k: Ctx, s: any, p: P) => void
  readouts?: (s: any, p: P) => [string, string][]
  caption?: (s: any, p: P) => string
  /** Text read by screen readers describing what the canvas shows. */
  alt: string
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const deg = (r: number) => (r * 180) / Math.PI
export const rad = (d: number) => (d * Math.PI) / 180

export function rng(seed = 12345) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const rand = Math.random
export function gauss() {
  const u = 1 - Math.random(), v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v)
}

export function clear(k: Ctx) {
  const { g, w, h } = k
  const grad = g.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0a1626'); grad.addColorStop(1, '#07111f')
  g.fillStyle = grad
  g.fillRect(0, 0, w, h)
}

export function line(k: Ctx, x1: number, y1: number, x2: number, y2: number, color = col.axis, lw = 1, dash: number[] = [], offset = 0) {
  const g = k.g
  g.save()
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2)
  g.strokeStyle = color; g.lineWidth = lw; g.setLineDash(dash); g.lineDashOffset = offset
  g.stroke(); g.restore()
}

export function poly(k: Ctx, pts: [number, number][], color: string, lw = 2, dash: number[] = [], fill?: string, close = false) {
  if (pts.length < 2) return
  const g = k.g
  g.save()
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1])
  if (close) g.closePath()
  if (fill) { g.fillStyle = fill; g.fill() }
  if (lw > 0) { g.strokeStyle = color; g.lineWidth = lw; g.setLineDash(dash); g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke() }
  g.restore()
}

export function arrow(k: Ctx, x1: number, y1: number, x2: number, y2: number, color: string, lw = 2) {
  const g = k.g
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len < 2) return
  const ux = dx / len, uy = dy / len
  const hs = Math.min(9, len * 0.5)
  g.save()
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = lw; g.lineCap = 'round'
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2 - ux * hs * 0.6, y2 - uy * hs * 0.6); g.stroke()
  g.beginPath()
  g.moveTo(x2, y2)
  g.lineTo(x2 - ux * hs - uy * hs * 0.5, y2 - uy * hs + ux * hs * 0.5)
  g.lineTo(x2 - ux * hs + uy * hs * 0.5, y2 - uy * hs - ux * hs * 0.5)
  g.closePath(); g.fill(); g.restore()
}

export function text(k: Ctx, s: string, x: number, y: number, color = col.mute, size = 12, align: CanvasTextAlign = 'left', weight: string | number = 500) {
  const g = k.g
  g.save()
  g.font = `${weight} ${size}px "DM Sans", system-ui, sans-serif`
  g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'
  g.fillText(s, x, y)
  g.restore()
}

export function dot(k: Ctx, x: number, y: number, r: number, color: string, glow = true) {
  const g = k.g
  g.save()
  if (glow) { g.shadowColor = color; g.shadowBlur = r * 2.2 }
  g.beginPath(); g.arc(x, y, r, 0, TAU)
  g.fillStyle = color; g.fill(); g.restore()
}

export function ring(k: Ctx, x: number, y: number, r: number, color: string, lw = 1.5, dash: number[] = []) {
  const g = k.g
  if (r <= 0) return
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU)
  g.strokeStyle = color; g.lineWidth = lw; g.setLineDash(dash); g.stroke(); g.restore()
}

export function rect(k: Ctx, x: number, y: number, w: number, h: number, fill: string, stroke?: string, r = 0) {
  const g = k.g
  g.save(); g.beginPath()
  if (r > 0 && (g as any).roundRect) (g as any).roundRect(x, y, w, h, r); else g.rect(x, y, w, h)
  g.fillStyle = fill; g.fill()
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke() }
  g.restore()
}

export function grid(k: Ctx, x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) {
  for (let i = 0; i <= nx; i++) line(k, x0 + ((x1 - x0) * i) / nx, y0, x0 + ((x1 - x0) * i) / nx, y1, col.grid)
  for (let j = 0; j <= ny; j++) line(k, x0, y0 + ((y1 - y0) * j) / ny, x1, y0 + ((y1 - y0) * j) / ny, col.grid)
}

/** Pick a "nice" tick step (1, 2, 5 × 10ⁿ) so that range/step ≤ maxTicks. */
export function niceStep(range: number, maxTicks = 8) {
  const raw = range / maxTicks
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  for (const m of [1, 2, 5, 10]) if (m * mag >= raw) return m * mag
  return 10 * mag
}

export function sig(v: number, d = 3) {
  if (!isFinite(v)) return '—'
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a >= 1e5 || a < 1e-2) return v.toExponential(d - 1).replace('e+', '×10^').replace('e-', '×10^-')
  return String(Number(v.toPrecision(d)))
}
export const fix = (v: number, d = 1) => (isFinite(v) ? v.toFixed(d) : '—')
