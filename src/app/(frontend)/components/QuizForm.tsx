'use client'

import { useState, useTransition } from 'react'
import { submitQuiz } from '@/actions/quiz'
import type { QuizResult } from '@/actions/quiz'
import ResultView from './ResultView'

type Option = { label: string; score: number }
type Question = { id: string; question: string; options: Option[] }
type QuizResults = { min: number; max: number; label: string }[]

type Props = {
  quizId: string
  title: string
  questions: Question[]
  results: QuizResults
}

export default function QuizForm({ quizId, title, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, { label: string; score: number }>>({})
  const [notes, setNotes] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const allAnswered = questions.every((q) => answers[q.id] !== undefined)

  function retake() {
    setAnswers({})
    setNotes('')
    setEmail('')
    setResult(null)
    setError('')
  }

  function handleSubmit() {
    setError('')
    const selected = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      label: answers[q.id]!.label,
      score: answers[q.id]!.score,
    }))

    startTransition(async () => {
      try {
        const res = await submitQuiz(quizId, selected, notes, email)
        setResult(res)
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  if (result) {
    return (
      <div className="space-y-6">
        <ResultView
          score={result.score}
          label={result.label}
          breakdown={result.breakdown}
          notes={result.notes}
          onRetake={retake}
        />
        {result.email && (
          <p className="text-center text-sm text-gray-500">
            Results saved for {result.email}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">{title}</h1>

      {questions.map((q, index) => (
        <div key={q.id} className="rounded-xl border border-white/10 p-5 space-y-3">
          <p className="font-medium text-gray-200">
            <span className="text-indigo-400 mr-2">{index + 1}.</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const selected = answers[q.id]?.label === opt.label
              return (
                <button
                  key={opt.label}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border transition-colors ${
                    selected
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-white/10 text-gray-300 hover:border-indigo-500/50 hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-white/10 p-5 space-y-4">
        <div className="space-y-1">
          <label htmlFor="notes" className="block text-sm text-gray-400">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything on your mind..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm text-gray-400">
            Email (optional — saves your result)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button
        disabled={!allAnswered || isPending}
        onClick={handleSubmit}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Calculating...' : 'Submit quiz'}
      </button>
    </div>
  )
}
