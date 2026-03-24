'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Clock3,
  Eye,
  Filter,
  Layers3,
  PlayCircle,
  Radar,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type BillingMode = 'monthly' | 'annual'
type PersonaKey = 'revenue' | 'sales' | 'marketing'

const pipelineMoments = [
  {
    label: 'Retrieve',
    detail: 'Gather raw pages, snippets, filings, hiring changes, and research traces.',
  },
  {
    label: 'Reject',
    detail: 'Strip listicles, noise, platforms, directories, and weak one-off mentions.',
  },
  {
    label: 'Resolve',
    detail: 'Collapse everything to one real company per root domain.',
  },
  {
    label: 'Validate',
    detail: 'Require at least two strong signals with recent timing and proof weight.',
  },
  {
    label: 'Score',
    detail: 'Package why buying, why now, outreach angle, confidence, and timing window.',
  },
  {
    label: 'Route',
    detail: 'Only show SEND_NOW, QUEUE, HOLD, or REJECTED. Nothing vague reaches sales.',
  },
]

const heroCards = [
  {
    title: 'Buying pressure',
    value: '4 verified signals',
    detail: 'Security hiring, partner research, replacement chatter, and budget movement.',
  },
  {
    title: 'Why now',
    value: '14-day urgency window',
    detail: 'Decision team is active now, not someday.',
  },
  {
    title: 'Recommended move',
    value: 'SEND_NOW',
    detail: 'Outbound angle already written and scored.',
  },
]

const proofColumns = [
  {
    title: 'Old world',
    tone: 'border-white/10 text-slate-300',
    items: [
      'Lists of “relevant” accounts with no urgency.',
      'Weak intent guesses that waste SDR time.',
      'No explanation for why a buyer would respond now.',
      'Reps still have to research before sending anything.',
    ],
  },
  {
    title: 'DEKES runtime',
    tone: 'border-cyan-400/30 text-white',
    items: [
      'Company-level buyer packets with verified evidence.',
      'Timing windows, buying stage, and recommended next action.',
      'Hard rejection of noise before anything reaches the queue.',
      'Proof that lets revenue teams move in one pass.',
    ],
  },
]

const capabilityCards: Array<{
  icon: LucideIcon
  title: string
  copy: string
}> = [
  {
    icon: SearchCheck,
    title: 'Strict discovery gate',
    copy: 'A company does not survive unless it resolves cleanly and shows real buyer behavior.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality gate + proof pack',
    copy: 'Every visible lead carries evidence, rationale, timing, and a confidence label sales can trust.',
  },
  {
    icon: Target,
    title: 'Action-ready output',
    copy: 'DEKES answers the three questions that matter: why buying, why now, what to say.',
  },
  {
    icon: Layers3,
    title: 'Operator-grade scoring',
    copy: 'Signals are weighted, combined, and routed into explicit statuses instead of fuzzy lead buckets.',
  },
]

const demoFeed = [
  {
    company: 'North Ridge Payments',
    status: 'SEND_NOW',
    whyNow: 'Security evaluation, two active headcount adds, partner migration chatter.',
    outreach: 'Lead with de-risked migration speed and proof of shortened security reviews.',
  },
  {
    company: 'HarborStack Cloud',
    status: 'QUEUE',
    whyNow: 'Cloud cost pressure and content spike detected, but timing window opens next week.',
    outreach: 'Anchor on infrastructure efficiency before expansion budget closes.',
  },
  {
    company: 'AtlasGrid Ops',
    status: 'HOLD',
    whyNow: 'Interesting motion, but only one strong signal survived validation.',
    outreach: 'Keep monitoring until a second signal confirms buyer intent.',
  },
]

const personaOptions: Array<{ key: PersonaKey; label: string }> = [
  { key: 'revenue', label: 'Revenue Ops' },
  { key: 'sales', label: 'Sales Leaders' },
  { key: 'marketing', label: 'Growth Teams' },
]

const personaDemo: Record<
  PersonaKey,
  { objective: string; output: string; tags: string[]; next: string }
> = {
  revenue: {
    objective: 'Build a governed buyer-intelligence feed the CRO and RevOps team can trust.',
    output:
      '12 accounts cleared by discovery and quality gates, each with timing window, confidence label, and operator notes.',
    tags: ['Governance', 'CRM Sync', 'Board-ready metrics'],
    next: 'Route SEND_NOW accounts to reps and hold weaker candidates outside the pipeline.',
  },
  sales: {
    objective: 'Keep reps focused on accounts already entering a buying cycle.',
    output:
      '8 outreach-ready companies with champion context, recommended angle, and why-now summary attached.',
    tags: ['Rep routing', 'Timing', 'Proof-first outreach'],
    next: 'Launch a sequence with messaging matched to the trigger event and urgency window.',
  },
  marketing: {
    objective: 'Turn noisy account lists into campaign-ready buying cohorts.',
    output:
      '25 validated accounts grouped by problem pattern, timing signal, and buying stage for paid + outbound alignment.',
    tags: ['ABM', 'Segmentation', 'Creative direction'],
    next: 'Spin up campaigns only around validated in-market segments instead of broad ICP guesses.',
  },
}

const pricingBase = {
  starter: 49,
  growth: 149,
  enterprise: 449,
}

export default function LandingPage() {
  const [billing, setBilling] = useState<BillingMode>('monthly')
  const [persona, setPersona] = useState<PersonaKey>('revenue')
  const [activeMoment, setActiveMoment] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveMoment((current) => (current + 1) % pipelineMoments.length)
    }, 2600)

    return () => window.clearInterval(timer)
  }, [])

  const plans = useMemo(() => {
    const annualMultiplier = 0.8
    const mapPrice = (monthly: number) =>
      billing === 'monthly' ? `$${monthly}` : `$${Math.round(monthly * 12 * annualMultiplier)}`

    return [
      {
        name: 'Starter',
        price: mapPrice(pricingBase.starter),
        cadence: billing === 'monthly' ? '/month' : '/year',
        detail: 'For founder-led teams validating buyer timing and proof quality.',
        features: ['150 validated leads/month', '5 active runs', 'Proof pack + statuses'],
      },
      {
        name: 'Growth',
        price: mapPrice(pricingBase.growth),
        cadence: billing === 'monthly' ? '/month' : '/year',
        detail: 'For revenue teams turning DEKES into a must-have operating layer.',
        features: [
          '750 validated leads/month',
          '20 active runs',
          'CRM sync + operator scoring',
          'Priority support',
        ],
        featured: true,
      },
      {
        name: 'Enterprise',
        price: mapPrice(pricingBase.enterprise),
        cadence: billing === 'monthly' ? '/month' : '/year',
        detail: 'For multi-team deployment with governance, SLAs, and custom signal weights.',
        features: ['Unlimited runs', 'Custom scoring policies', 'Webhook + API access', 'Team controls'],
      },
    ]
  }, [billing])

  const activePersona = personaDemo[persona]

  return (
    <div className="dekes-shell min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="dekes-orbit absolute left-[10%] top-24 h-40 w-40 rounded-full border border-cyan-400/10" />
        <div className="dekes-orbit absolute right-[12%] top-40 h-72 w-72 rounded-full border border-blue-400/10" />
        <div className="dekes-float absolute left-[8%] top-[28rem] h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="dekes-float absolute right-[15%] top-[38rem] h-24 w-24 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/6 bg-[#050b16]/82 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="dekes-panel flex h-11 w-11 items-center justify-center rounded-2xl">
              <Radar className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="font-[var(--font-display)] text-lg font-semibold tracking-[0.18em] text-white">
                DEKES
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--dekes-subtle)]">
                Buyer Intelligence Runtime
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-7 text-sm text-[var(--dekes-muted)] md:flex">
            <Link href="#proof" className="hover:text-white">
              Proof
            </Link>
            <Link href="#runtime" className="hover:text-white">
              Runtime
            </Link>
            <Link href="#demo" className="hover:text-white">
              Demo
            </Link>
            <Link href="#pricing" className="hover:text-white">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden text-sm text-[var(--dekes-muted)] hover:text-white md:inline">
              Log in
            </Link>
            <Link
              href="/demo"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(0,209,199,0.25)]"
            >
              Watch Live Demo
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        <section className="px-4 pb-20 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-8">
              <div className="dekes-pill text-sm">
                <span className="dekes-dot dekes-pulse" />
                Live buyer-intelligence surface for revenue teams that care about timing.
              </div>

              <div className="space-y-6">
                <h1 className="max-w-5xl font-[var(--font-display)] text-5xl font-semibold leading-[0.95] text-white md:text-7xl">
                  Do not buy another
                  <span className="dekes-gradient-text block">lead list.</span>
                  Buy the proof of
                  <span className="dekes-gradient-text block">who is buying now.</span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[var(--dekes-muted)]">
                  DEKES is not a database and not another vague intent feed. It searches broadly,
                  rejects aggressively, resolves to real companies, validates multiple strong signals,
                  and only surfaces accounts that explain why they are buying, why now, and what to say.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {heroCards.map((card) => (
                  <div key={card.title} className="dekes-panel rounded-[26px] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--dekes-subtle)]">
                      {card.title}
                    </p>
                    <p className="mt-3 font-[var(--font-display)] text-2xl font-semibold text-white">
                      {card.value}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--dekes-muted)]">{card.detail}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-semibold text-slate-950"
                >
                  See Live Demo
                  <PlayCircle className="h-5 w-5" />
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3.5 font-semibold text-white"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="dekes-panel-strong dekes-ring rounded-[32px] p-6 sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--dekes-subtle)]">
                    Live Runtime Preview
                  </p>
                  <h2 className="mt-2 font-[var(--font-display)] text-2xl font-semibold text-white">
                    Buyer motion, not page noise
                  </h2>
                </div>
                <div className="dekes-pill text-xs">
                  <span className="dekes-dot dekes-pulse" />
                  STREAMING
                </div>
              </div>

              <div className="dekes-scan rounded-[28px] border border-white/8 bg-black/20 p-5">
                <div className="grid gap-3">
                  {pipelineMoments.map((moment, index) => {
                    const active = activeMoment === index
                    return (
                      <div
                        key={moment.label}
                        className={`rounded-2xl border px-4 py-3 transition ${
                          active
                            ? 'border-cyan-400/30 bg-cyan-400/10'
                            : 'border-white/6 bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-white">{moment.label}</p>
                            <p className="mt-1 text-sm leading-6 text-[var(--dekes-muted)]">
                              {moment.detail}
                            </p>
                          </div>
                          <span
                            className={`mt-1 h-2.5 w-2.5 rounded-full ${
                              active ? 'bg-cyan-300 shadow-[0_0_18px_rgba(0,209,199,0.65)]' : 'bg-white/20'
                            }`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {demoFeed.map((item) => (
                  <div key={item.company} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{item.company}</p>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--dekes-muted)]">{item.whyNow}</p>
                    <p className="mt-4 text-sm text-cyan-200">{item.outreach}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="border-y border-white/6 bg-[#06101b]/82 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">60-second understanding</p>
              <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold text-white md:text-5xl">
                DEKES wins because it filters
                <span className="dekes-gradient-text"> before sales ever sees the lead.</span>
              </h2>
              <p className="mt-5 text-lg leading-8 text-[var(--dekes-muted)]">
                Most tools dump signals into your CRM and let your team burn time deciding what is real.
                DEKES does the hard part first, then routes only actionable accounts.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {proofColumns.map((column) => (
                <div key={column.title} className={`dekes-panel rounded-[28px] p-7 ${column.tone}`}>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--dekes-subtle)]">
                    {column.title}
                  </p>
                  <div className="mt-6 space-y-4">
                    {column.items.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <BadgeCheck className="mt-0.5 h-5 w-5 text-cyan-300" />
                        <p className="text-base leading-7">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="runtime" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Core runtime</p>
                <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold text-white md:text-5xl">
                  Built to answer the three questions every rep actually needs.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-[var(--dekes-muted)]">
                Why are they buying? Why now? What should we say? If a candidate cannot answer those,
                it does not survive the runtime.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {capabilityCards.map((card) => (
                <div key={card.title} className="dekes-panel rounded-[26px] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-[var(--font-display)] text-2xl font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--dekes-muted)]">{card.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="border-y border-white/6 bg-[#06101b]/78 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Live demo</p>
              <h2 className="font-[var(--font-display)] text-4xl font-semibold text-white md:text-5xl">
                Show buyers and investors the product in under a minute.
              </h2>
              <p className="text-lg leading-8 text-[var(--dekes-muted)]">
                The demo mirrors the real pipeline: wide retrieval, hard rejection, entity resolution,
                multi-signal validation, scoring, and action-ready packaging.
              </p>

              <div className="grid gap-4">
                {[
                  'Raw search results are not leads.',
                  'Two strong signals minimum or the company gets rejected.',
                  'Every visible account carries whyBuying, whyNow, outreachAngle, status, and window.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <Sparkles className="mt-1 h-4 w-4 text-cyan-300" />
                    <p className="text-sm leading-7 text-white">{item}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-semibold text-slate-950"
                >
                  Launch Demo
                  <PlayCircle className="h-5 w-5" />
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3.5 font-semibold text-white"
                >
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="dekes-panel-strong rounded-[32px] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--dekes-subtle)]">
                    Persona simulator
                  </p>
                  <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold text-white">
                    Buyer-intelligence output by team
                  </h3>
                </div>
                <Activity className="h-5 w-5 text-cyan-300" />
              </div>

              <div className="flex flex-wrap gap-3">
                {personaOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setPersona(option.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      persona === option.key
                        ? 'bg-cyan-400 text-slate-950'
                        : 'border border-white/10 bg-white/5 text-[var(--dekes-muted)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--dekes-subtle)]">
                    Objective
                  </p>
                  <p className="mt-3 text-lg font-medium text-white">{activePersona.objective}</p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--dekes-subtle)]">
                    Output
                  </p>
                  <p className="mt-3 text-base leading-7 text-white">{activePersona.output}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activePersona.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--dekes-subtle)]">
                    Next move
                  </p>
                  <p className="mt-3 text-base leading-7 text-[var(--dekes-muted)]">
                    {activePersona.next}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Pricing</p>
              <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold text-white md:text-5xl">
                One closed deal should justify the platform.
              </h2>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="dekes-panel inline-flex rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setBilling('monthly')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    billing === 'monthly' ? 'bg-cyan-400 text-slate-950' : 'text-[var(--dekes-muted)]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling('annual')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    billing === 'annual' ? 'bg-cyan-400 text-slate-950' : 'text-[var(--dekes-muted)]'
                  }`}
                >
                  Annual
                </button>
              </div>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-[30px] p-7 ${
                    plan.featured ? 'dekes-panel-strong dekes-ring' : 'dekes-panel'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-[var(--font-display)] text-2xl font-semibold text-white">{plan.name}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--dekes-muted)]">{plan.detail}</p>
                    </div>
                    {plan.featured && (
                      <span className="rounded-full bg-cyan-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950">
                        Best fit
                      </span>
                    )}
                  </div>

                  <div className="mt-8 flex items-baseline gap-2">
                    <p className="font-[var(--font-display)] text-5xl font-semibold text-white">{plan.price}</p>
                    <span className="text-sm text-[var(--dekes-muted)]">{plan.cadence}</span>
                  </div>

                  <div className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-300" />
                        <p className="text-sm leading-7 text-white">{feature}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/auth/signup"
                    className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 font-semibold ${
                      plan.featured
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950'
                        : 'border border-white/12 bg-white/5 text-white'
                    }`}
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="dekes-panel-strong mx-auto max-w-6xl rounded-[36px] px-8 py-12 text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Final truth</p>
            <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold text-white md:text-5xl">
              You do not lose pipeline because there are no buyers.
            </h2>
            <p className="mt-4 text-2xl text-[var(--dekes-muted)]">
              You lose pipeline because your team cannot see which buyers are moving right now.
            </p>
            <p className="mt-4 text-2xl font-semibold text-cyan-200">
              DEKES fixes timing. Timing is what closes revenue.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
