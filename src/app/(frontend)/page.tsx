import { getPayload } from 'payload'
import config from '@payload-config'
import { shuffle } from '@/lib/shuffle'
import { QuizForm, SiteHeader } from './components'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({ collection: 'quizzes', limit: 1 })

  if (!docs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted">No quiz found. Check database seed.</p>
      </div>
    )
  }

  const quiz = docs[0]

  const questions = ((quiz.questions ?? []) as any[]).map((q: any) => ({
    id: String(q.id),
    question: q.question,
    options: shuffle(
      ((q.options ?? []) as any[]).map((o: any) => ({
        label: o.label,
        score: o.score,
      })),
    ),
  }))

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <QuizForm quizId={String(quiz.id)} title={quiz.title} questions={questions} />
    </div>
  )
}
