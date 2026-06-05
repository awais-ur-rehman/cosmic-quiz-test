'use client'

import { useState, useTransition } from 'react'
import { submitQuiz, saveResult } from '@/actions/quiz'
import type { QuizResult, SaveState, SelectedOption } from '@/types/quiz'
import ResultView from '../ResultView'

type Option = { label: string; score: number }
type Question = { id: string; question: string; options: Option[] }

type Props = {
  quizId: string
  title: string
  questions: Question[]
}

export default function QuizForm({ quizId, title, questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { label: string; score: number }>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [selected, setSelected] = useState<SelectedOption[]>([])
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, startSubmitTransition] = useTransition()

  const [notes, setNotes] = useState('')
  const [email, setEmail] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isSaving, startSaveTransition] = useTransition()

  const current = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const currentAnswer = answers[current?.id]
  const answeredCount = Object.keys(answers).length
  const progressPct = (answeredCount / questions.length) * 100

  function selectOption(opt: Option) {
    setAnswers((prev) => ({ ...prev, [current.id]: opt }))
  }

  function handleNext() {
    if (!currentAnswer) return
    if (isLast) {
      handleSubmit()
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  function handleSubmit() {
    setSubmitError('')
    const opts: SelectedOption[] = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      label: answers[q.id]!.label,
      score: answers[q.id]!.score,
    }))

    startSubmitTransition(async () => {
      try {
        const res = await submitQuiz(quizId, opts)
        setSelected(opts)
        setResult(res)
      } catch {
        setSubmitError('Something went wrong. Please try again.')
      }
    })
  }

  function handleSave() {
    if (!email || !selected.length) return
    setSaveState('saving')
    startSaveTransition(async () => {
      try {
        await saveResult(quizId, selected, notes, email)
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    })
  }

  function retake() {
    setCurrentIndex(0)
    setAnswers({})
    setResult(null)
    setSelected([])
    setSubmitError('')
    setNotes('')
    setEmail('')
    setSaveState('idle')
  }

  if (result) {
    return (
      <ResultView
        score={result.score}
        label={result.label}
        breakdown={result.breakdown}
        notes={notes}
        email={email}
        saveState={saveState}
        isSaving={isSaving}
        onNotesChange={setNotes}
        onEmailChange={setEmail}
        onSave={handleSave}
        onRetake={retake}
      />
    )
  }

  return (
    <div>
      <div className="h-0.5 bg-border w-full">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <span
            data-testid="question-counter"
            className="text-xs font-medium uppercase tracking-widest text-muted"
          >
            {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-muted">{title}</span>
        </div>

        <div className="mb-10">
          <p
            data-testid="question-text"
            className="text-2xl font-semibold text-text leading-snug mb-8"
          >
            {current.question}
          </p>

          <div className="space-y-2">
            {current.options.map((opt) => {
              const isSelected = currentAnswer?.label === opt.label
              return (
                <button
                  key={opt.label}
                  data-testid="option-button"
                  data-score={opt.score}
                  onClick={() => selectOption(opt)}
                  className={`w-full text-left px-5 py-4 border text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-accent border-accent text-white'
                      : 'bg-white border-border text-text hover:border-text'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {submitError && <p className="text-red-600 text-sm mb-4">{submitError}</p>}

        <div className="flex items-center gap-3">
          {currentIndex > 0 && (
            <button
              data-testid="back-button"
              onClick={handleBack}
              className="px-6 py-3 border border-border text-sm font-medium text-muted hover:border-text hover:text-text transition-colors"
            >
              Back
            </button>
          )}

          <button
            data-testid="next-button"
            disabled={!currentAnswer || isSubmitting}
            onClick={handleNext}
            className="flex-1 py-3 bg-text text-white text-sm font-medium hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Calculating...' : isLast ? 'See my result' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
