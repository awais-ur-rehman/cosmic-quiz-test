'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-sm text-muted">Something went wrong loading past results.</p>
        <button onClick={reset} className="text-sm font-medium text-text underline">
          Try again
        </button>
      </div>
    </div>
  )
}
