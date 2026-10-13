import { W, H, TAU, col, clear, line, poly, arrow, text, dot, ring, rect, clamp, rad, deg, fix, type Sim } from './kit'

/* ───────────────────────── Wave interference & beats ───────────────────────── */
export const interference: Sim = {
  alt: 'Two travelling sine waves and their sum are drawn one above the other. A dashed envelope shows the amplitude of the combined wave.',
  params: [
    { key: 'phase', label: 'Phase difference φ', min: 0, max: 360, step: 1, def: 90, unit: '°' },
    { key: 'ampB', label: 'Amplitude of wave B (A = 1)', min: 0, max: 1.5, step: 0.05, def: 1, digits: 2 },
    { key: 'df', label: 'Frequency mismatch Δf / f', min: 0, max: 0.12, step: 0.005, def: 0, digits: 3 },
  ],
  presets: [
    { label: 'Constructive (φ = 0°)', values: { phase: 0, ampB: 1, df: 0 } },
    { label: 'Destructive (φ = 180°)', values: { phase: 180, ampB: 1, df: 0 } },
    { label: 'Partial (φ = 90°)', values: { phase: 90, ampB: 1, df: 0 } },
    { label: 'Unequal amplitudes cancel only partly', values: { phase: 180, ampB: 0.5, df: 0 } },
    { label: 'Beats (Δf/f = 8%)', values: { phase: 0, ampB: 1, df: 0.08 } },
  ],
  init: () => ({ t: 0 }),
  step(s, p, dt) { s.t += dt },
  draw(k, s, p) {
    clear(k)
    const x0 = 36, x1 = W - 20, span = 5 // five wavelengths of wave A across the view
    const f = 0.35 // visual frequency: cycles per second
    const phi = rad(p.phase), a = p.ampB, d = p.df
    const U = (i: number) => (span * i) / 240
    const X = (u: number) => x0 + (u / span) * (x1 - x0)
    const A = (u: number) => Math.sin(TAU * (u - f * s.t))
    const B = (u: number) => a * Math.sin(TAU * (1 + d) * (u - f * s.t) + phi)
    const rows = [{ y: 62, amp: 30, c: col.cyan, name: 'Wave A  (amplitude 1)', fn: A }, { y: 144, amp: 30, c: col.purple, name: `Wave B  (amplitude ${a.toFixed(2)})`, fn: B }, { y: 268, amp: 30, c: col.amber, name: 'Sum  A + B', fn: (u: number) => A(u) + B(u) }]
    for (const r of rows) {
      line(k, x0, r.y, x1, r.y, col.axis)
      const pts: [number, number][] = []
      for (let i = 0; i <= 240; i++) { const u = U(i); pts.push([X(u), r.y - r.fn(u) * r.amp]) }
      poly(k, pts, r.c, r.name.startsWith('Sum') ? 3 : 2.4)
      text(k, r.name, x0, r.y - 44, r.c, 12, 'left', 700)
    }
    // envelope of the sum
    const env = (u: number) => Math.sqrt(1 + a * a + 2 * a * Math.cos(TAU * d * (u - f * s.t) + phi))
    const up: [number, number][] = [], dn: [number, number][] = []
    for (let i = 0; i <= 240; i++) { const u = U(i); up.push([X(u), 268 - env(u) * 30]); dn.push([X(u), 268 + env(u) * 30]) }
    poly(k, up, 'rgba(255,189,118,.55)', 1.3, [5, 5]); poly(k, dn, 'rgba(255,189,118,.55)', 1.3, [5, 5])
    text(k, 'dashed: envelope', x1, 222, 'rgba(255,189,118,.8)', 11, 'right')
    // marker at fixed position
    line(k, X(2.5), 20, X(2.5), H - 20, 'rgba(255,255,255,.14)', 1, [2, 5])
  },
  readouts(s, p) {
    const a = p.ampB, phi = rad(p.phase)
    const ares = Math.sqrt(1 + a * a + 2 * a * Math.cos(phi))
    if (p.df > 0) return [['Beat frequency', `${fix(p.df * 100, 1)} % of f`], ['Envelope range', `${fix(Math.abs(1 - a), 2)} – ${fix(1 + a, 2)}`], ['Max intensity', `${fix((1 + a) ** 2, 2)} × I₀`], ['Min intensity', `${fix((1 - a) ** 2, 2)} × I₀`]]
    return [['Resultant amplitude', fix(ares, 2)], ['Intensity vs wave A', `${fix(ares * ares, 2)} ×`], ['Path difference', `${fix(p.phase / 360, 2)} λ`]]
  },
  caption(s, p) {
    if (p.df > 0) return 'Slightly different frequencies drift in and out of step, so the combined amplitude swells and fades: beats.'
    const ph = p.phase % 360
    if (Math.abs(ph) < 8 || Math.abs(ph - 360) < 8) return 'In phase: peaks meet peaks, the amplitudes add, and the intensity quadruples for equal waves.'
    if (Math.abs(ph - 180) < 8) return p.ampB === 1 ? 'Opposite phase with equal amplitudes: complete destructive interference.' : 'Opposite phase, but unequal amplitudes: the smaller wave only partly cancels the larger one.'
    return 'In between, the amplitudes add like vectors with an angle φ: A_res = √(A² + B² + 2AB cos φ).'
  },
}

/* ───────────────────────── Doppler effect ───────────────────────── */
const C_SIM = 90 // px/s visual wave speed
const F0 = 440, C_AIR = 343
export const doppler: Sim = {
  alt: 'A sound source moves to the right emitting circular wavefronts. Wavefronts bunch up ahead of the source and spread out behind it. Above Mach 1 a cone forms.',
  params: [{ key: 'mach', label: 'Source speed (Mach number M = vₛ/c)', min: 0, max: 1.8, step: 0.05, def: 0.5, digits: 2 }],
  presets: [
    { label: 'At rest', values: { mach: 0 } },
    { label: 'Ambulance (≈ 30 m/s)', values: { mach: 0.09 } },
    { label: 'Half the speed of sound', values: { mach: 0.5 } },
    { label: 'Nearly sonic', values: { mach: 0.95 } },
    { label: 'Supersonic: Mach 1.5', values: { mach: 1.5 } },
  ],
  resetOn: ['mach'],
  init: () => ({ t: 0, x: 60, ems: [] as { x: number; t: number }[], last: -1 }),
  step(s, p, dt) {
    s.t += dt
    s.x += p.mach * C_SIM * dt
    if (s.x > W - 60) { s.x = 60; s.ems = []; s.last = s.t }
    if (s.t - s.last >= 0.5) { s.ems.push({ x: s.x, t: s.t }); s.last = s.t }
    s.ems = s.ems.filter((e: any) => C_SIM * (s.t - e.t) < 700)
  },
  draw(k, s, p) {
    clear(k)
    const cy = H / 2 + 8
    for (const e of s.ems) {
      const r = C_SIM * (s.t - e.t)
      ring(k, e.x, cy, r, `rgba(112,225,255,${clamp(0.85 - r / 620, 0.12, 0.85)})`, 1.8)
    }
    if (p.mach > 1) {
      const mu = Math.asin(1 / p.mach), L = 360
      line(k, s.x, cy, s.x - L * Math.cos(mu), cy - L * Math.sin(mu), col.red, 2.2)
      line(k, s.x, cy, s.x - L * Math.cos(mu), cy + L * Math.sin(mu), col.red, 2.2)
      text(k, `Mach cone: sin μ = 1/M → μ = ${fix(deg(mu), 1)}°`, 16, 28, col.red, 12, 'left', 700)
    }
    dot(k, s.x, cy, 9, col.amber)
    arrow(k, s.x + 14, cy, s.x + 14 + Math.max(14, p.mach * 40), cy, col.amber, 2.2)
    text(k, 'listener behind: longer λ, lower pitch', 16, H - 16, col.mute, 12)
    text(k, 'listener ahead: shorter λ, higher pitch', W - 16, H - 16, col.mute, 12, 'right')
  },
  readouts(s, p) {
    const M = p.mach
    const ahead = M < 1 ? `${fix(F0 / (1 - M), 0)} Hz` : 'shock wave (no steady tone)'
    return [['Source frequency', `${F0} Hz (A4)`], ['Source speed', `${fix(M * C_AIR, 0)} m/s`], ['Heard ahead', ahead], ['Heard behind', `${fix(F0 / (1 + M), 0)} Hz`], ['Wavelength ahead / behind', M < 1 ? `${fix((C_AIR / F0) * (1 - M), 2)} / ${fix((C_AIR / F0) * (1 + M), 2)} m` : `— / ${fix((C_AIR / F0) * (1 + M), 2)} m`]]
  },
  caption: (s, p) => p.mach === 0 ? 'A stationary source: concentric circles, the same pitch everywhere.' : p.mach < 1 ? 'The source moves a distance vₛT between emissions, so crests are squeezed ahead (λ′ = (c − vₛ)T) and stretched behind.' : p.mach === 1 ? 'At Mach 1 the wavefronts pile up in front of the source.' : 'Faster than sound, the source outruns its own waves. The wavefronts overlap along a cone: a sonic boom.',
}

/* ───────────────────────── Refraction & reflection (Snell, Fresnel) ───────────────────────── */
const C_LIGHT = 2.998
export const snell: Sim = {
  alt: 'A light ray hits the boundary between two transparent materials. It bends toward or away from the normal, and a weaker reflected ray appears. Above the critical angle the ray is totally reflected.',
  params: [
    { key: 'th1', label: 'Angle of incidence θ₁', min: 0, max: 89, step: 1, def: 40, unit: '°' },
    { key: 'n1', label: 'Index of upper medium n₁', min: 1, max: 2.5, step: 0.01, def: 1, digits: 2 },
    { key: 'n2', label: 'Index of lower medium n₂', min: 1, max: 2.5, step: 0.01, def: 1.5, digits: 2 },
  ],
  presets: [
    { label: 'Air → water', values: { n1: 1, n2: 1.33, th1: 45 } },
    { label: 'Air → glass', values: { n1: 1, n2: 1.5, th1: 50 } },
    { label: 'Water → air', values: { n1: 1.33, n2: 1, th1: 40 } },
    { label: 'Glass → air (total internal reflection)', values: { n1: 1.5, n2: 1, th1: 50 } },
    { label: 'Brewster angle (air → glass)', values: { n1: 1, n2: 1.5, th1: 56 } },
    { label: 'Diamond → air', values: { n1: 2.42, n2: 1, th1: 30 } },
  ],
  init: () => ({ t: 0 }),
  step(s, p, dt) { s.t += dt },
  draw(k, s, p) {
    clear(k)
    const cx = W / 2, cy = H / 2, L = 165
    const t1 = rad(p.th1), sin2 = (p.n1 / p.n2) * Math.sin(t1)
    const tir = sin2 >= 1
    const t2 = tir ? 0 : Math.asin(sin2)
    const c1 = Math.cos(t1), c2 = tir ? 0 : Math.cos(t2)
    let R = 1
    if (!tir) { const rs = (p.n1 * c1 - p.n2 * c2) / (p.n1 * c1 + p.n2 * c2), rp = (p.n2 * c1 - p.n1 * c2) / (p.n2 * c1 + p.n1 * c2); R = (rs * rs + rp * rp) / 2 }
    // media
    rect(k, 0, 0, W, cy, `rgba(112,225,255,${0.03 + (p.n1 - 1) * 0.07})`)
    rect(k, 0, cy, W, H - cy, `rgba(112,170,255,${0.05 + (p.n2 - 1) * 0.1})`)
    line(k, 0, cy, W, cy, col.axis, 2)
    line(k, cx, cy - L - 14, cx, cy + L + 14, 'rgba(255,255,255,.35)', 1, [5, 5])
    text(k, 'normal', cx + 6, 24, col.mute, 11)
    text(k, `n₁ = ${fix(p.n1, 2)}   v₁ = ${fix(C_LIGHT / p.n1, 2)}×10⁸ m/s`, 14, 24, col.cyan, 12, 'left', 700)
    text(k, `n₂ = ${fix(p.n2, 2)}   v₂ = ${fix(C_LIGHT / p.n2, 2)}×10⁸ m/s`, 14, H - 14, col.blue, 12, 'left', 700)
    // rays: dashes drift along the direction of travel at a speed ∝ 1/n
    const ray = (x1: number, y1: number, x2: number, y2: number, n: number, color: string, alpha: number, lw: number) => {
      const g = k.g; g.save(); g.globalAlpha = alpha
      line(k, x1, y1, x2, y2, color, lw, [10, 12], -s.t * 70 / n)
      g.restore()
    }
    const ix = cx - L * Math.sin(t1), iy = cy - L * c1
    ray(ix, iy, cx, cy, p.n1, '#fff', 1, 3)
    ray(cx, cy, cx + L * Math.sin(t1), cy - L * c1, p.n1, col.amber, clamp(R, 0.08, 1), 3)
    if (!tir) ray(cx, cy, cx + L * Math.sin(t2), cy + L * c2, p.n2, col.green, clamp(1 - R, 0.08, 1), 3)
    // angle labels
    text(k, `θ₁ = ${p.th1}°`, cx - 100, cy - 18, '#fff', 12, 'left', 700)
    text(k, tir ? 'Total internal reflection' : `θ₂ = ${fix(deg(t2), 1)}°`, tir ? cx + 14 : cx + 18, tir ? cy + 40 : cy + 52, tir ? col.red : col.green, 12, 'left', 700)
    if (p.n1 > p.n2) text(k, `critical angle ${fix(deg(Math.asin(p.n2 / p.n1)), 1)}°`, W - 14, 24, col.red, 12, 'right')
  },
  readouts(s, p) {
    const t1 = rad(p.th1), sin2 = (p.n1 / p.n2) * Math.sin(t1), tir = sin2 >= 1
    let R = 1
    if (!tir) { const t2 = Math.asin(sin2), c1 = Math.cos(t1), c2 = Math.cos(t2); const rs = (p.n1 * c1 - p.n2 * c2) / (p.n1 * c1 + p.n2 * c2), rp = (p.n2 * c1 - p.n1 * c2) / (p.n2 * c1 + p.n1 * c2); R = (rs * rs + rp * rp) / 2 }
    return [['Refraction angle θ₂', tir ? 'none (TIR)' : `${fix(deg(Math.asin(sin2)), 1)}°`], ['Critical angle', p.n1 > p.n2 ? `${fix(deg(Math.asin(p.n2 / p.n1)), 1)}°` : 'none (n₁ ≤ n₂)'], ['Reflected (unpolarised)', `${fix(R * 100, 1)} %`], ['Transmitted', `${fix((1 - R) * 100, 1)} %`], ['Brewster angle', `${fix(deg(Math.atan(p.n2 / p.n1)), 1)}°`], ['Speed ratio v₂/v₁', fix(p.n1 / p.n2, 2)]]
  },
  caption: (s, p) => (p.n1 / p.n2) * Math.sin(rad(p.th1)) >= 1 ? 'Snell’s law has no solution: all of the light is reflected. Optical fibres rely on exactly this.' : p.n2 > p.n1 ? 'Entering a slower medium, light bends toward the normal because the wavefront slows on one side first.' : p.n2 < p.n1 ? 'Entering a faster medium, light bends away from the normal. Increase θ₁ until it grazes the surface at the critical angle.' : 'Equal indices: no bending and no reflection.',
}
