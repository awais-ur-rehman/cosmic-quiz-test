'use client'

import { useState, useTransition } from 'react'
import { lookupByEmail } from '@/actions/quiz'
import type { QuizResult } from '@/actions/quiz'
import ResultView from './ResultView'

export default function LookupForm() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<QuizResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleLookup() {
    setNotFound(false)
    setResult(null)
    startTransition(async () => {
      const res = await lookupByEmail(email)
      if (res) {
        setResult(res)
      } else {
        setNotFound(true)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="lookup-email" className="block text-sm text-gray-400">
          Enter your email to retrieve past results
        </label>
        <div className="flex gap-2">
          <input
            id="lookup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && email && handleLookup()}
            placeholder="you@example.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            disabled={!email || isPending}
            onClick={handleLookup}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? '...' : 'Look up'}
          </button>
        </div>
      </div>

      {notFound && (
        <p className="text-gray-400 text-sm">No results found for that email.</p>
      )}

      {result && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Previous result</p>
          <ResultView
            score={result.score}
            label={result.label}
            breakdown={result.breakdown}
            notes={result.notes}
          />
        </div>
      )}
    </div>
  )
}
