import SiteHeader from '../components/SiteHeader'
import LookupForm from '../components/LookupForm'

export default function LookupPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-xl font-semibold text-text mb-2">Past results</h1>
        <p className="text-sm text-muted mb-10">
          Enter your email to retrieve your previous quiz result.
        </p>
        <LookupForm />
      </div>
    </div>
  )
}
