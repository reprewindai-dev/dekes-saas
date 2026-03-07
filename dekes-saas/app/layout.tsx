import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { initializeJobs } from '@/lib/jobs/init'
import { UTMCapture } from '@/components/utm/UTMCapture'
import type { UTMData } from '@/lib/utm'

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
      <body>
        <UTMCapture onUTMCaptured={(utmData: UTMData) => {
          // Store UTM data globally for use in API calls
          if (typeof window !== 'undefined') {
            window.dekesUTMData = utmData
          }
        }} />
        {children}
      </body>
    </html>
  )
}

// Extend window type to include UTM data
declare global {
  interface Window {
    dekesUTMData?: UTMData
  }
}
