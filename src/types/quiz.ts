export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export type BreakdownEntry = {
  question: string
  selectedLabel: string
  score: number
}

export type QuizResult = {
  score: number
  label: string
  breakdown: BreakdownEntry[]
  notes?: string
  email?: string
}

export type SelectedOption = {
  questionId: string
  label: string
  score: number
  question: string
}
