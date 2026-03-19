'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Info, ExternalLink, Radio } from 'lucide-react'

interface EcobeSignalEvent {
  id: string
  handoffId: string
  eventType: string
  severity: string
  classification: string
  budgetUsed: number | null
  budgetLimit: number | null
  budgetCurrency: string | null
  policyAction: string | null
  delayMinutes: number | null
  cleanWindowRegion: string | null
  replayUrl: string | null
  createdAt: string
}

interface SignalCounts {
  RISK: number
  INFORMATIONAL: number
  OPPORTUNITY: number
  NO_ACTION: number
}

interface EcobeSignalsData {
  events: EcobeSignalEvent[]
  counts: SignalCounts
}

function severityColor(severity: string) {
  switch (severity) {
    case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20'
    case 'WARNING': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
  }
}

function classificationColor(classification: string) {
  switch (classification) {
    case 'RISK': return 'text-red-400'
    case 'OPPORTUNITY': return 'text-green-400'
    case 'INFORMATIONAL': return 'text-blue-400'
    default: return 'text-slate-400'
  }
}

function eventTypeLabel(eventType: string) {
  return eventType
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EcobeInboundEventsPanel() {
  const [data, setData] = useState<EcobeSignalsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/ecobe-signals', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((d) => { if (d && d.counts) setData(d) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-slate-700 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-slate-400">Unable to load ECOBE signals</p>
      </div>
    )
  }

  const riskCount = data.counts.RISK ?? 0
  const infoCount = data.counts.INFORMATIONAL ?? 0

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            ECOBE Signals
          </h2>
          <p className="text-slate-400 text-sm mt-1">Inbound carbon routing events from ECOBE</p>
        </div>
        {/* Summary badges */}
        <div className="flex items-center gap-2">
          {riskCount > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-sm text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              {riskCount} Risk
            </span>
          )}
          {infoCount > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400">
              <Info className="w-3.5 h-3.5" />
              {infoCount} Info
            </span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {data.events.length === 0 && (
        <div className="text-center py-10">
          <Radio className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No ECOBE signals received yet</p>
          <p className="text-slate-600 text-xs mt-1">Budget warnings, policy delays, and other events will appear here</p>
        </div>
      )}

      {/* Events table */}
      {data.events.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-500 font-medium pb-3 pr-4">Event</th>
                <th className="text-left text-slate-500 font-medium pb-3 pr-4">Severity</th>
                <th className="text-left text-slate-500 font-medium pb-3 pr-4">Classification</th>
                <th className="text-left text-slate-500 font-medium pb-3 pr-4">Details</th>
                <th className="text-left text-slate-500 font-medium pb-3 pr-4">Time</th>
                <th className="text-left text-slate-500 font-medium pb-3">Replay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data.events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 pr-4">
                    <span className="text-white font-medium">{eventTypeLabel(event.eventType)}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${severityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium ${classificationColor(event.classification)}`}>
                      {event.classification}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">
                    {event.budgetUsed != null && event.budgetLimit != null && (
                      <span>
                        {event.budgetUsed.toFixed(2)} / {event.budgetLimit.toFixed(2)}
                        {event.budgetCurrency ? ` ${event.budgetCurrency}` : ''}
                      </span>
                    )}
                    {event.delayMinutes != null && (
                      <span>{event.delayMinutes}min delay</span>
                    )}
                    {event.policyAction && !event.delayMinutes && (
                      <span>{event.policyAction}</span>
                    )}
                    {event.budgetUsed == null && event.delayMinutes == null && !event.policyAction && (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">
                    {formatDate(event.createdAt)}
                  </td>
                  <td className="py-3">
                    {event.replayUrl ? (
                      <a
                        href={event.replayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
                      >
                        View in ECOBE
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
