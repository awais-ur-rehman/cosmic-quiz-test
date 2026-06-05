import type { BreakdownEntry } from '@/actions/quiz'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  score: number
  label: string
  breakdown: BreakdownEntry[]
  notes: string
  email: string
  saveState: SaveState
  isSaving: boolean
  onNotesChange: (v: string) => void
  onEmailChange: (v: string) => void
  onSave: () => void
  onRetake: () => void
}

export default function ResultView({
  score,
  label,
  breakdown,
  notes,
  email,
  saveState,
  isSaving,
  onNotesChange,
  onEmailChange,
  onSave,
  onRetake,
}: Props) {
  const saved = saveState === 'saved'

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted mb-4">
          Your result
        </p>
        <div className="flex items-end gap-4">
          <span data-testid="result-score" className="text-[72px] font-bold leading-none text-accent">
            {score}
          </span>
          <span className="text-xs text-muted mb-3">out of 30</span>
        </div>
        <p data-testid="result-label" className="text-xl font-semibold text-text mt-3">
          {label}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted mb-3">
          Score breakdown
        </p>
        <div className="border border-border">
          {breakdown.map((entry, i) => (
            <div
              key={i}
              data-testid="breakdown-row"
              className={`flex items-start justify-between gap-4 px-4 py-3 text-sm ${
                i < breakdown.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span className="text-muted flex-1 leading-snug">{entry.question}</span>
              <span className="text-text font-medium shrink-0">{entry.selectedLabel}</span>
              <span className="text-accent font-semibold font-mono w-4 text-right shrink-0">
                {entry.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border p-6 space-y-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          Save your results
        </p>

        <div className="space-y-3">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text mb-1">
              Notes <span className="text-muted font-normal">— optional</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              disabled={saved}
              placeholder="Anything on your mind..."
              className="w-full border border-border px-3 py-2 text-sm text-text placeholder-[#c0bdb6] focus:outline-none focus:border-text resize-none disabled:opacity-50 disabled:bg-surface"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
              Email <span className="text-muted font-normal">— required to save</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={saved}
              placeholder="you@example.com"
              className="w-full border border-border px-3 py-2 text-sm text-text placeholder-[#c0bdb6] focus:outline-none focus:border-text disabled:opacity-50 disabled:bg-surface"
            />
          </div>
        </div>

        {saved ? (
          <p data-testid="save-confirmation" className="text-sm text-green-700 font-medium">
            Saved. You can retrieve your result at any time from Past results.
          </p>
        ) : (
          <button
            data-testid="save-button"
            disabled={!email || isSaving}
            onClick={onSave}
            className="w-full py-3 bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save result'}
          </button>
        )}

        {saveState === 'error' && (
          <p className="text-sm text-red-600">Failed to save. Please try again.</p>
        )}
      </div>

      <button
        onClick={onRetake}
        className="w-full py-3 border border-border text-sm font-medium text-muted hover:border-text hover:text-text transition-colors"
      >
        Take quiz again
      </button>
    </div>
  )
}
