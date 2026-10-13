import type { Sim } from './kit'
import { projectile, pendulum, orbits } from './mechanics'
import { interference, doppler, snell } from './waves'
import { induction, lorentz, gas } from './fields'
import { quantumBox, doubleSlit, decay } from './modern'

/** Registry: topic id → simulation. Add a new entry here (and a topic in /content) to extend the dictionary. */
export const sims: Record<string, Sim> = {
  projectile, pendulum, orbits, interference, doppler, snell, induction, lorentz, gas, quantum: quantumBox, doubleslit: doubleSlit, decay,
}
