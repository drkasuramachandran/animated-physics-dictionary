import { mechanics } from './content/mechanics'
import { wavesOptics } from './content/waves'
import { electromagnetism, thermo } from './content/fields'
import { modern } from './content/modern'

export type Equation = { label: string; tex: string; note?: string }
export type Variable = { sym: string; meaning: string; unit?: string }
export type Step = { text: string; tex?: string }
export type Quiz = { q: string; options: string[]; answer: number; why: string }

export type Topic = {
  id: string
  title: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  accent: string
  glyph: string
  tags: string[]
  description: string
  question: string
  /** Plain-language intuition, one paragraph per entry. */
  intuition: string[]
  equations: Equation[]
  variables: Variable[]
  derivation: { title: string; steps: Step[] }
  advanced: string[]
  assumptions: string[]
  experiments: { title: string; do: string; expect: string; preset?: string }[]
  applications: { title: string; text: string }[]
  misconceptions: { myth: string; reality: string }[]
  history?: string
  quiz: Quiz[]
  takeaway: string
  related: string[]
}

export const topics: Topic[] = [...mechanics, ...wavesOptics, ...electromagnetism, ...thermo, ...modern]

const order = ['Mechanics', 'Waves & optics', 'Electromagnetism', 'Thermodynamics', 'Modern physics']
const icons: Record<string, string> = { Mechanics: '◉', 'Waves & optics': '〰', Electromagnetism: '⌁', Thermodynamics: '♨', 'Modern physics': '⚛' }

export const categories = [
  { name: 'All concepts', icon: '✦', count: topics.length },
  ...order.filter((c) => topics.some((t) => t.category === c)).map((name) => ({ name, icon: icons[name], count: topics.filter((t) => t.category === name).length })),
]

export const paths: { title: string; blurb: string; ids: string[] }[] = [
  { title: 'From throws to planets', blurb: 'Motion under gravity, from a ball to a world.', ids: ['projectile', 'pendulum', 'orbits'] },
  { title: 'Waves to light', blurb: 'Superposition, motion, and what happens at a boundary.', ids: ['interference', 'doppler', 'snell'] },
  { title: 'Fields and charges', blurb: 'How changing and crossing fields move charge.', ids: ['induction', 'lorentz'] },
  { title: 'Welcome to the quantum', blurb: 'Randomness, waves, and the laws of large numbers.', ids: ['decay', 'quantum', 'doubleslit'] },
]
