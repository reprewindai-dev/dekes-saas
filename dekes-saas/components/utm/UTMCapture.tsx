'use client'

import { useEffect } from 'react'
import { getUTMWithFallback, hasUTMData } from '@/lib/utm'

interface UTMCaptureProps {
  onUTMCaptured?: (utmData: any) => void
}

export function UTMCapture({ onUTMCaptured }: UTMCaptureProps) {
  useEffect(() => {
    // Capture UTM data on component mount
    const utmData = getUTMWithFallback()
    
    if (hasUTMData(utmData) && onUTMCaptured) {
      onUTMCaptured(utmData)
    }
  }, [onUTMCaptured])

  // This component doesn't render anything visible
  return null
}

export default UTMCapture
