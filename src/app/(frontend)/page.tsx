import { getPayload } from 'payload'
import config from '@payload-config'
import QuizForm from './components/QuizForm'
import Link from 'next/link'

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({ collection: 'quizzes', limit: 1 })

  if (!docs.length) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">No quiz found. Check database seed.</p>
      </main>
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

  const results = ((quiz.results ?? []) as any[]).map((r: any) => ({
    min: r.min,
    max: r.max,
    label: r.label,
  }))

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <QuizForm
          quizId={String(quiz.id)}
          title={quiz.title}
          questions={questions}
          results={results}
        />

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <Link href="/lookup" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Already took the quiz? Look up your results
          </Link>
        </div>
      </div>
    </main>
  )
}
