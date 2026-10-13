import { W, H, TAU, col, clear, line, poly, arrow, text, dot, ring, rect, niceStep, clamp, rad, deg, sig, fix, type Sim } from './kit'

/* ───────────────────────── Projectile motion ───────────────────────── */
const G_WORLD = [9.81, 1.62, 3.71]
const DRAG_K = 0.02 // 1/m : ½ρC_dA/m for a light sports-ball-like object (illustrative)

function launch(p: any) {
  const a = rad(p.angle)
  return { x: 0, y: p.height, vx: p.speed * Math.cos(a), vy: p.speed * Math.sin(a), t: 0, trail: [[0, p.height]] as number[][], landed: null as null | { x: number; t: number }, hold: 0, n: 0 }
}
function ideal(p: any) {
  const g = G_WORLD[p.grav], a = rad(p.angle)
  const vy = p.speed * Math.sin(a), vx = p.speed * Math.cos(a)
  const tf = (vy + Math.sqrt(vy * vy + 2 * g * p.height)) / g
  return { g, tf, range: vx * tf, peak: p.height + (vy * vy) / (2 * g), vx, vy }
}

export const projectile: Sim = {
  alt: 'A ball is launched at an angle and follows a curved trajectory with velocity vectors shown. A dashed parabola shows the ideal path when air resistance is on.',
  params: [
    { key: 'angle', label: 'Launch angle', min: 5, max: 85, step: 1, def: 45, unit: '°' },
    { key: 'speed', label: 'Launch speed', min: 5, max: 40, step: 1, def: 22, unit: ' m/s' },
    { key: 'height', label: 'Launch height', min: 0, max: 30, step: 1, def: 0, unit: ' m' },
    { key: 'grav', label: 'World', kind: 'choice', choices: ['Earth', 'Moon', 'Mars'], min: 0, max: 2, step: 1, def: 0 },
    { key: 'drag', label: 'Air resistance', kind: 'toggle', min: 0, max: 1, step: 1, def: 0 },
  ],
  resetOn: ['angle', 'speed', 'height', 'grav', 'drag'],
  presets: [
    { label: 'Ideal 45°', values: { angle: 45, speed: 22, height: 0, grav: 0, drag: 0 } },
    { label: '30° throw', values: { angle: 30, speed: 22, height: 0, grav: 0, drag: 0 } },
    { label: '60° throw', values: { angle: 60, speed: 22, height: 0, grav: 0, drag: 0 } },
    { label: 'Same throw on the Moon', values: { angle: 45, speed: 22, height: 0, grav: 1, drag: 0 } },
    { label: 'Add air resistance', values: { angle: 45, speed: 30, height: 0, grav: 0, drag: 1 } },
    { label: 'Off a 20 m cliff', values: { angle: 20, speed: 18, height: 20, grav: 0, drag: 0 } },
  ],
  init: (p) => launch(p),
  step(s, p, dt) {
    const g = G_WORLD[p.grav]
    if (s.landed) {
      s.hold += dt
      if (s.hold > 1.6) Object.assign(s, launch(p), { t: 0 })
      return
    }
    s.t += dt
    const h = 1 / 240
    let left = dt
    while (left > 1e-9 && !s.landed) {
      const d = Math.min(h, left); left -= d
      const sp = Math.hypot(s.vx, s.vy)
      const k = p.drag ? DRAG_K : 0
      const ax = -k * sp * s.vx, ay = -g - k * sp * s.vy
      const nx = s.x + s.vx * d + 0.5 * ax * d * d
      const ny = s.y + s.vy * d + 0.5 * ay * d * d
      s.vx += ax * d; s.vy += ay * d
      if (ny <= 0) {
        const f = s.y / (s.y - ny || 1)
        s.x = s.x + (nx - s.x) * clamp(f, 0, 1); s.y = 0
        s.landed = { x: s.x, t: s.t }; s.trail.push([s.x, 0]); break
      }
      s.x = nx; s.y = ny
      if (++s.n % 3 === 0) s.trail.push([s.x, s.y])
    }
  },
  draw(k, s, p) {
    clear(k)
    const id = ideal(p)
    const X = Math.max(id.range * 1.12, 10), Y = Math.max(id.peak * 1.25, 4)
    const ox = 58, oy = H - 44
    const sc = Math.min((W - ox - 22) / X, (oy - 26) / Y)
    const px = (x: number) => ox + x * sc, py = (y: number) => oy - y * sc
    // grid & ticks
    const sx = niceStep(X, 8)
    for (let x = 0; x <= X; x += sx) { line(k, px(x), oy, px(x), 22, 'rgba(152,181,218,.08)'); text(k, `${x}`, px(x), oy + 16, col.mute, 11, 'center') }
    const sy = niceStep(Y, 5)
    for (let y = 0; y <= Y; y += sy) { line(k, ox, py(y), W - 18, py(y), 'rgba(152,181,218,.08)'); text(k, `${y}`, ox - 8, py(y) + 4, col.mute, 11, 'right') }
    line(k, ox, oy, W - 14, oy, col.axis, 1.5); line(k, ox, oy, ox, 18, col.axis, 1.5)
    text(k, 'x (m)', W - 18, oy + 32, col.mute, 11, 'right'); text(k, 'y (m)', ox + 6, 20, col.mute, 11)
    // ideal parabola (ghost)
    const pts: [number, number][] = []
    for (let i = 0; i <= 60; i++) { const t = (id.tf * i) / 60; pts.push([px(id.vx * t), py(p.height + id.vy * t - 0.5 * id.g * t * t)]) }
    poly(k, pts, p.drag ? 'rgba(112,225,255,.45)' : 'rgba(112,225,255,.22)', p.drag ? 1.8 : 1.5, [6, 6])
    // actual trail
    poly(k, s.trail.map(([x, y]: number[]) => [px(x), py(y)] as [number, number]), col.cyan, 3)
    // launch angle arc
    if (p.height === 0) { k.g.beginPath(); k.g.arc(ox, oy, 34, -rad(p.angle), 0); k.g.strokeStyle = col.amber; k.g.lineWidth = 1.5; k.g.stroke(); text(k, `${p.angle}°`, ox + 40, oy - 8, col.amber, 12) }
    // ball + vectors
    const bx = px(s.x), by = py(s.y)
    dot(k, bx, by, 7, col.cyan)
    if (!s.landed) {
      const vs = 2.2
      arrow(k, bx, by, bx + s.vx * vs, by, col.green, 2)
      arrow(k, bx, by, bx, by - s.vy * vs, col.amber, 2)
      arrow(k, bx, by, bx + s.vx * vs, by - s.vy * vs, '#fff', 1.5)
    } else {
      dot(k, bx, oy, 4, col.red)
      text(k, `lands at ${fix(s.landed.x, 1)} m`, bx, oy - 14, col.red, 12, 'center', 700)
    }
    // legend
    text(k, '→ vₓ constant', W - 168, 36, col.green, 12); text(k, '↑ vᵧ changes', W - 168, 52, col.amber, 12); text(k, `t = ${fix(s.t, 2)} s`, W - 168, 70, col.ink, 12, 'left', 700)
    if (p.drag) text(k, 'dashed: ideal (no drag)', W - 168, 88, 'rgba(112,225,255,.7)', 11)
  },
  readouts(s, p) {
    const id = ideal(p)
    const r: [string, string][] = [['Ideal range', `${fix(id.range, 1)} m`], ['Max height', `${fix(id.peak, 1)} m`], ['Flight time', `${fix(id.tf, 2)} s`], ['g', `${id.g} m/s²`]]
    r.push(p.drag ? ['Range with drag', s.landed ? `${fix(s.landed.x, 1)} m` : 'in flight…'] : ['Speed now', `${fix(Math.hypot(s.vx, s.vy), 1)} m/s`])
    return r
  },
  caption: (s, p) => p.drag
    ? 'With drag, the path is no longer a parabola: the fall is steeper than the rise, the range shrinks, and the best angle drops below 45°.'
    : p.height > 0
      ? 'Launched from a height, the flight lasts longer and the best angle for range drops below 45°.'
      : 'Without drag the path is a symmetric parabola. Angles θ and 90° − θ give the same range.',
}

/* ───────────────────────── Pendulum ───────────────────────── */
const G_PEND = [9.81, 1.62, 24.79]
function agm(a: number, b: number) { for (let i = 0; i < 25; i++) { const an = (a + b) / 2; b = Math.sqrt(a * b); a = an } return a }
const Kell = (k: number) => Math.PI / (2 * agm(1, Math.sqrt(1 - k * k)))

export const pendulum: Sim = {
  alt: 'A pendulum swings. Beside it, a graph compares the true angle over time with the small-angle sine wave, and bars show kinetic, potential, and total energy.',
  params: [
    { key: 'length', label: 'Length L', min: 0.3, max: 3, step: 0.05, def: 1, unit: ' m', digits: 2 },
    { key: 'amp', label: 'Release angle θ₀', min: 5, max: 170, step: 1, def: 30, unit: '°' },
    { key: 'grav', label: 'World', kind: 'choice', choices: ['Earth', 'Moon', 'Jupiter'], min: 0, max: 2, step: 1, def: 0 },
    { key: 'damp', label: 'Damping b', min: 0, max: 1, step: 0.05, def: 0, unit: ' s⁻¹', digits: 2 },
  ],
  resetOn: ['length', 'amp', 'grav'],
  presets: [
    { label: 'Small swing (5°)', values: { amp: 5, length: 1, grav: 0, damp: 0 } },
    { label: 'Big swing (120°)', values: { amp: 120, length: 1, grav: 0, damp: 0 } },
    { label: 'Almost inverted (170°)', values: { amp: 170, length: 1, grav: 0, damp: 0 } },
    { label: 'Same pendulum on the Moon', values: { amp: 20, length: 1, grav: 1, damp: 0 } },
    { label: 'Add damping', values: { amp: 40, length: 1, grav: 0, damp: 0.3 } },
  ],
  init: (p) => ({ t: 0, th: rad(p.amp), om: 0, hist: [] as number[][], acc: 0 }),
  step(s, p, dt) {
    const g = G_PEND[p.grav], w2 = g / p.length, b = p.damp
    const f = (th: number, om: number) => [om, -w2 * Math.sin(th) - b * om]
    const h = 0.002
    let left = dt
    while (left > 1e-9) {
      const d = Math.min(h, left); left -= d
      const k1 = f(s.th, s.om), k2 = f(s.th + (d / 2) * k1[0], s.om + (d / 2) * k1[1])
      const k3 = f(s.th + (d / 2) * k2[0], s.om + (d / 2) * k2[1]), k4 = f(s.th + d * k3[0], s.om + d * k3[1])
      s.th += (d / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); s.om += (d / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
    }
    s.t += dt; s.acc += dt
    if (s.acc > 0.02) { s.acc = 0; s.hist.push([s.t, s.th]); while (s.hist.length && s.hist[0][0] < s.t - 8) s.hist.shift() }
  },
  draw(k, s, p) {
    clear(k)
    const g = G_PEND[p.grav], w0 = Math.sqrt(g / p.length)
    const px0 = 150, py0 = 46, Lpx = p.length * 62
    // pivot + arc
    line(k, 90, py0, 210, py0, col.axis, 3)
    line(k, px0, py0, px0, py0 + Lpx + 16, 'rgba(152,181,218,.25)', 1, [4, 5])
    k.g.beginPath(); k.g.arc(px0, py0, Lpx, Math.PI / 2 - rad(p.amp), Math.PI / 2 + rad(p.amp)); k.g.strokeStyle = 'rgba(181,161,255,.28)'; k.g.setLineDash([3, 6]); k.g.lineWidth = 1.5; k.g.stroke(); k.g.setLineDash([])
    const bx = px0 + Lpx * Math.sin(s.th), by = py0 + Lpx * Math.cos(s.th)
    line(k, px0, py0, bx, by, col.purple, 2.5)
    dot(k, px0, py0, 5, col.purple, false)
    // force arrows on bob
    const fs = 1.3 // px per (m/s^2) → scaled for visibility
    arrow(k, bx, by, bx, by + 30, col.amber, 2)
    const ft = -g * Math.sin(s.th) // tangential accel
    const tx = Math.cos(s.th), ty = -Math.sin(s.th)
    arrow(k, bx, by, bx + tx * ft * fs * 1.4, by + ty * ft * fs * 1.4, col.green, 2.5)
    dot(k, bx, by, 14, '#cdbdff')
    text(k, 'mg', bx + 8, by + 46, col.amber, 11); text(k, 'restoring', bx + (ft > 0 ? 20 : -62), by - 8, col.green, 11)
    text(k, `θ = ${fix(deg(s.th), 1)}°`, 16, 24, col.ink, 13, 'left', 700)
    // θ(t) plot
    const x0 = 330, x1 = 622, yc = 108, ya = 68
    text(k, 'angle vs time', x0, 28, col.mute, 11)
    line(k, x0, yc, x1, yc, col.axis); line(k, x0, yc - ya - 6, x0, yc + ya + 6, col.axis)
    const tmin = Math.max(0, s.t - 8), span = 8
    const th0 = rad(p.amp)
    const sa: [number, number][] = [], ex: [number, number][] = []
    for (let i = 0; i <= 100; i++) {
      const tt = tmin + (span * i) / 100
      if (tt > s.t) break
      sa.push([x0 + ((tt - tmin) / span) * (x1 - x0), yc - ((th0 * Math.cos(w0 * tt) * Math.exp(-p.damp * tt / 2)) / th0) * ya])
    }
    poly(k, sa, 'rgba(255,189,118,.85)', 1.6, [5, 4])
    for (const [tt, th] of s.hist) ex.push([x0 + ((tt - tmin) / span) * (x1 - x0), yc - (th / th0) * ya])
    poly(k, ex, col.cyan, 2.5)
    text(k, 'true motion', x1, 28, col.cyan, 11, 'right', 700); text(k, 'small-angle sine', x1, 42, col.amber, 11, 'right')
    // energy bars
    const E0 = g * p.length * (1 - Math.cos(th0))
    const PE = g * p.length * (1 - Math.cos(s.th)), KE = 0.5 * p.length * p.length * s.om * s.om
    const by0 = 214, bw = 220
    text(k, 'energy (per unit mass)', x0, by0 - 8, col.mute, 11)
    const bars: [string, number, string][] = [['Kinetic', KE, col.cyan], ['Potential', PE, col.purple], ['Total', KE + PE, col.amber]]
    bars.forEach(([name, v, c], i) => {
      rect(k, x0 + 62, by0 + i * 30, bw, 16, 'rgba(152,181,218,.09)', undefined, 4)
      rect(k, x0 + 62, by0 + i * 30, clamp(v / E0, 0, 1.02) * bw, 16, c, undefined, 4)
      text(k, name, x0, by0 + i * 30 + 12, col.mute, 11)
    })
    text(k, p.damp > 0 ? 'Total energy drains away through damping.' : 'Total stays constant; KE and PE trade places.', x0, by0 + 104, col.mute, 11)
  },
  readouts(s, p) {
    const g = G_PEND[p.grav], T0 = TAU * Math.sqrt(p.length / g)
    const T = 4 * Math.sqrt(p.length / g) * Kell(Math.sin(rad(p.amp) / 2))
    return [['Small-angle period T₀', `${fix(T0, 3)} s`], ['Exact period (undamped)', `${fix(T, 3)} s`], ['Difference', `${fix(((T - T0) / T0) * 100, 1)} %`], ['Frequency', `${fix(1 / T, 3)} Hz`], ['g', `${g} m/s²`]]
  },
  caption: (s, p) => p.amp > 60 ? 'At large angles the true period is noticeably longer than 2π√(L/g), and the swing is no longer a pure sine wave.' : 'For small angles the true motion and the sine-wave prediction are almost indistinguishable. Mass never appears in the period.',
}

/* ───────────────────────── Orbits (Kepler) ───────────────────────── */
// Units: GM = 1, starting distance r₀ = 1, so the circular speed is 1 and its period is 2π.
const OPERIOD = 0.5 // time units per equal-area wedge
export const orbits: Sim = {
  alt: 'A planet orbits a star. Coloured wedges show equal areas swept in equal times, and arrows show velocity and gravitational pull.',
  params: [
    { key: 'v', label: 'Launch speed (× circular speed)', min: 0.4, max: 1.5, step: 0.01, def: 0.8, digits: 2 },
    { key: 'wedges', label: 'Equal-area wedges', kind: 'toggle', min: 0, max: 1, step: 1, def: 1 },
    { key: 'vec', label: 'Show vectors', kind: 'toggle', min: 0, max: 1, step: 1, def: 1 },
  ],
  resetOn: ['v'],
  presets: [
    { label: 'Circular orbit', values: { v: 1 } },
    { label: 'Gentle ellipse', values: { v: 0.85 } },
    { label: 'Highly elliptical', values: { v: 0.5 } },
    { label: 'Fast launch', values: { v: 1.25 } },
    { label: 'Escape (v > √2)', values: { v: 1.45 } },
  ],
  init: (p) => ({ t: 0, x: 1, y: 0, vx: 0, vy: p.v, trail: [[1, 0]] as number[][], wedges: [] as number[][][], curr: [[1, 0]] as number[][], sacc: 0, wacc: 0, acc: 0 }),
  step(s, p, dt) {
    const T = dt * 1.1
    let left = T
    while (left > 1e-9) {
      const r = Math.hypot(s.x, s.y)
      const h = Math.min(left, clamp(0.01 * Math.pow(r, 1.5), 0.0004, 0.004))
      left -= h
      // velocity-Verlet (symplectic, conserves energy well)
      let a = -1 / (r * r * r)
      s.vx += 0.5 * h * a * s.x; s.vy += 0.5 * h * a * s.y
      s.x += h * s.vx; s.y += h * s.vy
      const r2 = Math.hypot(s.x, s.y); a = -1 / (r2 * r2 * r2)
      s.vx += 0.5 * h * a * s.x; s.vy += 0.5 * h * a * s.y
      s.t += h; s.sacc += h; s.wacc += h
      if (s.sacc > 0.04) { s.sacc = 0; s.trail.push([s.x, s.y]); if (s.trail.length > 900) s.trail.shift() }
      if (s.wacc > OPERIOD / 10) {
        s.wacc = 0; s.curr.push([s.x, s.y])
        if (s.curr.length > 10) { s.wedges.push(s.curr); if (s.wedges.length > 7) s.wedges.shift(); s.curr = [s.curr[s.curr.length - 1]] }
      }
    }
  },
  draw(k, s, p) {
    clear(k)
    const E = (p.v * p.v) / 2 - 1
    const a = E < 0 ? -1 / (2 * E) : Infinity
    const e = Math.abs(p.v * p.v - 1)
    const rOther = E < 0 ? (p.v < 1 ? a * (1 - e) : a * (1 + e)) : 4
    const Rv = clamp(Math.max(1, rOther), 1, 6)
    const sc = (Math.min(W, H) / 2 - 26) / Rv
    const cx = W / 2, cy = H / 2
    const X = (x: number) => cx + x * sc, Y = (y: number) => cy - y * sc
    ring(k, X(0), Y(0), 1 * sc, 'rgba(152,181,218,.12)', 1, [3, 6])
    // wedges
    if (p.wedges) {
      const all = [...s.wedges, s.curr]
      all.forEach((w: number[][], i: number) => {
        if (w.length < 2) return
        const pts: [number, number][] = [[X(0), Y(0)], ...w.map(([x, y]) => [X(x), Y(y)] as [number, number])]
        poly(k, pts, 'rgba(0,0,0,0)', 0, [], i % 2 ? 'rgba(112,225,255,.20)' : 'rgba(181,161,255,.22)', true)
      })
    }
    poly(k, s.trail.map(([x, y]: number[]) => [X(x), Y(y)] as [number, number]), 'rgba(234,242,255,.55)', 1.6)
    // star
    dot(k, X(0), Y(0), 13, '#ffd98a'); dot(k, X(0), Y(0), 7, '#fff3c9', false)
    // planet
    const bx = X(s.x), by = Y(s.y)
    dot(k, bx, by, 7, col.cyan)
    if (p.vec) {
      const r = Math.hypot(s.x, s.y), sp = Math.hypot(s.vx, s.vy)
      const gm = 1 / (r * r)
      arrow(k, bx, by, bx + s.vx * 26, by - s.vy * 26, col.green, 2)
      const gl = clamp(gm * 24, 6, 55)
      arrow(k, bx, by, bx - (s.x / r) * gl, by + (s.y / r) * gl, col.amber, 2)
      text(k, 'v', bx + s.vx * 26 + 6, by - s.vy * 26, col.green, 12, 'left', 700)
      text(k, 'F', bx - (s.x / r) * gl - 14, by + (s.y / r) * gl + 4, col.amber, 12, 'left', 700)
    }
    text(k, E >= 0 ? 'Unbound: the planet escapes' : 'Bound orbit', 16, 26, E >= 0 ? col.red : col.ink, 13, 'left', 700)
    text(k, 'Equal times → equal areas', 16, H - 16, col.mute, 11)
    if (Math.hypot(s.x, s.y) * sc > W) text(k, '(leaving the view)', W - 16, H - 16, col.mute, 11, 'right')
  },
  readouts(s, p) {
    const E = (p.v * p.v) / 2 - 1, r = Math.hypot(s.x, s.y), sp = Math.hypot(s.vx, s.vy), L = s.x * s.vy - s.y * s.vx
    if (E >= 0) return [['Total energy', `${fix(E, 3)} ≥ 0`], ['Escape speed', '√2 ≈ 1.414 × circular'], ['Distance r', fix(r, 2)], ['Angular momentum L', fix(L, 3)]]
    const a = -1 / (2 * E), e = Math.abs(p.v * p.v - 1), T = TAU * Math.pow(a, 1.5)
    return [['Eccentricity e', fix(e, 3)], ['Semi-major axis a', fix(a, 3)], ['Period T', fix(T, 2)], ['T² / a³', fix((T * T) / (a * a * a), 2) + ' (4π² = 39.48)'], ['Angular momentum L', fix(L, 3) + ' (constant)'], ['Distance r', fix(r, 2)]]
  },
  caption: (s, p) => p.v >= Math.SQRT2 ? 'At or above escape speed (√2 × circular) the total energy is non-negative, so the orbit is open and the planet never returns.' : p.v === 1 ? 'A circular orbit is the special case e = 0: constant speed, constant distance.' : 'The planet speeds up near the star and slows far away, so every coloured wedge has the same area.',
}
