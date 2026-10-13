# Review of Physics in Motion v1, and what changed in v2

## 1. Summary

v1 had a polished look and a sound architecture for five concepts, but the simulations were mostly **decorative rather than physical**. Several sliders did not drive the physics they were labelled with, the equations were sometimes trivial, and the product called itself a *dictionary* without containing any terms. v2 keeps the visual identity, routing-free deployment setup, bookmarks and progress, and replaces the engine and content so that every number on screen comes from a model you can check.

## 2. Critical findings in v1

### Scientific and pedagogical

| Area | Finding | Why it matters |
|---|---|---|
| Pendulum | Bob angle was `sin(tick/9)·0.45`: fixed amplitude and fixed frequency. The length slider changed the drawn arm and the printed period but **not the motion**. The paused pose used hard-coded coordinates unrelated to the model. | The animation contradicted the displayed T = 2π√(L/g). |
| Projectile | The marker sat at a fixed fraction (0.56) of the path and never moved along it. Range and height used arbitrary pixel factors, not g. | No real trajectory, no timing, no vectors. |
| Wave interference | Waves were static. The resultant was drawn at 18 px per unit, the components at 30 px. The only equation, y₁ + y₂ = y_result, is a tautology. | Cancellation could not be judged by eye; no quantitative content. |
| Induction | The magnet teleported (modulo wrap). "Relative emf index = speed × turns/100" is not physical, and contradicted the advanced note that speed alone does not fix the voltage. The experiment text asked users to reverse the direction, with no control for it. | Missed the key signature of Faraday's law: a bipolar pulse whose area depends only on the flux change. |
| Quantum | A static Gaussian labelled "width %". No ψ, no time dependence, no quantised energy, no measurement. | Reinforced the "cloud of matter" misconception the text warns about. |
| Text | Pendulum experiment text referred to a release-angle control that did not exist. | Instructions that cannot be followed erode trust. |

### Product and UX

- A "dictionary" with **no glossary entries**, no formula reference, and search limited to titles.
- `⌘ K` was displayed but not implemented. The help button did nothing.
- 8–11 px type throughout; low contrast secondary text; no reduced-motion support.
- One scrolling page with no per-concept URLs, so nothing could be linked from slides or an LMS.
- State updated by a 50 ms `setInterval` that re-rendered the whole simulation component.
- Hard-coded category counts and a chain of ternaries for card icons.
- Explored status only through a manual button; no assessment.

## 3. What v2 does

### Simulation engine (`src/sim/`)
One declarative `Sim` spec per model (parameters, presets, init, step, draw, readouts, caption, alt text). A single `SimPlayer` provides play/pause, 0.25–2× speed, reset, presets, live readouts, an adaptive explanatory caption, PNG export (for slides), full-screen (for projecting), off-screen pausing, and reduced-motion handling. Adding a model needs only a new spec.

### Physics corrections and new models
All integrators and formulas were checked headlessly against analytic results (see section 5).

| Concept | Model |
|---|---|
| Projectile | True trajectory with vectors; Earth/Moon/Mars; launch height; optional quadratic drag with ideal-parabola ghost. |
| Pendulum | Full nonlinear equation (RK4), real period, small-angle sine overlay, exact period via elliptic integral, energy bars, damping. |
| Orbits (new) | Velocity-Verlet (symplectic), equal-area wedges, e, a, T²/a³ readouts, escape speed. |
| Interference | Travelling waves, phase, unequal amplitude, frequency mismatch giving exact envelope and beats. |
| Doppler (new) | Moving-source wavefronts, heard frequencies in Hz, Mach cone. |
| Refraction (new) | Snell's law, critical angle, Fresnel reflectance for unpolarised light, Brewster angle, speed-dependent ray motion. |
| Induction | Point-dipole flux through a 3 cm coil, ε = −N dΦ/dt in mV, Lenz's law caption, flip-magnet control, bipolar pulse. |
| Lorentz force (new) | Cyclotron orbit, E×B drift, velocity selector; real gyroradius, frequency, energy for proton, electron, alpha. |
| Ideal gas (new) | Wall-collision pressure vs P = NkT/V, 3-D Maxwell–Boltzmann histogram with theory curve, piston, N₂ speeds. |
| Quantum box (replaces the Gaussian) | Eigenstates and superpositions with exact time evolution, Re/Im parts, |ψ|², Born-rule detections, energy ladder, eV and photon wavelength for an electron. |
| Double slit (new) | Single-particle build-up from the Fraunhofer pattern, which-path toggle, theory overlay; no trajectories drawn, on purpose. |
| Radioactive decay (new) | Stochastic nuclei vs N₀2^(−t/T½), noise ~1/√N, log-axis straight line, measured half-life. |

### Content (per concept)
Intuition, equations typeset with KaTeX, symbol table with units, a derivation, stated model assumptions, an advanced section, four guided experiments (each can configure the lab with one click), applications, three corrected misconceptions, history, a four-question quiz with explanations, takeaway, key terms, and related concepts. 63 equations and 48 quiz questions in total.

### Dictionary and navigation
43-term glossary linked to concepts, printable formula sheet, search over concepts and terms (`Ctrl/⌘ K` or `/`), guided learning paths, deep links (`#/topic/orbits`), saved concepts, best quiz scores, light and dark themes, a print stylesheet for lecture notes, skip link, ARIA labels and canvas alt text.

## 4. Please review these as the subject expert

I wrote and cross-checked the content, but a physicist's eye should sign it off before students rely on it. In particular:

- **Numerical facts in the applications and history text** (isotope half-lives, "majority of nuclear-medicine scans" for Tc-99m, historical dates, constants).
- **Pedagogical simplifications**: gas pressure is shown for a quasi-2-D picture with a hidden third velocity component; the double-slit uses dimensionless fringe units; the induction model assumes a point dipole; the drag coefficient (0.02 m⁻¹) is representative, not a specific ball.
- **Level labels** (Beginner/Intermediate/Advanced) and the four-question quizzes, which are a first pass.

## 5. Verification performed, and its limits

Done in this environment:
- Headless run of all 12 simulations through every preset and the minimum and maximum of every parameter (600 frames each): no exceptions, no NaN or infinite drawing arguments, valid readouts.
- Physics checks: projectile landing x = v²sin2θ/g exactly (62.743 m); pendulum 90° period 2.3667 s measured vs 2.3678 s from the elliptic integral; orbit energy drift < 2×10⁻⁵ over 60 s with L conserved exactly; gyro-orbit radius 1.000 ± 0.005; E = vB gives a straight path; net ∫ε dt over a magnet pass ≈ 0 (−3×10⁻⁸ V·s) with peak 59.9 mV for N = 100.
- Full app bundled and exercised in headless Chromium: all 12 topic pages, glossary deep link, formula sheet, search, quiz, presets, theme, mobile width (no horizontal overflow, no runtime errors).
- Strict TypeScript check of the data, content, glossary and simulation modules: clean.

**Not possible here (no network):** `npm install`, `vite build`, and the real KaTeX and lucide-react packages. The browser test used stand-ins for those two libraries, so **equation typesetting was not visually confirmed**. Please run `npm install && npm run build` once; if `tsc` reports anything in the React files, it will be a small typing fix. Google Fonts also fell back to system fonts in my test, so spacing may look slightly different with DM Sans and Manrope.

## 6. Suggested next steps

1. **More concepts** (the engine makes each about a day of work): collisions and conservation laws, driven oscillator and resonance, special relativity (light clock), Coulomb's law and field lines, RC and LC circuits, polarisation, the photoelectric effect, hydrogen spectrum, Beer–Lambert attenuation, ultrasound and tissue interaction, MRI precession.
2. **Interaction**: drag the magnet or the pendulum bob with touch and mouse; shareable URLs that encode slider values; "predict first, then run" prompts before the lab starts.
3. **Teaching tools**: a teacher mode that hides the answers, quiz export (CSV), and slide export.
4. **Quality**: unit tests (Vitest) that encode the analytic checks above; lazy-load KaTeX and the simulation modules to shrink the first load; PWA offline support; translations.
5. **Accessibility**: keyboard control of the canvas parameters is already via sliders; add a text-only "describe what is happening" log for screen-reader users.
