import Link from 'next/link'
import LookupForm from '../components/LookupForm'

export default function LookupPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to quiz
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-8">Retrieve your results</h1>

        <LookupForm />
      </div>
    </main>
  )
}
