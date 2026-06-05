type ResultRange = { min: number; max: number; label: string }

export function computeScore(selectedScores: number[]): number {
  return selectedScores.reduce((sum, s) => sum + s, 0)
}

export function matchResult(score: number, results: ResultRange[]): string {
  // Score-13 easter egg per brief
  if (score === 13) return 'You lucky fucker! You scored 13 exactly.'

  const match = results.find((r) => score >= r.min && score <= r.max)
  return match ? match.label : 'Unknown result'
}
