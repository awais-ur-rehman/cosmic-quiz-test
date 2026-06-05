import React from 'react'
import './styles.css'

export const metadata = {
  title: 'Cosmic Quiz',
  description: 'What kind of cosmic animal are you?',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 antialiased">{children}</body>
    </html>
  )
}
