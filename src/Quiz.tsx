import { useState } from 'react'
import { Check, RotateCcw, Trophy, X } from 'lucide-react'
import type { Quiz as QuizType } from './data'

export default function Quiz({ quiz, best, onFinish }: { quiz: QuizType[]; best?: number; onFinish: (score: number, total: number) => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null))
  const done = answers.every((a) => a !== null)
  const score = answers.reduce<number>((s, a, i) => s + (a === quiz[i].answer ? 1 : 0), 0)
  const pick = (qi: number, oi: number) => {
    if (answers[qi] !== null) return
    const next = answers.slice(); next[qi] = oi; setAnswers(next)
    if (next.every((a) => a !== null)) onFinish(next.reduce<number>((s, a, i) => s + (a === quiz[i].answer ? 1 : 0), 0), quiz.length)
  }
  return (
    <div className="quiz">
      {quiz.map((q, qi) => {
        const a = answers[qi]
        return (
          <div className="quiz-q" key={qi}>
            <div className="quiz-num">Question {qi + 1} of {quiz.length}</div>
            <h4>{q.q}</h4>
            <div className="quiz-options" role="radiogroup" aria-label={q.q}>
              {q.options.map((o, oi) => {
                const state = a === null ? '' : oi === q.answer ? 'correct' : oi === a ? 'wrong' : 'dim'
                return (
                  <button key={oi} role="radio" aria-checked={a === oi} className={`quiz-opt ${state}`} onClick={() => pick(qi, oi)} disabled={a !== null}>
                    <span className="quiz-letter">{String.fromCharCode(65 + oi)}</span><span>{o}</span>
                    {state === 'correct' && <Check size={16} className="quiz-icon" />}{state === 'wrong' && <X size={16} className="quiz-icon" />}
                  </button>
                )
              })}
            </div>
            {a !== null && <p className={`quiz-why ${a === q.answer ? 'ok' : 'no'}`}><strong>{a === q.answer ? 'Correct. ' : 'Not quite. '}</strong>{q.why}</p>}
          </div>
        )
      })}
      {done && (
        <div className="quiz-result">
          <Trophy size={20} /><div><strong>{score} / {quiz.length}</strong><span>{score === quiz.length ? ' Perfect. You have the idea.' : score >= quiz.length - 1 ? ' Nearly there. Re-read the explanation and try the lab again.' : ' Worth another pass through the lab and derivation.'}{best !== undefined ? `  Best so far: ${Math.max(best, score)} / ${quiz.length}` : ''}</span></div>
          <button className="secondary-btn" onClick={() => setAnswers(quiz.map(() => null))}><RotateCcw size={14} /> Try again</button>
        </div>
      )}
    </div>
  )
}
