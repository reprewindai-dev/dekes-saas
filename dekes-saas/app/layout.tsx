import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { initializeJobs } from '@/lib/jobs/init'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DEKES - AI Lead Generation',
  description: 'AI-powered lead generation with buyer intent detection',
}

// Initialize jobs on app startup
if (typeof window === 'undefined') {
  initializeJobs().catch(console.error)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
