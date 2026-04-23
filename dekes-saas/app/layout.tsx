import type { Metadata } from 'next'
import './globals.css'
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google'

import { UTMCapture } from '@/components/utm/UTMCapture'
import type { UTMData } from '@/lib/utm'

import './globals.css'

const bodyFont = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
})

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'DEKES - Buyer Intelligence Command Surface',
  description:
    'DEKES identifies buyers already in motion, packages proof, and delivers outreach-ready accounts with timing, context, and operator-grade scoring.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <UTMCapture />
        {children}
      </body>
    </html>
  )
}

declare global {
  interface Window {
    dekesUTMData?: UTMData
  }
}
