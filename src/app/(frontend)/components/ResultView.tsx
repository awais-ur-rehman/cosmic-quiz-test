import type { BreakdownEntry } from '@/actions/quiz'

type Props = {
  score: number
  label: string
  breakdown: BreakdownEntry[]
  notes?: string
  onRetake?: () => void
}

export default function ResultView({ score, label, breakdown, notes, onRetake }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-5xl font-bold">{score}</p>
        <p className="text-sm text-gray-400 uppercase tracking-widest">Total score</p>
        <p className="text-xl font-semibold text-indigo-300 mt-2">{label}</p>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-left">
              <th className="px-4 py-2 font-medium">Question</th>
              <th className="px-4 py-2 font-medium">Your answer</th>
              <th className="px-4 py-2 font-medium text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((entry, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="px-4 py-2 text-gray-300">{entry.question}</td>
                <td className="px-4 py-2 text-white">{entry.selectedLabel}</td>
                <td className="px-4 py-2 text-right text-indigo-400 font-mono">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notes && (
        <div className="rounded-xl border border-white/10 p-4 bg-white/5">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Notes</p>
          <p className="text-gray-200 whitespace-pre-wrap">{notes}</p>
        </div>
      )}

      {onRetake && (
        <button
          onClick={onRetake}
          className="w-full py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/5 transition-colors"
        >
          Take quiz again
        </button>
      )}
    </div>
  )
}
