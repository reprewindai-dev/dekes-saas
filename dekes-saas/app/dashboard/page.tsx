'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock3,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

import EcobeDashboardMetrics from '@/components/ecobe/dashboard-metrics'
import EcobeInboundEventsPanel from '@/components/ecobe/inbound-events-panel'
import LeadIntelligencePanel from '@/components/lead-intelligence-panel'

type UserState = {
  name?: string | null
  email?: string | null
}

type StatsState = {
  leads: number
  qualified: number
  won: number
  conversion: number
}

type AnalyticsState = {
  funnel?: Record<string, number>
  quality?: {
    avgDiscoveryScore?: number
    avgQualityScore?: number
    mustHaveLeads?: number
    highScoreLeads?: number
  }
}

const defaultStats: StatsState = { leads: 0, qualified: 0, won: 0, conversion: 0 }

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserState | null>(null)
  const [stats, setStats] = useState<StatsState>(defaultStats)
  const [analytics, setAnalytics] = useState<AnalyticsState | null>(null)

  useEffect(() => {
    let active = true

    Promise.all([
      fetch('/api/user/me', { credentials: 'include' }),
      fetch('/api/leads/analytics', { credentials: 'include' }),
    ])
      .then(async ([userRes, analyticsRes]) => {
        const userPayload = await userRes.json().catch(() => null)
        const analyticsPayload = await analyticsRes.json().catch(() => null)

        if (!userRes.ok || !userPayload?.user) {
          router.push('/auth/login')
          return
        }

        if (!active) return

        setUser(userPayload.user)
        setStats(userPayload.stats || defaultStats)
        if (analyticsRes.ok) {
          setAnalytics(analyticsPayload)
        }
      })
      .catch(() => router.push('/auth/login'))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [router])

  const commandCards = useMemo(
    () => [
      {
        label: 'Qualified buyers',
        value: stats.qualified.toString(),
        detail: 'Accounts that passed the runtime and are ready for motion.',
        icon: Target,
      },
      {
        label: 'Must-have leads',
        value: String(analytics?.quality?.mustHaveLeads ?? 0),
        detail: 'High-proof buyers with stronger discovery and quality-gate outcomes.',
        icon: ShieldCheck,
      },
      {
        label: 'Discovery score',
        value: `${analytics?.quality?.avgDiscoveryScore ?? 0}`,
        detail: 'Average discovery gate strength across recent runtime output.',
        icon: Radar,
      },
      {
        label: 'Conversion rate',
        value: `${stats.conversion}%`,
        detail: 'How much of the pipeline is turning into actual movement.',
        icon: TrendingUp,
      },
    ],
    [analytics, stats]
  )

  if (loading) {
    return (
      <div className="dekes-shell flex min-h-screen items-center justify-center">
        <div className="dekes-panel rounded-[28px] px-8 py-6 text-lg text-white">Loading command surface...</div>
      </div>
    )
  }

  return (
    <div className="dekes-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[32px] border border-white/8 bg-[#07111f]/84 px-6 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="dekes-panel flex h-12 w-12 items-center justify-center rounded-2xl">
                <Radar className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="font-[var(--font-display)] text-xl font-semibold tracking-[0.16em] text-white">
                  DEKES
                </p>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--dekes-subtle)]">
                  Buyer intelligence command surface
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/runs/new"
                className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950"
              >
                Run New Search
              </Link>
              <Link
                href="/leads"
                className="rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Review Leads
              </Link>
              <button
                onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                    .catch(() => {})
                    .finally(() => router.push('/'))
                }}
                className="rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold text-[var(--dekes-muted)]"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-6">
            <div className="dekes-pill text-sm">
              <span className="dekes-dot dekes-pulse" />
              Live runtime, proof gates, lead motion, and EcoBE handoff status in one place.
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Mission control</p>
              <h1 className="mt-4 font-[var(--font-display)] text-4xl font-semibold text-white md:text-6xl">
                Welcome back
                <span className="dekes-gradient-text block">
                  {user?.name || user?.email || 'operator'}.
                </span>
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--dekes-muted)]">
                This is where the DEKES runtime becomes operational. Watch lead quality, timing, proof
                density, and EcoBE-linked downstream events without switching surfaces.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {commandCards.map((card) => (
                <div key={card.label} className="dekes-panel rounded-[26px] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--dekes-subtle)]">
                    {card.label}
                  </p>
                  <p className="mt-2 font-[var(--font-display)] text-3xl font-semibold text-white">
                    {card.value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--dekes-muted)]">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="dekes-panel-strong dekes-ring rounded-[32px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--dekes-subtle)]">
                  Runtime snapshot
                </p>
                <h2 className="mt-2 font-[var(--font-display)] text-2xl font-semibold text-white">
                  What the system is pushing toward revenue now
                </h2>
              </div>
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="grid gap-4">
              <SnapshotRow
                label="Total leads"
                value={stats.leads.toString()}
                sub="All generated accounts tracked under this workspace."
                percentage={Math.min(100, Math.max(10, stats.leads))}
              />
              <SnapshotRow
                label="Qualified"
                value={stats.qualified.toString()}
                sub="Cleared discovery and quality thresholds."
                percentage={stats.leads > 0 ? (stats.qualified / stats.leads) * 100 : 0}
              />
              <SnapshotRow
                label="High score"
                value={String(analytics?.quality?.highScoreLeads ?? 0)}
                sub="Accounts scoring 80+ across the runtime."
                percentage={
                  stats.leads > 0 ? ((analytics?.quality?.highScoreLeads ?? 0) / stats.leads) * 100 : 0
                }
              />
              <SnapshotRow
                label="Won"
                value={stats.won.toString()}
                sub="Observed positive outcomes recorded back into DEKES."
                percentage={stats.qualified > 0 ? (stats.won / stats.qualified) * 100 : 0}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <QuickAction
                href="/runs/new"
                title="Launch a new search"
                detail="Push new queries through the runtime and refresh the queue."
                icon={Activity}
              />
              <QuickAction
                href="/leads"
                title="Work the leads"
                detail="Review proof packs, timing windows, and outreach actions."
                icon={Users}
              />
            </div>
          </div>
        </section>

        <SectionFrame
          eyebrow="Lead runtime"
          title="Lead intelligence stream"
          body="The highest-value part of DEKES: live buyers with proof, timing, and recommended action in one view."
        >
          <LeadIntelligencePanel />
        </SectionFrame>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionFrame
            eyebrow="EcoBE linkage"
            title="Downstream workload and routing metrics"
            body="Proof that DEKES can drive operational decisions past the lead layer."
          >
            <EcobeDashboardMetrics />
          </SectionFrame>

          <SectionFrame
            eyebrow="Inbound signals"
            title="Buyer events entering the system"
            body="Recent signal and handoff activity flowing into the runtime."
          >
            <EcobeInboundEventsPanel />
          </SectionFrame>
        </section>
      </div>
    </div>
  )
}

function SnapshotRow({
  label,
  value,
  sub,
  percentage,
}: {
  label: string
  value: string
  sub: string
  percentage: number
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--dekes-subtle)]">{label}</p>
          <p className="mt-2 font-[var(--font-display)] text-3xl font-semibold text-white">{value}</p>
        </div>
        <BarChart3 className="h-5 w-5 text-cyan-300" />
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--dekes-muted)]">{sub}</p>
      <div className="dekes-stat-line mt-4">
        <span style={{ width: `${Math.max(6, Math.min(100, percentage))}%` }} />
      </div>
    </div>
  )
}

function QuickAction({
  href,
  title,
  detail,
  icon: Icon,
}: {
  href: string
  title: string
  detail: string
  icon: typeof Activity
}) {
  return (
    <Link href={href} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 hover:border-cyan-400/20">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-[var(--font-display)] text-2xl font-semibold text-white">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[var(--dekes-muted)]">{detail}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
        Open
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  )
}

function SectionFrame({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children: React.ReactNode
}) {
  return (
    <div className="dekes-panel rounded-[32px] p-6">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{eyebrow}</p>
        <h2 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-white">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--dekes-muted)]">{body}</p>
      </div>
      {children}
    </div>
  )
}
