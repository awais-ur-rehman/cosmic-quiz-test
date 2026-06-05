'use client'

import { useState, useTransition } from 'react'
import { lookupByEmail } from '@/actions/quiz'
import type { QuizResult } from '@/types/quiz'
import BreakdownTable from '../BreakdownTable'

export default function LookupForm() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<QuizResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isPending, startTransition] = useTransition()

  const emailError =
    email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address.' : ''

  function handleLookup() {
    if (!email || emailError) return
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
    <div className="space-y-8">
      <div>
        <label htmlFor="lookup-email" className="block text-sm font-medium text-text mb-2">
          Email address
        </label>
        <div className="flex gap-2">
          <input
            id="lookup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="you@example.com"
            className={`flex-1 border px-4 py-3 text-sm text-text placeholder-[#c0bdb6] focus:outline-none ${
              emailError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-text'
            }`}
          />
          <button
            disabled={!email || !!emailError || isPending}
            onClick={handleLookup}
            className="px-6 py-3 bg-text text-white text-sm font-medium hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? '...' : 'Look up'}
          </button>
          {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
        </div>
      </div>

      {notFound && (
        <p data-testid="not-found-message" className="text-sm text-muted">
          No results found for that email address.
        </p>
      )}

      {result && (
        <div className="space-y-6 border-t border-border pt-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted mb-4">
              Your previous result
            </p>
            <div className="flex items-end gap-4 mb-2">
              <span data-testid="lookup-result-score" className="text-[60px] font-bold leading-none text-accent">
                {result.score}
              </span>
              <span className="text-xs text-muted mb-2">out of 30</span>
            </div>
            <p className="text-lg font-semibold text-text">{result.label}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
              Score breakdown
            </p>
            <BreakdownTable breakdown={result.breakdown} />
          </div>

          {result.notes && (
            <div className="border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-widest text-muted mb-2">
                Notes
              </p>
              <p className="text-sm text-text whitespace-pre-wrap">{result.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
