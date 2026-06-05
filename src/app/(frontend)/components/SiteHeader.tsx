import Link from 'next/link'

export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-tight text-text">
          Cosmic Quiz
        </Link>
        <Link
          href="/lookup"
          className="text-sm text-muted hover:text-text transition-colors"
        >
          Past results
        </Link>
      </div>
    </header>
  )
}
