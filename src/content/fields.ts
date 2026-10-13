import type { Topic } from '../data'
const T = String.raw

export const electromagnetism: Topic[] = [
  {
    id: 'induction', title: 'Electromagnetic induction', category: 'Electromagnetism', level: 'Intermediate', duration: '10 min', accent: '#6ee7b7', glyph: '⌁',
    tags: ['faraday', 'lenz', 'flux', 'emf', 'generator', 'transformer', 'coil', 'magnet'],
    description: 'Explore how changing magnetic flux produces voltage.',
    question: 'How can motion alone create a voltage without a battery?',
    intuition: [
      'A magnet near a coil does nothing by itself. The effect appears only when the magnetic flux, the amount of magnetic field threading the coil, changes. Push the magnet in, pull it out, spin the coil, change the field’s strength: any change of flux induces an electromotive force (emf).',
      'Lenz’s law gives the sign: the induced current creates a magnetic field that opposes the change. The coil repels an approaching magnet and attracts a leaving one. This is energy conservation in disguise: you must do work against that opposition, and the work becomes electrical energy.',
      'The graph shows a characteristic signature: a pulse of one sign as the magnet approaches and the opposite sign as it leaves. A magnet sitting still, even in the middle of the coil, induces nothing.',
    ],
    equations: [
      { label: 'Faraday’s law', tex: T`\varepsilon=-N\dfrac{d\Phi_B}{dt}`, note: 'The minus sign is Lenz’s law.' },
      { label: 'Magnetic flux', tex: T`\Phi_B=\int \vec B\cdot d\vec A=BA\cos\theta` },
      { label: 'On-axis flux of a magnetic dipole through a loop (model used here)', tex: T`\Phi(z)=\dfrac{\mu_0\,m\,a^2}{2\,(a^2+z^2)^{3/2}}` },
      { label: 'Resulting emf for a magnet moving at speed v', tex: T`\varepsilon(z)=\dfrac{3N\mu_0\,m\,a^2\,z\,v}{2\,(a^2+z^2)^{5/2}}` },
      { label: 'Motional emf (rod in a field)', tex: T`\varepsilon=BLv` },
      { label: 'Ideal transformer', tex: T`\dfrac{V_s}{V_p}=\dfrac{N_s}{N_p}` },
    ],
    variables: [
      { sym: '\\varepsilon', meaning: 'induced emf', unit: 'V' }, { sym: 'N', meaning: 'number of turns' }, { sym: '\\Phi_B', meaning: 'magnetic flux', unit: 'Wb = T·m²' },
      { sym: 'm', meaning: 'magnet’s dipole moment', unit: 'A·m²' }, { sym: 'a', meaning: 'coil radius (3 cm here)', unit: 'm' }, { sym: 'z', meaning: 'magnet’s distance from the coil plane', unit: 'm' },
    ],
    derivation: {
      title: 'Where the induced-voltage pulse comes from',
      steps: [
        { text: 'A magnetic dipole m on the axis produces a vector potential A_φ = μ₀m sinθ / (4πr²). The flux through a loop equals the line integral of A around its edge (Stokes’ theorem). On the loop, r² = a² + z² and sinθ = a/r:', tex: T`\Phi=\oint \vec A\cdot d\vec l=2\pi a\cdot\dfrac{\mu_0 m}{4\pi}\dfrac{a}{(a^2+z^2)^{3/2}}=\dfrac{\mu_0 m a^2}{2(a^2+z^2)^{3/2}}` },
        { text: 'The magnet moves at speed v, so dz/dt = v and the chain rule gives dΦ/dt = (dΦ/dz)v:', tex: T`\dfrac{d\Phi}{dz}=-\dfrac{3\mu_0 m a^2 z}{2(a^2+z^2)^{5/2}}` },
        { text: 'Faraday’s law with N turns gives the emf:', tex: T`\varepsilon=-N\dfrac{d\Phi}{dt}=\dfrac{3N\mu_0 m a^2\,z\,v}{2(a^2+z^2)^{5/2}}` },
        { text: 'This changes sign at z = 0 (positive pulse before, negative after, or the reverse depending on orientation) and is largest near z ≈ ±a/2. Doubling v doubles ε but halves the duration, so the area under each pulse (the net change of flux) stays the same.' },
      ],
    },
    advanced: [
      'Faraday’s law is one of Maxwell’s equations in integral form: ∮E·dl = −dΦ/dt. It says a changing B induces a circulating, non-conservative E field even where there is no wire, so voltage along a loop depends on the path.',
      'A real bar magnet has finite size, not a point dipole, and the coil’s own inductance and resistance filter the signal (the induced current also creates its own field: self-inductance). The point-dipole model is accurate once the magnet is a few coil radii away.',
      'Induction and the magnetic force on moving charges are two views of one phenomenon. Moving the magnet or moving the coil produces the same emf. That symmetry was Einstein’s starting point for special relativity (1905).',
    ],
    assumptions: ['Ideal point dipole on the coil axis', 'Coil radius 3 cm, magnet strength ≈ 1 A·m² (a strong neodymium magnet) as default', 'Open circuit: the emf is shown, not the current; coil self-inductance neglected'],
    experiments: [
      { title: 'Double the speed', do: 'Raise the speed from 1 to 2 m/s.', expect: 'The peak emf doubles, the pulse is half as long, and the area under each pulse is unchanged.', preset: 'Twice as fast' },
      { title: 'More turns', do: 'Double N.', expect: 'ε doubles at every instant, because each turn adds its own emf in series.', preset: 'Twice the turns' },
      { title: 'Flip the magnet', do: 'Enable “Flip the magnet”.', expect: 'The signs of the pulses swap.', preset: 'Reversed magnet' },
      { title: 'Crawl, don’t push', do: 'Use the slow 0.2 m/s preset.', expect: 'Same flux change but a pulse about 5× lower and 5× longer. Slow changes induce little voltage.', preset: 'Very slow (no big voltage)' },
    ],
    applications: [
      { title: 'Power generation', text: 'Nearly all electricity comes from generators that spin coils in magnetic fields (hydro, steam, wind, nuclear all end here).' },
      { title: 'Transformers and wireless charging', text: 'Changing current in a primary coil induces a voltage in a secondary one, enabling grid voltage conversion and phone charging pads.' },
      { title: 'Induction cooktops and metal detectors', text: 'Eddy currents induced in pans heat them directly; metal detectors sense eddy currents in hidden objects.' },
      { title: 'MRI and magnetic sensing', text: 'In MRI the precessing nuclear magnetisation induces a tiny emf in receiver coils; that signal is the image data. Gradient-field switching also induces currents in tissue, which is why switching rates are limited for safety (peripheral nerve stimulation).' },
    ],
    misconceptions: [
      { myth: 'A strong magnet near a coil generates a voltage.', reality: 'Only a changing flux does. A stationary magnet, however strong, induces no emf.' },
      { myth: 'Lenz’s law is a separate rule from energy conservation.', reality: 'It is the sign that makes energy conservation work. If the induced effect reinforced the change, you would get energy from nothing.' },
      { myth: 'Faster magnet = more energy gained.', reality: 'Faster means larger emf but a shorter pulse. The total flux change, and thus ∫ε dt, is fixed by geometry.' },
    ],
    history: 'Faraday discovered induction in August 1831 with an iron ring and two coils, and Joseph Henry found it independently around the same time. Lenz stated his rule in 1834.',
    quiz: [
      { q: 'A bar magnet rests inside a coil. The induced emf is…', options: ['large', 'zero', 'negative', 'depends on the magnet’s strength'], answer: 1, why: 'There is no change in flux, so dΦ/dt = 0 and ε = 0, however strong the magnet is.' },
      { q: 'A magnet’s N pole approaches a coil. By Lenz’s law the coil face nearest the magnet…', options: ['becomes a South pole', 'becomes a North pole (repels)', 'stays neutral', 'attracts the magnet'], answer: 1, why: 'The induced current opposes the increasing flux by repelling the approaching pole.' },
      { q: 'You double both the number of turns and the magnet’s speed. The peak emf becomes…', options: ['2×', '4×', '8×', 'Unchanged'], answer: 1, why: 'ε ∝ N·v, so 2 × 2 = 4.' },
      { q: 'The sign of the emf flips when the magnet goes from approaching to leaving because…', options: ['the coil heats', 'the flux changes from increasing to decreasing', 'the coil changes polarity by itself', 'the magnet runs out of field'], answer: 1, why: 'Lenz’s law: the induced emf opposes whichever change is occurring.' },
    ],
    takeaway: 'Only a changing magnetic flux induces emf, and the induced effect always opposes the change.',
    related: ['lorentz', 'interference'],
  },
  {
    id: 'lorentz', title: 'The Lorentz force and cyclotron motion', category: 'Electromagnetism', level: 'Intermediate', duration: '9 min', accent: '#ff7898', glyph: '⟲',
    tags: ['magnetic force', 'cyclotron', 'gyroradius', 'mass spectrometer', 'velocity selector', 'drift', 'plasma', 'aurora'],
    description: 'Watch charges circle, drift, and travel straight in crossed fields.',
    question: 'Why does a magnetic field bend the path of a charged particle but never speed it up?',
    intuition: [
      'A magnetic force on a moving charge acts sideways to the velocity, so it can turn the particle but can never change its speed. With nothing to stop the turning, the particle moves on a circle: the radius grows with momentum and shrinks with a stronger field or larger charge.',
      'Add an electric field at right angles and the picture changes: the electric force speeds the particle up on one side of the circle and slows it on the other, so the loop gets stretched and the whole motion drifts at speed E/B, perpendicular to both fields, in the same direction for every particle, positive or negative.',
      'Choose E = vB and the electric and magnetic forces cancel. Only particles with exactly that speed travel straight: a velocity selector.',
    ],
    equations: [
      { label: 'Lorentz force', tex: T`\vec F=q\left(\vec E+\vec v\times\vec B\right)` },
      { label: 'Gyroradius', tex: T`r=\dfrac{mv_\perp}{|q|B}=\dfrac{p_\perp}{|q|B}` },
      { label: 'Cyclotron frequency (non-relativistic)', tex: T`\omega_c=\dfrac{|q|B}{m},\qquad f_c=\dfrac{|q|B}{2\pi m}` },
      { label: 'E × B drift speed', tex: T`\vec v_d=\dfrac{\vec E\times\vec B}{B^2}` },
      { label: 'Velocity selector', tex: T`qE=qvB\;\Rightarrow\;v=\dfrac{E}{B}` },
    ],
    variables: [
      { sym: 'q,\\;m', meaning: 'charge and mass of the particle', unit: 'C, kg' }, { sym: 'B', meaning: 'magnetic field strength', unit: 'T' }, { sym: 'E', meaning: 'electric field strength', unit: 'V/m' },
      { sym: 'v_\\perp', meaning: 'speed component perpendicular to B', unit: 'm/s' }, { sym: 'v_d', meaning: 'drift speed', unit: 'm/s' },
    ],
    derivation: {
      title: 'Why the orbit is a circle with r = mv/qB',
      steps: [
        { text: 'The magnetic force F = qvB is perpendicular to v, so it supplies the centripetal force:', tex: T`qvB=\dfrac{mv^2}{r}` },
        { text: 'Solve for r:', tex: T`r=\dfrac{mv}{qB}` },
        { text: 'The period is the circumference over the speed. The speed cancels, so the period (and f_c) does not depend on v or r:', tex: T`T=\dfrac{2\pi r}{v}=\dfrac{2\pi m}{qB}` },
        { text: 'The magnetic force does no work (F · v = 0), so kinetic energy is constant. Adding E, go to the frame moving at v_d = E/B: there the electric field vanishes, and the motion is a pure circle, so in the lab the path is a circle plus uniform drift (a cycloid).' },
      ],
    },
    advanced: [
      'Because T is independent of speed (while v ≪ c), a particle can be accelerated by an alternating electric field in step with its orbit: the cyclotron. At relativistic energies m → γm and the frequency drops, requiring synchrocyclotrons and synchrotrons.',
      'In a non-uniform field a particle also drifts (gradient and curvature drifts) and bounces between magnetic mirrors, which is how the Van Allen belts trap particles and how tokamaks confine plasma.',
      'Because the E × B drift is identical for ions and electrons, a neutral plasma drifts as a whole without a net current from it. This drift is central to magnetic confinement and underlies the Hall effect.',
    ],
    assumptions: ['Uniform fields, non-relativistic speeds (v ≪ c)', 'No collisions or radiation losses', 'Visual time is slowed down; the real periods are microseconds (see readouts)'],
    experiments: [
      { title: 'Charge sign', do: 'Compare a proton and an electron at the same speed and B.', expect: 'The electron circles the other way and its radius is 1836× smaller.', preset: 'Electron: opposite sense, tiny radius' },
      { title: 'Double the field', do: 'Raise B from 100 to 300 mT.', expect: 'The radius shrinks by 3×, the frequency rises 3×.', preset: 'Stronger field → tighter circle' },
      { title: 'Cycloid', do: 'Turn on E = 50 kV/m.', expect: 'The orbit drifts at E/B = 5×10⁵ m/s while still circling.', preset: 'E × B drift (cycloid)' },
      { title: 'Velocity selector', do: 'Set E = 100 kV/m with v = 10⁶ m/s and B = 100 mT.', expect: 'Perfectly straight path; change v and it bends.', preset: 'Velocity selector (E = vB)' },
    ],
    applications: [
      { title: 'Cyclotrons for medicine', text: 'Compact cyclotrons produce radioisotopes such as ¹⁸F for PET and accelerate protons for cancer therapy.' },
      { title: 'Mass spectrometry', text: 'Ions of different m/q follow circles of different radii in a magnetic field, separating molecules by mass to identify proteins, drugs, and isotopes.' },
      { title: 'Auroras and space weather', text: 'Charged particles spiral along Earth’s field lines and strike the upper atmosphere near the poles, exciting oxygen and nitrogen to glow.' },
      { title: 'Fusion energy', text: 'Tokamaks and stellarators confine plasma by making particles gyrate around field lines instead of hitting the walls.' },
    ],
    misconceptions: [
      { myth: 'A magnetic field can speed a charge up.', reality: 'The magnetic force is perpendicular to the velocity and does no work. Only an electric field changes the kinetic energy.' },
      { myth: 'The magnetic force acts on any charge, moving or not.', reality: 'It acts only on moving charges (v ≠ 0). A stationary charge feels only E.' },
      { myth: 'Positive and negative charges drift in opposite directions in crossed fields.', reality: 'The E × B drift is the same for both. Their gyration directions are opposite.' },
    ],
    history: 'Lawrence built the first cyclotron at Berkeley in 1931 (Nobel Prize 1939). Thomson used crossed E and B fields in 1897 to measure the charge-to-mass ratio of the electron.',
    quiz: [
      { q: 'A charged particle moves through a magnetic field. The magnetic force does…', options: ['positive work', 'negative work', 'no work', 'work only for electrons'], answer: 2, why: 'F is perpendicular to v, so F·v = 0: kinetic energy stays constant.' },
      { q: 'A proton and an alpha particle with equal speed enter the same B field. The alpha’s radius is…', options: ['equal', '2× larger', '4× larger', '2× smaller'], answer: 1, why: 'r = mv/qB. An alpha has m ≈ 4m_p and q = 2e, so its m/q is twice a proton’s and its radius is 2× larger.' },
      { q: 'In a velocity selector, which ions pass straight through?', options: ['Only heavy ions', 'Only light ions', 'Those with v = E/B', 'Those with q > 0'], answer: 2, why: 'Net force zero requires qE = qvB, independent of mass and charge.' },
      { q: 'If B is doubled (everything else the same), the cyclotron frequency…', options: ['halves', 'doubles', 'is unchanged', 'quadruples'], answer: 1, why: 'f_c = |q|B/(2πm) ∝ B.' },
    ],
    takeaway: 'Magnetic force turns charges without changing their speed; combined with an electric field it produces drift and the velocity selector.',
    related: ['induction', 'gas'],
  },
]

export const thermo: Topic[] = [
  {
    id: 'gas', title: 'The ideal gas and kinetic theory', category: 'Thermodynamics', level: 'Beginner', duration: '10 min', accent: '#ff9f7a', glyph: '◌',
    tags: ['pressure', 'temperature', 'maxwell-boltzmann', 'ideal gas law', 'kinetic energy', 'molecules', 'statistical mechanics'],
    description: 'Watch pressure and temperature emerge from bouncing molecules.',
    question: 'What are pressure and temperature, really, at the level of molecules?',
    intuition: [
      'Gas pressure is the average force per area of molecules hammering the walls. Each hit is tiny, but trillions per second add up to a steady push. Temperature is a measure of the average kinetic energy of the random motion: hot molecules move faster and hit harder and more often.',
      'The molecules do not all move at one speed. Collisions spread them into the Maxwell–Boltzmann distribution: a few very slow, a few very fast, most near the peak. Raising the temperature shifts and flattens the curve.',
      'Squeezing the gas into a smaller volume makes the walls get hit more often, so the pressure rises. Add more molecules and it rises too. These three effects together are the ideal gas law.',
    ],
    equations: [
      { label: 'Ideal gas law', tex: T`PV=Nk_BT=nRT` },
      { label: 'Kinetic definition of temperature', tex: T`\left\langle \tfrac12 m v^2\right\rangle=\tfrac32 k_BT` },
      { label: 'Pressure from molecular motion', tex: T`P=\dfrac13\dfrac{N}{V}\,m\langle v^2\rangle` },
      { label: 'Maxwell–Boltzmann speed distribution', tex: T`f(v)=4\pi\left(\dfrac{m}{2\pi k_BT}\right)^{3/2}v^2\,e^{-mv^2/2k_BT}` },
      { label: 'Characteristic speeds', tex: T`v_{mp}=\sqrt{\dfrac{2k_BT}{m}},\quad \bar v=\sqrt{\dfrac{8k_BT}{\pi m}},\quad v_{rms}=\sqrt{\dfrac{3k_BT}{m}}` },
    ],
    variables: [
      { sym: 'P', meaning: 'pressure', unit: 'Pa' }, { sym: 'V', meaning: 'volume', unit: 'm³' }, { sym: 'N', meaning: 'number of molecules' }, { sym: 'T', meaning: 'absolute temperature', unit: 'K' },
      { sym: 'k_B', meaning: 'Boltzmann constant', unit: '1.381×10⁻²³ J/K' }, { sym: 'm', meaning: 'mass of one molecule', unit: 'kg' },
    ],
    derivation: {
      title: 'Pressure from collisions with a wall',
      steps: [
        { text: 'A molecule with x-velocity vₓ rebounds elastically from a wall of a cubic box of side L. The momentum change per hit is 2mvₓ, and hits occur every 2L/vₓ seconds:', tex: T`F_1=\dfrac{2mv_x}{2L/v_x}=\dfrac{mv_x^2}{L}` },
        { text: 'Sum over all N molecules and divide by the wall area L². By isotropy ⟨vₓ²⟩ = ⟨v²⟩/3:', tex: T`P=\dfrac{N m\langle v_x^2\rangle}{L^3}=\dfrac13\dfrac{N}{V}m\langle v^2\rangle` },
        { text: 'Rewrite as P V = ⅔ N ⟨½mv²⟩. Experimentally PV = N k_B T, so ⟨½mv²⟩ = (3/2)k_BT, which defines temperature microscopically.' },
        { text: 'Note that the result does not depend on the molecule’s mass separately, only on its kinetic energy: at the same T, light molecules are faster (v_rms ∝ 1/√m).' },
      ],
    },
    advanced: [
      'The Maxwell–Boltzmann distribution follows from maximising entropy for a fixed mean energy: the probability of a state with energy E is ∝ e^{−E/k_BT} (the Boltzmann factor), and the v² factor counts the available directions in velocity space.',
      'Real gases deviate from PV = NkT when molecules attract each other and occupy a volume (van der Waals), and at low temperatures where quantum statistics matter (Bose–Einstein and Fermi–Dirac distributions).',
      'In this simulation, the molecules do not collide with each other (valid for dilute ideal gases in the sense that collisions merely maintain the distribution). The particles move in 2-D for display, with a hidden third velocity component so that the speed histogram is the true 3-D Maxwell–Boltzmann law.',
    ],
    assumptions: ['Point molecules, no interactions except elastic wall collisions', 'Classical statistics', 'Readouts for N₂ use the exact 3-D formulae; the pressure comparison is relative'],
    experiments: [
      { title: 'Heat it up', do: 'Raise T from 300 K to 900 K.', expect: 'The histogram peak moves right by √3 ≈ 1.7× and the pressure triples.', preset: 'Heat it to 900 K' },
      { title: 'Squeeze it', do: 'Reduce the volume to 40 %.', expect: 'Pressure rises 2.5× (Boyle’s law: P ∝ 1/V at constant T).', preset: 'Squeeze to 40 % volume' },
      { title: 'More gas', do: 'Double N.', expect: 'Pressure doubles: twice as many hits per second.', preset: 'Twice the gas' },
      { title: 'Check the prediction', do: 'Look at the green “P measured / predicted” value.', expect: 'It fluctuates around 1.0: the kinetic picture reproduces PV = NkT.' },
    ],
    applications: [
      { title: 'Engines and refrigeration', text: 'Heat engines cycle gases through changes in P, V, and T, and heat pumps run them in reverse.' },
      { title: 'Respiration and anaesthesia', text: 'Partial pressures drive gas exchange in the lungs; anaesthetic vaporisers and scuba decompression tables rest on gas laws and Henry’s law.' },
      { title: 'Atmospheres and escape', text: 'Light gases (H₂, He) have high enough speeds in the tail of the distribution to escape Earth’s gravity, while N₂ and O₂ stay.' },
      { title: 'Vacuum and cryogenic technology', text: 'The distribution explains why gas leaks, pumping speeds, and cooling methods behave as they do.' },
    ],
    misconceptions: [
      { myth: 'All molecules in a gas move at the same speed at a given temperature.', reality: 'There is a broad distribution; temperature describes only the average kinetic energy.' },
      { myth: 'Temperature measures how much heat a gas contains.', reality: 'Heat is energy in transfer. Temperature is a measure of the average energy per particle.' },
      { myth: 'Absolute zero means molecules stop completely.', reality: 'Classically yes, but quantum mechanics keeps a residual zero-point motion.' },
    ],
    history: 'Maxwell derived the speed distribution in 1860 and Boltzmann generalised it in 1868–72, founding statistical mechanics.',
    quiz: [
      { q: 'The temperature of an ideal gas is doubled (in kelvin). The rms speed becomes…', options: ['2×', '√2 ×', '4×', 'unchanged'], answer: 1, why: 'v_rms ∝ √T.' },
      { q: 'At the same temperature, which gas has the larger average speed?', options: ['Hydrogen', 'Oxygen', 'Same', 'Depends on pressure'], answer: 0, why: 'Same average kinetic energy, smaller mass means larger speed.' },
      { q: 'A gas is compressed to half the volume at constant temperature. Its pressure…', options: ['halves', 'doubles', 'is unchanged', 'quadruples'], answer: 1, why: 'Boyle’s law: PV constant at fixed T and N.' },
      { q: 'In the kinetic picture, pressure arises from…', options: ['molecules attracting each other', 'gravity on the gas', 'molecular collisions with the container walls', 'chemical reactions'], answer: 2, why: 'The average momentum transferred to the walls per second per area is the pressure.' },
    ],
    takeaway: 'Pressure and temperature are statistical averages of molecular motion, and the ideal gas law is what those averages obey.',
    related: ['lorentz', 'decay'],
  },
]
