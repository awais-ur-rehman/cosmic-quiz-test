import type { BreakdownEntry } from '@/types/quiz'

type Props = {
  breakdown: BreakdownEntry[]
}

export default function BreakdownTable({ breakdown }: Props) {
  return (
    <div className="border border-border">
      {breakdown.map((entry, i) => (
        <div
          key={`${i}-${entry.question}`}
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
  )
}
