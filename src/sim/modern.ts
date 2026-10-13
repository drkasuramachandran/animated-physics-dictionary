import { W, H, TAU, col, clear, line, poly, arrow, text, dot, ring, rect, clamp, fix, sig, type Sim } from './kit'

/* ───────────────────────── Quantum particle in a box ───────────────────────── */
// Energy levels E_n = n² h²/(8 m L²) for an electron; time evolution uses the exact phases e^{-iE_n t/ħ}.
const E1_EV_NM2 = 0.37602 // h²/(8 m_e) in eV·nm²
const HC = 1239.84 // eV·nm
const NX = 220
const OMEGA1 = 0.9 // visual angular frequency of the ground state, rad/s

function psiAt(x: number, t: number, n1: number, n2: number, w: number) {
  const c1 = Math.sqrt(1 - w), c2 = Math.sqrt(w)
  const f = (n: number) => Math.SQRT2 * Math.sin(n * Math.PI * x)
  const a1 = n1 * n1 * OMEGA1 * t, a2 = n2 * n2 * OMEGA1 * t
  return { re: c1 * f(n1) * Math.cos(a1) + c2 * f(n2) * Math.cos(a2), im: -(c1 * f(n1) * Math.sin(a1) + c2 * f(n2) * Math.sin(a2)) }
}

export const quantumBox: Sim = {
  alt: 'A quantum particle in a one-dimensional box. The real and imaginary parts of the wavefunction and the probability density are drawn, with an energy-level ladder and dots showing random position measurements.',
  params: [
    { key: 'n1', label: 'Lower state n₁', min: 1, max: 6, step: 1, def: 1 },
    { key: 'n2', label: 'Upper state n₂', min: 1, max: 6, step: 1, def: 2 },
    { key: 'w', label: 'Weight of n₂ (0 = pure n₁)', min: 0, max: 100, step: 5, def: 0, unit: ' %' },
    { key: 'L', label: 'Box width L', min: 0.3, max: 3, step: 0.1, def: 1, unit: ' nm', digits: 1 },
  ],
  resetOn: ['n1', 'n2', 'w'],
  presets: [
    { label: 'Ground state', values: { n1: 1, n2: 2, w: 0 } },
    { label: 'Third level', values: { n1: 3, n2: 2, w: 0 } },
    { label: 'Superposition 1 + 2', values: { n1: 1, n2: 2, w: 50 } },
    { label: 'Superposition 1 + 3', values: { n1: 1, n2: 3, w: 50 } },
    { label: 'Squeeze the box (0.5 nm)', values: { n1: 1, n2: 2, w: 50, L: 0.5 } },
  ],
  init: () => ({ t: 0, hits: [] as { x: number; age: number }[], acc: 0 }),
  step(s, p, dt) {
    s.t += dt; s.acc += dt
    const w = p.n1 === p.n2 ? 0 : p.w / 100
    for (const h of s.hits) h.age += dt
    s.hits = s.hits.filter((h: any) => h.age < 8)
    while (s.acc > 0.18) {
      s.acc -= 0.18
      for (let tries = 0; tries < 200; tries++) {
        const x = Math.random(), ps = psiAt(x, s.t, p.n1, p.n2, w)
        if (Math.random() * 4.2 < ps.re * ps.re + ps.im * ps.im) { s.hits.push({ x, age: 0 }); break }
      }
    }
  },
  draw(k, s, p) {
    clear(k)
    const w = p.n1 === p.n2 ? 0 : p.w / 100
    const x0 = 40, x1 = 440
    const X = (x: number) => x0 + x * (x1 - x0)
    // walls
    rect(k, x0 - 6, 24, 6, 316, '#3a516e'); rect(k, x1, 24, 6, 316, '#3a516e')
    const yc1 = 104, ya1 = 34
    const yb = 328, ya2 = 38
    line(k, x0, yc1, x1, yc1, col.axis); line(k, x0, yb, x1, yb, col.axis)
    text(k, 'Re ψ (cyan)   Im ψ (purple)', x0, 22, col.mute, 11)
    text(k, 'probability density |ψ|² (pink) and detections', x0, 188, col.mute, 11)
    const re: [number, number][] = [], im: [number, number][] = [], pr: [number, number][] = []
    for (let i = 0; i <= NX; i++) {
      const x = i / NX, ps = psiAt(x, s.t, p.n1, p.n2, w)
      re.push([X(x), yc1 - ps.re * ya1]); im.push([X(x), yc1 - ps.im * ya1]); pr.push([X(x), yb - (ps.re * ps.re + ps.im * ps.im) * ya2])
    }
    poly(k, [[x0, yb], ...pr, [x1, yb]] as [number, number][], col.pink, 0, [], 'rgba(255,133,194,.20)', true)
    poly(k, pr, col.pink, 2.6); poly(k, re, col.cyan, 2.2); poly(k, im, col.purple, 1.8, [4, 3])
    // detections
    for (const h of s.hits) {
      const a = clamp(1 - h.age / 8, 0, 1)
      const j = (Math.sin(h.x * 997) * 0.5 + 0.5) * 26
      dot(k, X(h.x), 210 + j, 2.8, `rgba(255,245,200,${a})`, false)
    }
    // energy ladder
    const lx = 478, lw = 110, base = 330, top = 36
    const maxE = 36
    text(k, 'energy levels', lx, 22, col.mute, 11)
    for (let n = 1; n <= 6; n++) {
      const y = base - ((n * n) / maxE) * (base - top)
      const pop = n === p.n1 ? 1 - w : n === p.n2 ? w : 0
      line(k, lx, y, lx + lw, y, pop > 0 ? col.amber : 'rgba(152,181,218,.35)', pop > 0 ? 3 : 1.4)
      text(k, `n=${n}`, lx - 4, y + 4, pop > 0 ? col.amber : col.mute, 11, 'right')
      if (pop > 0) text(k, `${Math.round(pop * 100)} %`, lx + lw + 4, y + 4, col.amber, 11, 'left', 700)
    }
    if (w > 0 && p.n1 !== p.n2) {
      const ya = base - ((p.n1 * p.n1) / maxE) * (base - top), yb2 = base - ((p.n2 * p.n2) / maxE) * (base - top)
      arrow(k, lx + lw / 2, Math.max(ya, yb2), lx + lw / 2, Math.min(ya, yb2) + 6, col.green, 1.8)
    }
  },
  readouts(s, p) {
    const w = p.n1 === p.n2 ? 0 : p.w / 100
    const e = (n: number) => (E1_EV_NM2 * n * n) / (p.L * p.L)
    let left = 0
    for (let i = 0; i < 400; i++) { const x = (i + 0.5) / 800; const ps = psiAt(x, s.t, p.n1, p.n2, w); left += (ps.re * ps.re + ps.im * ps.im) / 800 }
    const out: [string, string][] = [[`E${p.n1} (electron)`, `${sig(e(p.n1), 3)} eV`]]
    if (w > 0) {
      out.push([`E${p.n2}`, `${sig(e(p.n2), 3)} eV`], ['Beat period of ⟨x⟩', `${fix((TAU / (Math.abs(p.n2 * p.n2 - p.n1 * p.n1) * OMEGA1)), 2)} s (visual)`])
      const dE = Math.abs(e(p.n2) - e(p.n1)); out.push(['Photon for the jump', `${sig(HC / dE, 3)} nm`])
    } else out.push(['Probability, left half', `${fix(left * 100, 1)} %`])
    out.push(['Ground-state energy E₁', `${sig(e(1), 3)} eV`])
    return out
  },
  caption: (s, p) => p.w > 0 && p.n1 !== p.n2 ? 'A superposition has no single energy. Its density sloshes back and forth at the frequency (E₂ − E₁)/h, which is exactly the frequency of the light it would emit.' : 'A stationary state: the density does not change in time even though ψ itself rotates in the complex plane. Detections are random but pile up where |ψ|² is large.',
}

/* ───────────────────────── Double slit with single particles ───────────────────────── */
const FRINGE = 0.25
const BW = 0.4 // slit width in the same units as d
function intensity(y: number, d: number, lam: number, det: boolean) {
  const sinc = (u: number) => (Math.abs(u) < 1e-6 ? 1 : Math.sin(u) / u)
  const env = Math.pow(sinc((Math.PI * BW * y) / (FRINGE * lam)), 2)
  return det ? env : env * Math.pow(Math.cos((Math.PI * d * y) / (FRINGE * lam)), 2)
}
const BINS = 48

export const doubleSlit: Sim = {
  alt: 'Particles are sent one at a time through two slits. Each lands as a single dot on the screen, but over time dots build up into bright and dark interference fringes, unless a which-path detector is switched on.',
  params: [
    { key: 'd', label: 'Slit separation d', min: 1, max: 4, step: 0.1, def: 2, digits: 1 },
    { key: 'lam', label: 'De Broglie wavelength λ', min: 0.5, max: 2, step: 0.1, def: 1, digits: 1 },
    { key: 'rate', label: 'Particles per second', min: 5, max: 150, step: 5, def: 40 },
    { key: 'det', label: 'Which-path detector', kind: 'toggle', min: 0, max: 1, step: 1, def: 0 },
  ],
  resetOn: ['d', 'lam', 'det'],
  presets: [
    { label: 'Default fringes', values: { d: 2, lam: 1, det: 0, rate: 40 } },
    { label: 'Wider slit spacing', values: { d: 3.6, lam: 1, det: 0, rate: 40 } },
    { label: 'Longer wavelength', values: { d: 2, lam: 1.8, det: 0, rate: 40 } },
    { label: 'Watch the build-up (slow)', values: { d: 2, lam: 1, det: 0, rate: 8 } },
    { label: 'Which-path detector ON', values: { d: 2, lam: 1, det: 1, rate: 40 } },
  ],
  init: () => ({ t: 0, acc: 0, dots: [] as { y: number; xj: number }[], flashes: [] as { y: number; age: number }[], bins: new Array(BINS).fill(0), n: 0 }),
  step(s, p, dt) {
    s.t += dt; s.acc += p.rate * dt
    for (const f of s.flashes) f.age += dt
    s.flashes = s.flashes.filter((f: any) => f.age < 0.28)
    while (s.acc >= 1 && s.n < 6000) {
      s.acc -= 1
      for (let tries = 0; tries < 400; tries++) {
        const y = (Math.random() * 2 - 1)
        if (Math.random() < intensity(y, p.d, p.lam, !!p.det)) {
          s.dots.push({ y, xj: Math.random() }); s.flashes.push({ y, age: 0 }); s.bins[Math.min(BINS - 1, Math.floor(((y + 1) / 2) * BINS))]++; s.n++
          break
        }
      }
    }
  },
  draw(k, s, p) {
    clear(k)
    const cy = H / 2, sx = 22, bx = 118, scx = 214, scw = 36
    const Y = (y: number) => cy - y * 150
    const sep = p.d * 17
    // source, barrier
    dot(k, sx, cy, 7, col.amber); text(k, 'source', sx - 4, cy + 24, col.mute, 11)
    const gap = 9
    rect(k, bx - 3, 20, 6, cy - sep - gap - 20 + 0, '#3a516e'); rect(k, bx - 3, cy - sep + gap, 6, 2 * sep - 2 * gap, '#3a516e'); rect(k, bx - 3, cy + sep + gap, 6, H - 20 - (cy + sep + gap), '#3a516e')
    // faint outgoing waves (decorative: no trajectory is drawn)
    for (let i = 0; i < 5; i++) {
      const r = ((s.t * 40 + i * 24) % 120)
      for (const sy of [cy - sep, cy + sep]) { k.g.save(); k.g.beginPath(); k.g.rect(bx, 20, scx - bx, H - 40); k.g.clip(); ring(k, bx, sy, r, `rgba(112,225,255,${0.2 * (1 - r / 120)})`, 1.2); k.g.restore() }
    }
    // screen with accumulated dots
    rect(k, scx, 20, scw, H - 40, 'rgba(255,255,255,.04)', 'rgba(152,181,218,.35)')
    for (const d of s.dots) dot(k, scx + 4 + d.xj * (scw - 8), Y(d.y), 1.4, 'rgba(255,245,200,.9)', false)
    for (const f of s.flashes) ring(k, scx + scw / 2, Y(f.y), 3 + f.age * 22, `rgba(255,245,200,${Math.max(0, 0.7 - f.age * 2.5)})`, 1.2)
    text(k, 'screen', scx + scw / 2, 14, col.mute, 11, 'center')
    // histogram + theory
    const hx = scx + scw + 14, hw = 330
    const maxC = Math.max(8, ...s.bins)
    for (let i = 0; i < BINS; i++) {
      const y0 = Y(-1 + (2 * i) / BINS), y1 = Y(-1 + (2 * (i + 1)) / BINS)
      rect(k, hx, y1 + 0.5, (s.bins[i] / maxC) * hw * 0.92, y0 - y1 - 1, 'rgba(255,133,194,.55)')
    }
    // theory curve scaled to the number of particles detected
    let tot = 0; const vals: number[] = []
    for (let i = 0; i < BINS; i++) { const v = intensity(-1 + (2 * (i + 0.5)) / BINS, p.d, p.lam, !!p.det); vals.push(v); tot += v }
    const pts: [number, number][] = []
    for (let i = 0; i < BINS; i++) { pts.push([hx + ((vals[i] / tot) * s.n / maxC) * hw * 0.92, Y(-1 + (2 * (i + 0.5)) / BINS)]) }
    poly(k, pts, col.amber, 2)
    text(k, 'counts (bars) vs quantum prediction (line)', hx, H - 6, col.mute, 11)
    text(k, `${s.n} particles detected`, W - 14, 30, col.ink, 13, 'right', 700)
    if (p.det) text(k, 'detector knows the slit → no fringes', W - 14, 50, col.red, 12, 'right', 700)
  },
  readouts(s, p) {
    const fr = (FRINGE * p.lam) / p.d
    return [['Particles detected', `${s.n}`], ['Fringe spacing (screen units)', fix(fr, 3)], ['Fringes across the screen', p.det ? 'none' : `≈ ${fix(2 / fr, 0)}`], ['Pattern', p.det ? 'sum of two single-slit patterns' : 'interference (cos² × diffraction envelope)']]
  },
  caption: (s, p) => p.det ? 'If the path is recorded, the two possibilities no longer interfere. The probabilities simply add and the fringes vanish.' : s.n < 40 ? 'Each particle arrives at a single point, apparently at random. Keep watching.' : 'Single dots, one at a time, gradually build an interference pattern. We cannot say which slit any one particle “went through”.',
}

/* ───────────────────────── Radioactive decay ───────────────────────── */
const NSET = [100, 400, 900]
export const decay: Sim = {
  alt: 'A grid of nuclei, each of which can randomly decay. A graph compares the number remaining over time with the smooth exponential law and shows the half-life.',
  params: [
    { key: 'half', label: 'Half-life T½', min: 1, max: 10, step: 0.5, def: 3, unit: ' s (sim time)', digits: 1 },
    { key: 'n', label: 'Number of nuclei', kind: 'choice', choices: ['100', '400', '900'], min: 0, max: 2, step: 1, def: 1 },
    { key: 'log', label: 'Logarithmic vertical axis', kind: 'toggle', min: 0, max: 1, step: 1, def: 0 },
  ],
  resetOn: ['n'],
  presets: [
    { label: 'Small sample (100): noisy', values: { n: 0, half: 3, log: 0 } },
    { label: 'Large sample (900): smooth', values: { n: 2, half: 3, log: 0 } },
    { label: 'Log axis → straight line', values: { n: 2, half: 3, log: 1 } },
    { label: 'Short-lived isotope', values: { n: 1, half: 1, log: 0 } },
  ],
  init: (p) => {
    const N = NSET[p.n]
    return { t: 0, N0: N, alive: new Uint8Array(N).fill(1), flash: new Float32Array(N), count: N, hist: [[0, N]] as number[][], acc: 0, tHalf: null as null | number, hold: 0 }
  },
  step(s, p, dt) {
    if (s.t > 6 * p.half + 1.2) { Object.assign(s, { t: 0, alive: new Uint8Array(s.N0).fill(1), flash: new Float32Array(s.N0), count: s.N0, hist: [[0, s.N0]], acc: 0, tHalf: null }); return }
    s.t += dt; s.acc += dt
    const pr = 1 - Math.exp((-Math.LN2 / p.half) * dt)
    for (let i = 0; i < s.N0; i++) { if (s.alive[i] && Math.random() < pr) { s.alive[i] = 0; s.flash[i] = 1; s.count-- } else if (s.flash[i] > 0) s.flash[i] = Math.max(0, s.flash[i] - dt * 3) }
    if (s.tHalf === null && s.count <= s.N0 / 2) s.tHalf = s.t
    if (s.acc > 0.08) { s.acc = 0; s.hist.push([s.t, s.count]) }
  },
  draw(k, s, p) {
    clear(k)
    const side = Math.sqrt(s.N0), gx = 20, gy = 36, gs = 268, cell = gs / side
    text(k, 'nuclei: bright = undecayed, flash = just decayed', gx, 26, col.mute, 11)
    for (let i = 0; i < s.N0; i++) {
      const cx = gx + (i % side) * cell + cell / 2, cy = gy + Math.floor(i / side) * cell + cell / 2
      const r = Math.max(1.6, cell * 0.34)
      if (s.alive[i]) dot(k, cx, cy, r, col.green, false)
      else if (s.flash[i] > 0) dot(k, cx, cy, r * (1 + s.flash[i]), `rgba(255,189,118,${s.flash[i]})`, true)
      else dot(k, cx, cy, r * 0.7, 'rgba(152,181,218,.22)', false)
    }
    // plot
    const x0 = 346, x1 = 622, y0 = 300, y1 = 52
    const Tmax = 6 * p.half
    const X = (t: number) => x0 + (t / Tmax) * (x1 - x0)
    const ymin = Math.log10(1 / 100)
    const Yf = (fr: number) => p.log ? y0 - ((Math.log10(Math.max(fr, 1e-4)) - ymin) / (0 - ymin)) * (y0 - y1) : y0 - fr * (y0 - y1)
    line(k, x0, y0, x1, y0, col.axis); line(k, x0, y0, x0, y1 - 6, col.axis)
    const fracs = p.log ? [1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.01] : [1, 0.5, 0.25, 0.125]
    for (const f of fracs) { line(k, x0, Yf(f), x1, Yf(f), col.grid); text(k, f >= 0.1 ? `${f * 100}%` : `${fix(f * 100, 1)}%`, x0 - 6, Yf(f) + 4, col.mute, 10, 'right') }
    for (let i = 1; i <= 6; i++) { line(k, X(i * p.half), y0, X(i * p.half), y0 + 5, col.axis); text(k, `${i}T½`, X(i * p.half), y0 + 18, col.mute, 10, 'center') }
    const th: [number, number][] = []
    for (let i = 0; i <= 120; i++) { const t = (i / 120) * Tmax; th.push([X(t), Yf(Math.pow(2, -t / p.half))]) }
    poly(k, th, col.amber, 1.8, [6, 5])
    const pts = s.hist.filter((h: number[]) => h[1] > 0 || !p.log).map(([t, c]: number[]) => [X(t), Yf(c / s.N0)] as [number, number])
    poly(k, pts, col.green, 2.6)
    text(k, 'solid: this sample   dashed: N₀·2^(−t/T½)', x1, 40, col.mute, 11, 'right')
    if (s.tHalf !== null) { line(k, X(s.tHalf), y0, X(s.tHalf), Yf(0.5), col.green, 1, [3, 4]); text(k, `half gone at ${fix(s.tHalf, 2)} s`, X(s.tHalf) + 6, Yf(0.5) - 8, col.green, 11, 'left', 700) }
  },
  readouts(s, p) {
    const lam = Math.LN2 / p.half
    return [['Nuclei left', `${s.count} of ${s.N0}`], ['Expected now', fix(s.N0 * Math.pow(2, -s.t / p.half), 1)], ['Activity A = λN', `${fix(lam * s.count, 1)} decays/s`], ['Decay constant λ', `${fix(lam, 3)} s⁻¹`], ['Mean lifetime τ = T½/ln 2', `${fix(p.half / Math.LN2, 2)} s`], ['Typical scatter ≈ √N', `± ${fix(Math.sqrt(Math.max(s.count, 0)), 1)}`]]
  },
  caption: (s, p) => 'Each nucleus decays at random with no memory, yet the crowd follows a precise law. Smaller samples scatter more around the curve (relative noise ~ 1/√N).',
}
