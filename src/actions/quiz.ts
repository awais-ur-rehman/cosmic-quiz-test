'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { computeScore, matchResult } from '@/lib/scoring'

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

type SelectedOption = {
  questionId: string
  label: string
  score: number
  question: string
}

export async function submitQuiz(
  quizId: string,
  selected: SelectedOption[],
  notes: string,
  email: string,
): Promise<QuizResult> {
  const payload = await getPayload({ config })

  const quiz = await payload.findByID({ collection: 'quizzes', id: quizId })

  const results = (quiz.results ?? []) as { min: number; max: number; label: string }[]

  const score = computeScore(selected.map((s) => s.score))
  const label = matchResult(score, results)

  const breakdown: BreakdownEntry[] = selected.map((s) => ({
    question: s.question,
    selectedLabel: s.label,
    score: s.score,
  }))

  if (email) {
    await payload.create({
      collection: 'submissions',
      data: {
        quiz: quizId,
        score,
        result: label,
        breakdown,
        email,
        notes: notes || undefined,
      } as any,
    })
  }

  return { score, label, breakdown, notes: notes || undefined, email: email || undefined }
}

export async function lookupByEmail(email: string): Promise<QuizResult | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'submissions',
    where: { email: { equals: email } },
    sort: '-createdAt',
    limit: 1,
  })

  if (result.docs.length === 0) return null

  const doc = result.docs[0]

  return {
    score: doc.score,
    label: doc.result,
    breakdown: doc.breakdown as BreakdownEntry[],
    notes: doc.notes ?? undefined,
    email: doc.email ?? undefined,
  }
}
