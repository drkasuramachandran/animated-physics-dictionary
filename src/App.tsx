import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Atom, Bookmark, BookOpen, Check, ChevronDown, Compass, FlaskConical, GraduationCap, Lightbulb, Link2,
  Menu, Moon, Printer, Search, Sigma, Sparkles, Sun, TriangleAlert, Trophy, Library, X, Wrench, ListChecks,
} from 'lucide-react'
import { categories, paths, topics, type Topic } from './data'
import { glossary } from './glossary'
import SimPlayer from './SimPlayer'
import Quiz from './Quiz'
import { Tex } from './Tex'
import { accentVar } from './util'

/* ───────── small helpers ───────── */
function useStored<T>(key: string, init: T): [T, (f: (old: T) => T) => void] {
  const [v, setV] = useState<T>(() => { try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : init } catch { return init } })
  const update = (f: (old: T) => T) => setV((old) => { const n = f(old); try { localStorage.setItem(key, JSON.stringify(n)) } catch { /* ignore */ } return n })
  return [v, update]
}
type Route = { page: 'home' | 'topic' | 'glossary' | 'formulas' | 'saved'; id?: string }
const parseRoute = (): Route => {
  const [a, b] = location.hash.replace(/^#\/?/, '').split('/')
  if (a === 'topic' && b) return { page: 'topic', id: decodeURIComponent(b) }
  if (a === 'glossary') return { page: 'glossary', id: b ? decodeURIComponent(b) : undefined }
  if (a === 'formulas' || a === 'saved') return { page: a }
  return { page: 'home' }
}
const go = (path: string) => { location.hash = '#/' + path; window.scrollTo({ top: 0 }) }
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const byId = (id: string) => topics.find((t) => t.id === id)

/* ───────── cards ───────── */
function TopicCard({ t, i, done, onOpen }: { t: Topic; i: number; done: boolean; onOpen: () => void }) {
  return (
    <button className="concept-card" onClick={onOpen} style={accentVar(t.accent)}>
      <div className="card-visual"><div className="visual-orbit" /><div className="visual-symbol">{t.glyph}</div><span className="card-index">{String(i + 1).padStart(2, '0')}</span></div>
      <div className="card-body">
        <div className="card-meta"><span>{t.category}</span><span className="meta-dot" />{t.level}</div>
        <h3>{t.title}</h3><p>{t.description}</p>
        <div className="card-footer"><span><BookOpen size={14} />{t.duration}</span><span className="card-learn">{done ? <><Check size={14} /> Explored</> : 'Explore'} <ArrowRight size={14} /></span></div>
      </div>
    </button>
  )
}

/* ───────── pages ───────── */
function Home({ query, setQuery, completed }: { query: string; setQuery: (q: string) => void; completed: string[] }) {
  const [cat, setCat] = useState('All concepts')
  const shown = topics.filter((t) => (cat === 'All concepts' || t.category === cat) && `${t.title} ${t.description} ${t.category} ${t.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="sparkle-dot" /> PHYSICS, MADE VISIBLE</div>
          <h1>Big ideas.<br /><span>Beautifully in motion.</span></h1>
          <p>Every concept pairs a live, physically accurate simulation with intuition, equations, derivations, applications, and a quiz. Change the variables, watch the physics respond.</p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => document.getElementById('concept-library')?.scrollIntoView({ behavior: 'smooth' })}>Explore the dictionary <ArrowRight size={16} /></button>
            <button className="secondary-btn" onClick={() => go('glossary')}><Library size={15} /> Glossary</button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbital orbital-one" /><div className="orbital orbital-two" /><div className="orbital orbital-three" />
          <div className="orb-core"><Atom size={54} /></div>
          <div className="orbit-particle particle-one" /><div className="orbit-particle particle-two" /><div className="orbit-particle particle-three" />
        </div>
        <div className="hero-stats">
          <div><strong>{topics.length}</strong><span>LIVE SIMULATIONS</span></div>
          <div><strong>{topics.reduce((n, t) => n + t.equations.length, 0)}</strong><span>KEY EQUATIONS</span></div>
          <div><strong>{glossary.length}</strong><span>GLOSSARY TERMS</span></div>
          <div><strong>{topics.reduce((n, t) => n + t.quiz.length, 0)}</strong><span>QUIZ QUESTIONS</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><div><div className="section-eyebrow">GUIDED PATHS</div><h2>Where should I start?</h2><p>Short sequences that build on each other.</p></div></div>
        <div className="paths">
          {paths.map((p) => (
            <div className="path-card" key={p.title}>
              <h3>{p.title}</h3><p>{p.blurb}</p>
              <ol>{p.ids.map((id) => <li key={id}><button onClick={() => go('topic/' + id)}>{completed.includes(id) ? <Check size={13} /> : <span className="path-dot" />}{byId(id)?.title}</button></li>)}</ol>
            </div>
          ))}
        </div>
      </section>

      <section id="concept-library" className="section">
        <div className="section-heading"><div><div className="section-eyebrow">THE KNOWLEDGE LIBRARY</div><h2>Find your next “aha!” moment</h2><p>Start with a question. Leave with a deeper understanding.</p></div><div className="library-count"><BookOpen size={16} /><span>{shown.length} concepts</span></div></div>
        <div className="filter-row">
          <div className="filter-pills">{categories.map((c) => <button key={c.name} className={`filter-pill ${cat === c.name ? 'chosen' : ''}`} onClick={() => setCat(c.name)}>{c.name}<small>{c.count}</small></button>)}</div>
          {(query || cat !== 'All concepts') && <button className="sort-button" onClick={() => { setQuery(''); setCat('All concepts') }}>Reset filters</button>}
        </div>
        <div className="concept-grid">{shown.map((t, i) => <TopicCard key={t.id} t={t} i={topics.indexOf(t)} done={completed.includes(t.id)} onOpen={() => go('topic/' + t.id)} />)}</div>
        {!shown.length && <div className="empty-state"><Search size={25} /><h3>No matching concepts</h3><p>Try another search term or reset the filters.</p></div>}
      </section>
    </>
  )
}

function Section({ id, icon, eyebrow, title, children }: { id: string; icon: React.ReactNode; eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="topic-section" id={`sec-${id}`}><div className="sec-head"><span className="sec-icon">{icon}</span><div><div className="section-eyebrow">{eyebrow}</div><h2>{title}</h2></div></div>{children}</section>
}

function TopicPage({ topic, bookmarked, toggleBookmark, done, markDone, best, setBest }: {
  topic: Topic; bookmarked: boolean; toggleBookmark: () => void; done: boolean; markDone: () => void; best?: number; setBest: (s: number) => void
}) {
  const [preset, setPreset] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const i = topics.indexOf(topic)
  const prev = topics[(i - 1 + topics.length) % topics.length], next = topics[(i + 1) % topics.length]
  const terms = glossary.filter((g) => g.topics.includes(topic.id))
  const nav = [['intuition', 'Intuition'], ['lab', 'Lab'], ['math', 'Mathematics'], ['deeper', 'Go deeper'], ['apply', 'Applications'], ['myths', 'Misconceptions'], ['quiz', 'Test yourself']]
  const jump = (id: string) => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const copy = async () => { try { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* ignore */ } }
  return (
    <article className="topic" style={accentVar(topic.accent)}>
      <button className="back-link" onClick={() => go('')}><ArrowLeft size={15} /> All concepts</button>
      <header className="topic-head">
        <div className="lesson-icon">{topic.glyph}</div>
        <div className="topic-title">
          <div className="lesson-meta">{topic.category} <span>·</span> {topic.level} <span>·</span> {topic.duration}</div>
          <h1>{topic.title}</h1><p>{topic.description}</p>
        </div>
        <div className="topic-actions">
          <button className={`icon-btn bordered ${bookmarked ? 'on' : ''}`} onClick={toggleBookmark} aria-label={bookmarked ? 'Remove from saved' : 'Save concept'} title="Save"><Bookmark size={17} fill={bookmarked ? 'currentColor' : 'none'} /></button>
          <button className="icon-btn bordered" onClick={copy} aria-label="Copy link" title="Copy link to this concept">{copied ? <Check size={17} /> : <Link2 size={17} />}</button>
          <button className="icon-btn bordered no-print" onClick={() => window.print()} aria-label="Print" title="Print or save as PDF"><Printer size={17} /></button>
        </div>
      </header>
      <div className="question-box"><span className="question-mark"><Sparkles size={17} /></span><div><small>START WITH A QUESTION</small><h2>{topic.question}</h2></div></div>
      <nav className="topic-nav no-print" aria-label="On this page">{nav.map(([id, label]) => <button key={id} onClick={() => jump(id)}>{label}</button>)}</nav>

      <Section id="intuition" icon={<Lightbulb size={18} />} eyebrow="BUILD THE INTUITION" title="What is going on?">
        <div className="prose">{topic.intuition.map((p, k) => <p key={k}>{p}</p>)}</div>
      </Section>

      <Section id="lab" icon={<FlaskConical size={18} />} eyebrow="LEARN BY DOING" title="Interactive lab">
        <SimPlayer key={topic.id} topicId={topic.id} accent={topic.accent} preset={preset} onPresetUsed={() => setPreset(null)} />
        <h3 className="sub">Guided experiments</h3>
        <div className="experiments">
          {topic.experiments.map((e, k) => (
            <div className="exp-card" key={k}>
              <div className="exp-num">{k + 1}</div>
              <div><h4>{e.title}</h4><p><b>Do:</b> {e.do}</p><p><b>Expect:</b> {e.expect}</p>
                {e.preset && <button className="chip" onClick={() => { setPreset(e.preset!); jump('lab') }}><FlaskConical size={12} /> Set up in the lab</button>}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="math" icon={<Sigma size={18} />} eyebrow="THE PHYSICS, PRECISELY" title="Equations and derivation">
        <div className="eq-list">{topic.equations.map((e, k) => <div className="eq-card" key={k}><div className="eq-label">{e.label}</div><div className="eq-body"><Tex tex={e.tex} block /></div>{e.note && <div className="eq-note">{e.note}</div>}</div>)}</div>
        <h3 className="sub">Symbols</h3>
        <div className="vars">{topic.variables.map((v, k) => <div key={k}><span className="var-sym"><Tex tex={v.sym} /></span><span>{v.meaning}{v.unit && <em> ({v.unit})</em>}</span></div>)}</div>
        <details className="derivation" open>
          <summary><span><Sigma size={16} /> {topic.derivation.title}</span><ChevronDown size={18} /></summary>
          <ol>{topic.derivation.steps.map((s, k) => <li key={k}><p>{s.text}</p>{s.tex && <Tex tex={s.tex} block />}</li>)}</ol>
        </details>
        <div className="assumptions"><div className="adv-label"><Wrench size={14} /> MODEL ASSUMPTIONS</div><ul>{topic.assumptions.map((a, k) => <li key={k}>{a}</li>)}</ul></div>
      </Section>

      <Section id="deeper" icon={<GraduationCap size={18} />} eyebrow="FOR THE CURIOUS" title="Go a little deeper">
        <div className="prose advanced">{topic.advanced.map((p, k) => <p key={k}>{p}</p>)}</div>
      </Section>

      <Section id="apply" icon={<Compass size={18} />} eyebrow="THE REAL WORLD" title="Where this physics is used">
        <div className="apps">{topic.applications.map((a, k) => <div className="app-card" key={k}><h4>{a.title}</h4><p>{a.text}</p></div>)}</div>
        {topic.history && <p className="history"><b>History.</b> {topic.history}</p>}
      </Section>

      <Section id="myths" icon={<TriangleAlert size={18} />} eyebrow="COMMON TRAPS" title="Misconceptions, corrected">
        <div className="myths">{topic.misconceptions.map((m, k) => <div className="myth" key={k}><div className="myth-x"><X size={14} /><span>{m.myth}</span></div><div className="myth-ok"><Check size={14} /><span>{m.reality}</span></div></div>)}</div>
      </Section>

      <Section id="quiz" icon={<ListChecks size={18} />} eyebrow="CHECK YOUR UNDERSTANDING" title="Test yourself">
        <Quiz key={topic.id} quiz={topic.quiz} best={best} onFinish={(s) => { setBest(s); markDone() }} />
      </Section>

      <div className="takeaway"><div className="takeaway-icon"><Check size={18} /></div><div><small>THE BIG TAKEAWAY</small><p>{topic.takeaway}</p></div></div>

      {terms.length > 0 && <div className="key-terms"><div className="section-eyebrow">KEY TERMS</div><div className="terms-row">{terms.map((g) => <button className="chip" key={g.term} onClick={() => go('glossary/' + encodeURIComponent(g.term))} title={g.def}>{g.term}</button>)}</div></div>}

      <div className="lesson-bottom no-print">
        <button className={`complete-btn ${done ? 'is-complete' : ''}`} onClick={markDone}>{done ? <><Check size={15} /> Concept explored</> : <>Mark as explored <ArrowRight size={15} /></>}</button>
      </div>
      {topic.related.length > 0 && <div className="related no-print"><div className="section-eyebrow">CONTINUE EXPLORING</div><div className="related-row">{topic.related.map((id) => { const r = byId(id); return r ? <button key={id} className="related-card" onClick={() => go('topic/' + id)} style={accentVar(r.accent)}><span className="related-glyph">{r.glyph}</span><span><strong>{r.title}</strong><small>{r.category}</small></span><ArrowRight size={15} /></button> : null })}</div></div>}
      <div className="pager no-print"><button onClick={() => go('topic/' + prev.id)}><ArrowLeft size={15} /><span><small>Previous</small>{prev.title}</span></button><button onClick={() => go('topic/' + next.id)}><span><small>Next</small>{next.title}</span><ArrowRight size={15} /></button></div>
    </article>
  )
}

function GlossaryPage({ focus }: { focus?: string }) {
  const [q, setQ] = useState('')
  const list = useMemo(() => glossary.filter((g) => `${g.term} ${g.def} ${g.symbol ?? ''}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.term.localeCompare(b.term)), [q])
  const letters = Array.from(new Set(list.map((g) => g.term[0].toUpperCase())))
  useEffect(() => { if (focus) setTimeout(() => document.getElementById('term-' + slug(focus))?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60) }, [focus])
  return (
    <section className="section page-plain">
      <div className="section-heading"><div><div className="section-eyebrow">THE DICTIONARY</div><h2>Physics glossary</h2><p>{glossary.length} terms, each linked to the concept where you can see it in action.</p></div></div>
      <div className="inline-search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter terms or symbols…" aria-label="Filter glossary" /></div>
      <div className="letters">{letters.map((l) => <button key={l} onClick={() => document.getElementById('letter-' + l)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{l}</button>)}</div>
      <div className="gloss">
        {letters.map((l) => (
          <div key={l}><h3 id={'letter-' + l} className="gloss-letter">{l}</h3>
            {list.filter((g) => g.term[0].toUpperCase() === l).map((g) => (
              <div key={g.term} id={'term-' + slug(g.term)} className={`gloss-item ${focus && slug(focus) === slug(g.term) ? 'focus' : ''}`}>
                <div className="gloss-term"><strong>{g.term}</strong>{g.symbol && <code>{g.symbol}</code>}{g.unit && <em>{g.unit}</em>}</div>
                <p>{g.def}</p>
                <div className="gloss-links">{g.topics.map((id) => <button key={id} className="chip" onClick={() => go('topic/' + id)}>{byId(id)?.title}</button>)}</div>
              </div>
            ))}
          </div>
        ))}
        {!list.length && <div className="empty-state"><h3>No terms match “{q}”.</h3></div>}
      </div>
    </section>
  )
}

function FormulaPage() {
  const [q, setQ] = useState('')
  const groups = categories.slice(1).map((c) => ({ c, ts: topics.filter((t) => t.category === c.name) })).filter((g) => g.ts.length)
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase())
  return (
    <section className="section page-plain">
      <div className="section-heading"><div><div className="section-eyebrow">QUICK REFERENCE</div><h2>Formula sheet</h2><p>Every key equation in the dictionary, with the concept it belongs to. Print this page to keep a copy.</p></div><button className="secondary-btn no-print" onClick={() => window.print()}><Printer size={14} /> Print</button></div>
      <div className="inline-search no-print"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, e.g. “period”…" aria-label="Filter equations" /></div>
      {groups.map(({ c, ts }) => (
        <div key={c.name} className="formula-group"><h3>{c.name}</h3>
          <div className="formula-grid">
            {ts.flatMap((t) => t.equations.filter((e) => !q || match(e.label) || match(t.title) || match(e.tex)).map((e, k) => (
              <div className="formula-card" key={t.id + k} style={accentVar(t.accent)}>
                <div className="eq-label">{e.label}</div><Tex tex={e.tex} block />
                <button className="formula-link" onClick={() => go('topic/' + t.id)}>{t.title} <ArrowRight size={12} /></button>
              </div>
            )))}
          </div>
        </div>
      ))}
    </section>
  )
}

/* ───────── app shell ───────── */
export default function App() {
  const [route, setRoute] = useState<Route>(parseRoute)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [bookmarks, setBookmarks] = useStored<string[]>('physics-bookmarks', [])
  const [completed, setCompleted] = useStored<string[]>('physics-completed', [])
  const [scores, setScores] = useStored<Record<string, number>>('physics-quiz-best', {})
  const [theme, setTheme] = useStored<'dark' | 'light'>('physics-theme', 'dark')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { const h = () => { setRoute(parseRoute()); setMobileNav(false); setSearchOpen(false) }; window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h) }, [])
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const typing = /input|textarea/i.test((e.target as HTMLElement)?.tagName ?? '')
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) { e.preventDefault(); searchRef.current?.focus(); setSearchOpen(true) }
      if (e.key === 'Escape') { setSearchOpen(false); searchRef.current?.blur() }
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])

  const topic = route.page === 'topic' ? byId(route.id!) : undefined
  useEffect(() => { document.title = topic ? `${topic.title} · Physics in Motion` : 'Physics in Motion — Animated Physics Dictionary' }, [topic])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase(); if (!q) return []
    const ts = topics.filter((t) => `${t.title} ${t.description} ${t.category} ${t.tags.join(' ')}`.toLowerCase().includes(q)).map((t) => ({ kind: 'topic' as const, t }))
    const gs = glossary.filter((g) => `${g.term} ${g.def}`.toLowerCase().includes(q)).slice(0, 5).map((g) => ({ kind: 'term' as const, g }))
    return [...ts, ...gs].slice(0, 8)
  }, [query])
  const open = (r: (typeof results)[number]) => { setSearchOpen(false); setQuery(''); go(r.kind === 'topic' ? 'topic/' + r.t.id : 'glossary/' + encodeURIComponent(r.g.term)) }
  const toggle = (id: string) => setBookmarks((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]))
  const markDone = (id: string) => setCompleted((o) => (o.includes(id) ? o : [...o, id]))
  const progress = Math.round((completed.filter((id) => byId(id)).length / topics.length) * 100)
  const crumb = route.page === 'topic' ? topic?.title ?? 'Not found' : { home: 'Explore', glossary: 'Glossary', formulas: 'Formula sheet', saved: 'Saved concepts' }[route.page]

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Atom size={23} /></div><div><strong>physics<span>in motion</span></strong><small>ANIMATED DICTIONARY</small></div><button className="mobile-close icon-btn" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button></div>
        <div className="side-label">LEARNING SPACE</div>
        <button className={`nav-item ${route.page === 'home' ? 'active' : ''}`} onClick={() => go('')}><Compass size={17} /> Explore concepts</button>
        <button className={`nav-item ${route.page === 'glossary' ? 'active' : ''}`} onClick={() => go('glossary')}><Library size={17} /> Glossary <span className="nav-count">{glossary.length}</span></button>
        <button className={`nav-item ${route.page === 'formulas' ? 'active' : ''}`} onClick={() => go('formulas')}><Sigma size={17} /> Formula sheet</button>
        <button className={`nav-item ${route.page === 'saved' ? 'active' : ''}`} onClick={() => go('saved')}><Bookmark size={17} /> Saved <span className="nav-count">{bookmarks.length}</span></button>
        <div className="side-label category-label">CONCEPTS</div>
        <div className="category-list">
          {categories.slice(1).map((c) => (
            <div key={c.name}>
              <div className="cat-name"><span className="category-glyph">{c.icon}</span>{c.name}<small>{c.count}</small></div>
              {topics.filter((t) => t.category === c.name).map((t) => <button key={t.id} className={`topic-link ${topic?.id === t.id ? 'selected' : ''}`} onClick={() => go('topic/' + t.id)}>{completed.includes(t.id) && <Check size={11} />}{t.title}</button>)}
            </div>
          ))}
        </div>
        <div className="sidebar-spacer" />
        <div className="progress-card"><div className="progress-top"><span>YOUR EXPLORATION</span><Trophy size={15} /></div><div className="progress-number">{completed.filter((id) => byId(id)).length}<span> / {topics.length} concepts</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p>{progress === 100 ? 'You explored every concept. Excellent!' : 'Finish a quiz or mark a concept explored to track progress.'}</p></div>
      </aside>

      <main className="main-area" id="main">
        <header className="topbar">
          <button className="mobile-menu icon-btn" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="breadcrumb">Learning space <span>/</span> <strong>{crumb}</strong></div>
          <div className="top-actions">
            <div className="search-wrap">
              <Search size={17} />
              <input ref={searchRef} value={query} onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }} onFocus={() => setSearchOpen(true)} onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) open(results[0]) }} placeholder="Search concepts, terms…" aria-label="Search physics concepts and terms" />
              <kbd>Ctrl K</kbd>
              {searchOpen && query && (
                <div className="search-results">
                  {results.map((r) => r.kind === 'topic'
                    ? <button key={'t' + r.t.id} onClick={() => open(r)}><span className="search-result-icon"><Atom size={16} /></span><span><strong>{r.t.title}</strong><small>Concept · {r.t.category}</small></span><ArrowRight size={14} /></button>
                    : <button key={'g' + r.g.term} onClick={() => open(r)}><span className="search-result-icon"><Library size={16} /></span><span><strong>{r.g.term}</strong><small>Glossary · {r.g.def.slice(0, 54)}…</small></span><ArrowRight size={14} /></button>)}
                  {!results.length && <p>No matches. Try “wave”, “energy”, or “magnet”.</p>}
                </div>
              )}
            </div>
            <button className="icon-btn bordered" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} aria-label="Toggle light and dark theme" title="Toggle theme">{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
          </div>
        </header>

        <div className="content" onClick={() => setSearchOpen(false)}>
          {route.page === 'home' && <Home query={query} setQuery={setQuery} completed={completed} />}
          {route.page === 'glossary' && <GlossaryPage focus={route.id} />}
          {route.page === 'formulas' && <FormulaPage />}
          {route.page === 'saved' && (
            <section className="section page-plain">
              <div className="section-heading"><div><div className="section-eyebrow">YOUR COLLECTION</div><h2>Saved concepts</h2><p>Bookmark a concept with the ribbon icon on its page.</p></div></div>
              <div className="concept-grid">{topics.filter((t) => bookmarks.includes(t.id)).map((t) => <TopicCard key={t.id} t={t} i={topics.indexOf(t)} done={completed.includes(t.id)} onOpen={() => go('topic/' + t.id)} />)}</div>
              {!bookmarks.length && <div className="empty-state"><Bookmark size={25} /><h3>Nothing saved yet</h3><p>Open a concept and tap the bookmark icon.</p></div>}
            </section>
          )}
          {route.page === 'topic' && (topic
            ? <TopicPage key={topic.id} topic={topic} bookmarked={bookmarks.includes(topic.id)} toggleBookmark={() => toggle(topic.id)} done={completed.includes(topic.id)} markDone={() => markDone(topic.id)} best={scores[topic.id]} setBest={(s) => setScores((o) => ({ ...o, [topic.id]: Math.max(o[topic.id] ?? 0, s) }))} />
            : <div className="empty-state"><h3>Concept not found</h3><button className="secondary-btn" onClick={() => go('')}>Back to all concepts</button></div>)}
          <footer className="footer"><div className="footer-brand"><Atom size={18} /><strong>physics in motion</strong></div><span>Simulations are idealised teaching models. Assumptions are listed on every concept.</span><a href="https://drkasuramachandran.com/" target="_blank" rel="noreferrer">Educational project</a></footer>
        </div>
      </main>
      {mobileNav && <button className="mobile-overlay" onClick={() => setMobileNav(false)} aria-label="Close navigation overlay" />}
    </div>
  )
}
