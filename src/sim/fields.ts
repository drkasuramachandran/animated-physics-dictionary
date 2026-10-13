import { W, H, TAU, col, clear, line, poly, arrow, text, dot, ring, rect, clamp, rad, deg, fix, sig, gauss, type Sim } from './kit'

/* ───────────────────────── Electromagnetic induction ───────────────────────── */
// Physical model: an ideal magnetic dipole moving along the axis of a circular coil.
// Flux linkage:  NΦ(z) = N μ₀ m a² / (2 (a² + z²)^{3/2})   (exact for a point dipole on the axis)
const MU0 = 4 * Math.PI * 1e-7
const COIL_A = 0.03 // coil radius, m
const ZMAX = 0.15 // magnet travels from −ZMAX to +ZMAX, m
const PAUSE = 0.6 // s between passes
const flux = (z: number, m: number, N: number) => (N * MU0 * m * COIL_A ** 2) / (2 * Math.pow(COIL_A ** 2 + z * z, 1.5))
const emf = (z: number, v: number, m: number, N: number) => (3 * N * MU0 * m * COIL_A ** 2 * z * v) / (2 * Math.pow(COIL_A ** 2 + z * z, 2.5))

export const induction: Sim = {
  alt: 'A bar magnet moves through a coil. Below, graphs show the magnetic flux through the coil and the induced voltage over time: one positive and one negative pulse as the magnet approaches and leaves.',
  params: [
    { key: 'v', label: 'Magnet speed', min: 0.2, max: 3, step: 0.1, def: 1, unit: ' m/s', digits: 1 },
    { key: 'N', label: 'Coil turns N', min: 10, max: 500, step: 10, def: 100 },
    { key: 'm', label: 'Magnet strength (dipole moment)', min: 0.5, max: 3, step: 0.1, def: 1, unit: ' A·m²', digits: 1 },
    { key: 'flip', label: 'Flip the magnet (swap N/S)', kind: 'toggle', min: 0, max: 1, step: 1, def: 0 },
  ],
  presets: [
    { label: 'Baseline', values: { v: 1, N: 100, m: 1, flip: 0 } },
    { label: 'Twice as fast', values: { v: 2, N: 100, m: 1, flip: 0 } },
    { label: 'Twice the turns', values: { v: 1, N: 200, m: 1, flip: 0 } },
    { label: 'Very slow (no big voltage)', values: { v: 0.2, N: 100, m: 1, flip: 0 } },
    { label: 'Reversed magnet', values: { v: 1, N: 100, m: 1, flip: 1 } },
  ],
  init: () => ({ t: 0 }),
  step(s, p, dt) { s.t += dt },
  draw(k, s, p) {
    clear(k)
    const Tp = (2 * ZMAX) / p.v, cyc = Tp + PAUSE
    const tau = s.t % cyc
    const z = tau < Tp ? -ZMAX + p.v * tau : ZMAX
    const vNow = tau < Tp ? p.v : 0
    const m = p.m * (p.flip ? -1 : 1)
    const cxs = W / 2, cys = 86, pxm = 1500
    // scene: coil (side view) and field hint
    const turns = Math.min(9, 2 + Math.round(p.N / 70))
    for (let i = 0; i < turns; i++) {
      const ox = (i - (turns - 1) / 2) * 3
      k.g.beginPath(); k.g.ellipse(cxs + ox, cys, 9, COIL_A * pxm, 0, 0, TAU); k.g.strokeStyle = `rgba(110,231,183,${0.55})`; k.g.lineWidth = 1.8; k.g.stroke()
    }
    // magnet (N red on +z side when m > 0)
    const mx = cxs + z * pxm, mw = 62, mh = 28
    const left = m > 0 ? col.blue : col.red, right = m > 0 ? col.red : col.blue
    rect(k, mx - mw / 2, cys - mh / 2, mw / 2, mh, left, undefined, 4); rect(k, mx, cys - mh / 2, mw / 2, mh, right, undefined, 4)
    text(k, m > 0 ? 'S' : 'N', mx - mw / 4, cys + 5, '#07111f', 13, 'center', 800); text(k, m > 0 ? 'N' : 'S', mx + mw / 4, cys + 5, '#07111f', 13, 'center', 800)
    // induced current indicator
    const e = emf(z, vNow, m, p.N)
    const peakGuess = Math.abs(emf(COIL_A / 2, p.v, p.m, p.N))
    const mag = clamp(Math.abs(e) / (peakGuess || 1), 0, 1)
    if (mag > 0.04) text(k, `Induced current flows (ε = ${sig(e * 1000, 3)} mV)`, cxs, cys + 66, col.green, 12, 'center', 700)
    const approaching = vNow > 0 && z < 0, leaving = vNow > 0 && z > 0
    text(k, vNow === 0 ? 'Magnet at rest: dΦ/dt = 0, so ε = 0' : approaching ? 'Approaching: coil face repels the magnet (Lenz)' : leaving ? 'Leaving: coil attracts the magnet back (Lenz)' : 'Passing through the centre: flux is at its peak, ε ≈ 0', 16, 22, col.ink, 12, 'left', 700)
    // plots
    const x0 = 56, x1 = W - 20, yTop = 174, yBot = 340, yc = (yTop + yBot) / 2
    const tt = (i: number) => (Tp * i) / 160
    const phiMax = flux(0, p.m, p.N)
    const epk = Math.max(1e-9, ...Array.from({ length: 161 }, (_, i) => Math.abs(emf(-ZMAX + p.v * tt(i), p.v, p.m, p.N))))
    line(k, x0, yc, x1, yc, col.axis); line(k, x0, yTop - 6, x0, yBot + 4, col.axis)
    const X = (t: number) => x0 + (t / cyc) * (x1 - x0)
    const phiPts: [number, number][] = [], ePts: [number, number][] = []
    for (let i = 0; i <= 160; i++) {
      const t = tt(i), zz = -ZMAX + p.v * t
      phiPts.push([X(t), yBot - (Math.abs(flux(zz, p.m, p.N)) / phiMax) * (yBot - yTop - 10)])
      ePts.push([X(t), yc - (emf(zz, p.v, m, p.N) / epk) * ((yBot - yTop) / 2 - 8)])
    }
    poly(k, phiPts, 'rgba(112,225,255,.9)', 2.2); poly(k, ePts, col.amber, 2.8)
    const cur = X(tau); line(k, cur, yTop - 6, cur, yBot, 'rgba(255,255,255,.35)', 1, [3, 4])
    text(k, 'flux linkage NΦ (cyan)', x0 + 8, yTop + 6, col.cyan, 11, 'left', 700); text(k, 'induced emf ε (amber)', x0 + 8, yTop + 20, col.amber, 11, 'left', 700)
    text(k, `±${sig(epk * 1000, 3)} mV`, x1, yTop + 6, col.amber, 11, 'right', 700)
    text(k, 'time →', x1, yBot + 14, col.mute, 11, 'right')
  },
  readouts(s, p) {
    const Tp = (2 * ZMAX) / p.v
    let pk = 0
    for (let i = 0; i <= 200; i++) pk = Math.max(pk, Math.abs(emf(-ZMAX + (2 * ZMAX * i) / 200, p.v, p.m, p.N)))
    const phi0 = flux(0, p.m, p.N)
    return [['Peak |ε|', `${sig(pk * 1000, 3)} mV`], ['Max flux linkage NΦ', `${sig(phi0 * 1e6, 3)} µWb`], ['Pass duration', `${fix(Tp, 2)} s`], ['Net ∫ε dt over the pass', '≈ 0 (flux returns to ~0)']]
  },
  caption: () => 'Double the speed and the pulses are twice as tall but half as long. The area under each pulse stays the same because it only depends on the change in flux. (Ideal point-dipole model, 3 cm coil radius.)',
}

/* ───────────────────────── Lorentz force (cyclotron motion, E × B drift) ───────────────────────── */
const QE = 1.602e-19
const PART = [
  { name: 'Proton', q: 1, m: 1.6726e-27 },
  { name: 'Electron', q: -1, m: 9.109e-31 },
  { name: 'Alpha particle', q: 2, m: 6.6447e-27 },
]
const lenFmt = (m: number) => (m >= 1 ? `${sig(m, 3)} m` : m >= 1e-2 ? `${sig(m * 100, 3)} cm` : m >= 1e-3 ? `${sig(m * 1e3, 3)} mm` : `${sig(m * 1e6, 3)} µm`)

export const lorentz: Sim = {
  alt: 'A charged particle moves in a uniform magnetic field pointing into the screen and travels on a circle. When an electric field is added, the circle stretches into a cycloid that drifts sideways.',
  params: [
    { key: 'part', label: 'Particle', kind: 'choice', choices: ['Proton', 'Electron', 'Alpha'], min: 0, max: 2, step: 1, def: 0 },
    { key: 'v', label: 'Speed', min: 0.1, max: 5, step: 0.1, def: 1, unit: '×10⁶ m/s', digits: 1 },
    { key: 'B', label: 'Magnetic field B', min: 10, max: 500, step: 10, def: 100, unit: ' mT' },
    { key: 'E', label: 'Electric field E (vertical)', min: 0, max: 600, step: 5, def: 0, unit: ' kV/m' },
  ],
  resetOn: ['part', 'v', 'B', 'E'],
  presets: [
    { label: 'Pure circle (proton)', values: { part: 0, v: 1, B: 100, E: 0 } },
    { label: 'Electron: opposite sense, tiny radius', values: { part: 1, v: 1, B: 100, E: 0 } },
    { label: 'Stronger field → tighter circle', values: { part: 0, v: 1, B: 300, E: 0 } },
    { label: 'E × B drift (cycloid)', values: { part: 0, v: 1, B: 100, E: 50 } },
    { label: 'Velocity selector (E = vB)', values: { part: 0, v: 1, B: 100, E: 100 } },
  ],
  init: (p) => ({ t: 0, x: 0, y: 0, vx: 1, vy: 0, trail: [[0, 0]] as number[][], n: 0 }),
  step(s, p, dt) {
    const pt = PART[p.part], sg = Math.sign(pt.q)
    const e = (p.E * 1e3) / (p.v * 1e6 * p.B * 1e-3) // E / (vB)
    const w = 1.3 // visual rate: radians of gyration per second
    const f = (vx: number, vy: number) => [-sg * vy, sg * vx - sg * e]
    let left = dt * w
    s.t += dt
    while (left > 1e-9) {
      const h = Math.min(0.01, left); left -= h
      const k1 = f(s.vx, s.vy), k2 = f(s.vx + h / 2 * k1[0], s.vy + h / 2 * k1[1]), k3 = f(s.vx + h / 2 * k2[0], s.vy + h / 2 * k2[1]), k4 = f(s.vx + h * k3[0], s.vy + h * k3[1])
      const ax = (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6, ay = (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6
      s.x += s.vx * h; s.y += s.vy * h
      s.vx += ax * h; s.vy += ay * h
      if (++s.n % 4 === 0) { s.trail.push([s.x, s.y]); if (s.trail.length > 1400) s.trail.shift() }
    }
    const px = 150 + s.x * 62
    if (px > W - 24 || Math.abs(s.y) * 62 > 150) { s.x = 0; s.y = 0; s.vx = 1; s.vy = 0; s.trail = [[0, 0]] }
  },
  draw(k, s, p) {
    clear(k)
    const pt = PART[p.part], sg = Math.sign(pt.q)
    const R = 62, ox = 150, oy = H / 2
    const X = (x: number) => ox + x * R, Y = (y: number) => oy - y * R
    // B-field symbols (into the page)
    for (let i = 0; i < 12; i++) for (let j = 0; j < 7; j++) text(k, '×', 28 + i * 52, 36 + j * 50, 'rgba(112,225,255,.16)', 17, 'center')
    text(k, 'B into the page', W - 14, 22, 'rgba(112,225,255,.8)', 12, 'right', 700)
    if (p.E > 0) for (let i = 0; i < 6; i++) arrow(k, 80 + i * 100, 34, 80 + i * 100, 66, 'rgba(255,189,118,.35)', 1.6), text(k, 'E', 64 + i * 100, 54, 'rgba(255,189,118,.6)', 11)
    poly(k, s.trail.map(([x, y]: number[]) => [X(x), Y(y)] as [number, number]), pt.q > 0 ? col.cyan : col.pink, 2.4)
    const bx = X(s.x), by = Y(s.y)
    dot(k, bx, by, 8, pt.q > 0 ? col.cyan : col.pink)
    text(k, pt.q > 0 ? '+' : '–', bx, by + 4, '#07111f', 12, 'center', 800)
    arrow(k, bx, by, bx + s.vx * 40, by - s.vy * 40, col.green, 2.2)
    // magnetic force direction: F = qv×B ∝ sg*(−vy, vx)·(…) pointing to the centre
    const fx = -sg * s.vy, fy = sg * s.vx
    arrow(k, bx, by, bx + fx * 34, by - fy * 34, col.amber, 2.2)
    text(k, 'v', bx + s.vx * 40 + 6, by - s.vy * 40, col.green, 12, 'left', 700); text(k, 'F', bx + fx * 34 + 6, by - fy * 34 - 4, col.amber, 12, 'left', 700)
  },
  readouts(s, p) {
    const pt = PART[p.part], v = p.v * 1e6, B = p.B * 1e-3
    const r = (pt.m * v) / (Math.abs(pt.q) * QE * B)
    const fc = (Math.abs(pt.q) * QE * B) / (TAU * pt.m)
    const KE = (0.5 * pt.m * v * v) / QE
    const e = (p.E * 1e3) / (v * B)
    const out: [string, string][] = [['Gyroradius r = mv/|q|B', lenFmt(r)], ['Cyclotron frequency f', `${sig(fc / 1e6, 3)} MHz`], ['Period T', `${sig(1e6 / fc, 3)} µs`], ['Kinetic energy', KE >= 1000 ? `${sig(KE / 1000, 3)} keV` : `${sig(KE, 3)} eV`]]
    if (p.E > 0) out.push(['Drift speed E/B', `${sig((p.E * 1e3) / B / 1e6, 3)}×10⁶ m/s`], ['E / (vB)', Math.abs(e - 1) < 0.02 ? `${fix(e, 2)} — straight line!` : fix(e, 2)])
    return out
  },
  caption: (s, p) => p.E === 0 ? 'The magnetic force is always perpendicular to the velocity, so it changes direction but never speed: uniform circular motion.' : Math.abs((p.E * 1e3) / (p.v * 1e6 * p.B * 1e-3) - 1) < 0.02 ? 'When E = vB the electric and magnetic forces cancel and the particle moves straight: a velocity selector.' : 'With a perpendicular E field the orbit drifts at E/B, the same for every charge and mass: a cycloid.',
}

/* ───────────────────────── Ideal gas: kinetic theory ───────────────────────── */
const BOX_H = 300, BOX_Y = 30, BOX_X = 18, BOX_WMAX = 390
const VTH300 = 85 // px/s: √(kT/m) at 300 K in the sim
const KB = 1.380649e-23, M_N2 = 4.65e-26
export const gas: Sim = {
  alt: 'Particles bounce around in a box. A histogram of their speeds is compared with the Maxwell–Boltzmann curve, and a pressure measurement is compared with the ideal gas law.',
  params: [
    { key: 'T', label: 'Temperature', min: 100, max: 1000, step: 10, def: 300, unit: ' K' },
    { key: 'N', label: 'Number of particles', min: 20, max: 250, step: 10, def: 100 },
    { key: 'vol', label: 'Volume (piston position)', min: 40, max: 100, step: 1, def: 100, unit: ' %' },
  ],
  resetOn: ['N'],
  presets: [
    { label: 'Room temperature', values: { T: 300, N: 100, vol: 100 } },
    { label: 'Heat it to 900 K', values: { T: 900, N: 100, vol: 100 } },
    { label: 'Squeeze to 40 % volume', values: { T: 300, N: 100, vol: 40 } },
    { label: 'Twice the gas', values: { T: 300, N: 200, vol: 100 } },
    { label: 'Cold gas (100 K)', values: { T: 100, N: 100, vol: 100 } },
  ],
  init: (p) => {
    const vth = VTH300 * Math.sqrt(p.T / 300), wbox = BOX_WMAX * (p.vol / 100)
    const parts = Array.from({ length: p.N }, () => ({ x: BOX_X + 6 + Math.random() * (wbox - 12), y: BOX_Y + 6 + Math.random() * (BOX_H - 12), vx: gauss() * vth, vy: gauss() * vth, vz: gauss() * vth }))
    const perim0 = 2 * (wbox + BOX_H), area0 = wbox * BOX_H
    // warm start: begin the pressure gauge at its steady-state value so it does not read low while it averages
    return { t: 0, parts, Tprev: p.T, imp: ((p.N * vth * vth) / area0) * perim0 * 2.5, hist: new Array(30).fill(0) }
  },
  step(s, p, dt) {
    const vth = VTH300 * Math.sqrt(p.T / 300), wallX = BOX_X + BOX_WMAX * (p.vol / 100)
    if (p.T !== s.Tprev) { const f = Math.sqrt(p.T / s.Tprev); for (const q of s.parts) { q.vx *= f; q.vy *= f; q.vz *= f } s.Tprev = p.T }
    let imp = 0
    for (const q of s.parts) {
      q.x += q.vx * dt; q.y += q.vy * dt
      if (q.x < BOX_X) { q.x = 2 * BOX_X - q.x; imp += 2 * Math.abs(q.vx); q.vx = Math.abs(q.vx) }
      if (q.x > wallX) { q.x = Math.min(2 * wallX - q.x, wallX - 1); imp += 2 * Math.abs(q.vx); q.vx = -Math.abs(q.vx) }
      if (q.y < BOX_Y) { q.y = 2 * BOX_Y - q.y; imp += 2 * Math.abs(q.vy); q.vy = Math.abs(q.vy) }
      if (q.y > BOX_Y + BOX_H) { q.y = 2 * (BOX_Y + BOX_H) - q.y; imp += 2 * Math.abs(q.vy); q.vy = -Math.abs(q.vy) }
    }
    const tau = 2.5
    s.imp = s.imp * Math.exp(-dt / tau) + imp
    s.t += dt
    // smoothed speed histogram (3-D speeds)
    const cur = new Array(30).fill(0)
    for (const q of s.parts) { const sp = Math.sqrt(q.vx * q.vx + q.vy * q.vy + q.vz * q.vz); const b = Math.floor(sp / 20); if (b < 30) cur[b]++ }
    for (let i = 0; i < 30; i++) s.hist[i] += (cur[i] / s.parts.length / 20 - s.hist[i]) * 0.06
    s.vth = vth
  },
  draw(k, s, p) {
    clear(k)
    const wallX = BOX_X + BOX_WMAX * (p.vol / 100)
    rect(k, BOX_X, BOX_Y, wallX - BOX_X, BOX_H, 'rgba(112,225,255,.03)', 'rgba(152,181,218,.5)')
    // piston
    rect(k, wallX, BOX_Y - 4, 8, BOX_H + 8, '#3a516e', undefined, 3)
    line(k, wallX + 8, BOX_Y + BOX_H / 2, BOX_X + BOX_WMAX + 16, BOX_Y + BOX_H / 2, '#3a516e', 5)
    const vmax = 3 * VTH300 * Math.sqrt(p.T / 300) + 40
    for (const q of s.parts) {
      const sp = Math.sqrt(q.vx * q.vx + q.vy * q.vy + q.vz * q.vz)
      const f = clamp(sp / vmax, 0, 1)
      dot(k, q.x, q.y, 3.4, `hsl(${200 - f * 190}, 90%, ${58 + f * 8}%)`, false)
    }
    // histogram + Maxwell-Boltzmann
    const hx = 440, hy = 300, hw = 190, hh = 220
    line(k, hx, hy, hx + hw, hy, col.axis); line(k, hx, hy, hx, hy - hh, col.axis)
    text(k, 'speed distribution', hx, 36, col.mute, 11); text(k, 'speed →', hx + hw, hy + 14, col.mute, 11, 'right')
    const vth = VTH300 * Math.sqrt(p.T / 300)
    const mb = (v: number) => Math.sqrt(2 / Math.PI) * v * v / Math.pow(vth, 3) * Math.exp(-v * v / (2 * vth * vth))
    const scaleY = hh / 0.016
    for (let i = 0; i < 30; i++) { const bh = clamp(s.hist[i] * scaleY, 0, hh); rect(k, hx + (i * hw) / 30 + 1, hy - bh, hw / 30 - 2, bh, 'rgba(112,225,255,.55)') }
    const pts: [number, number][] = []
    for (let i = 0; i <= 120; i++) { const v = (i / 120) * 600; pts.push([hx + (v / 600) * hw, hy - clamp(mb(v) * scaleY, 0, hh)]) }
    poly(k, pts, col.amber, 2.2)
    text(k, 'Maxwell–Boltzmann', hx + hw, 52, col.amber, 11, 'right', 700)
    // pressure gauge
    const area = (wallX - BOX_X) * BOX_H, perim = 2 * ((wallX - BOX_X) + BOX_H)
    const Pm = s.imp / 2.5 / perim, Pt = (p.N * vth * vth) / area
    text(k, `P measured / predicted = ${fix(Pm / Pt, 2)}`, hx, 330, col.green, 12, 'left', 700)
  },
  readouts(s, p) {
    const T = p.T
    const area = BOX_WMAX * (p.vol / 100) * BOX_H, area0 = BOX_WMAX * BOX_H
    const Prel = (p.N / 100) * (T / 300) * (area0 / area)
    return [['Predicted pressure (P ∝ NT/V)', `${fix(Prel, 2)} × reference`], ['Mean KE per particle (3/2)k_BT', `${sig(1.5 * KB * T / 1.602e-19, 3)} eV`], ['N₂ rms speed √(3k_BT/m)', `${fix(Math.sqrt(3 * KB * T / M_N2), 0)} m/s`], ['N₂ most probable speed', `${fix(Math.sqrt(2 * KB * T / M_N2), 0)} m/s`], ['N₂ mean speed', `${fix(Math.sqrt(8 * KB * T / (Math.PI * M_N2)), 0)} m/s`]]
  },
  caption: () => 'Pressure is the average momentum the particles hand to the walls each second. Heat the gas, add particles, or squeeze the box and the wall hits become harder or more frequent. (Quasi-2-D picture; speeds include a hidden third component.)',
}
