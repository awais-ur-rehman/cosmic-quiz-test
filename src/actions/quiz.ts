'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { computeScore, matchResult } from '@/lib/scoring'
import type { BreakdownEntry, QuizResult, SelectedOption } from '@/types/quiz'

export type { BreakdownEntry, QuizResult, SelectedOption }

export async function submitQuiz(
  quizId: string,
  selected: SelectedOption[],
): Promise<QuizResult> {
  const payload = await getPayload({ config })

  const quiz = await payload.findByID({ collection: 'quizzes', id: Number(quizId) })
  const results = (quiz.results ?? []) as { min: number; max: number; label: string }[]

  const score = computeScore(selected.map((s) => s.score))
  const label = matchResult(score, results)

  const breakdown: BreakdownEntry[] = selected.map((s) => ({
    question: s.question,
    selectedLabel: s.label,
    score: s.score,
  }))

  return { score, label, breakdown }
}

export async function saveResult(
  quizId: string,
  selected: SelectedOption[],
  notes: string,
  email: string,
): Promise<{ saved: boolean }> {
  if (!email) return { saved: false }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return { saved: false }

  const payload = await getPayload({ config })

  const quiz = await payload.findByID({ collection: 'quizzes', id: Number(quizId) })
  const results = (quiz.results ?? []) as { min: number; max: number; label: string }[]

  const score = computeScore(selected.map((s) => s.score))
  const label = matchResult(score, results)

  const breakdown: BreakdownEntry[] = selected.map((s) => ({
    question: s.question,
    selectedLabel: s.label,
    score: s.score,
  }))

  await payload.create({
    collection: 'submissions',
    data: {
      quiz: Number(quizId),
      score,
      result: label,
      breakdown,
      email,
      notes: notes || undefined,
    } as any,
  })

  return { saved: true }
}

export async function lookupByEmail(email: string): Promise<QuizResult | null> {
  if (!email) return null

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return null

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
