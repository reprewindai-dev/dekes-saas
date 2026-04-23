'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Clock3,
  Filter,
  Globe,
  PlayCircle,
  Radar,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'

type DemoStage = 'idle' | 'running' | 'complete'

const pipeline = [
  {
    key: 'retrieve',
    title: 'Retrieve raw search results',
    detail: 'DEKES starts wide. Pages, snippets, hiring signals, content activity, and public traces all enter the first pass.',
  },
  {
    key: 'reject',
    title: 'Hard reject junk',
    detail: 'Directories, “top X” lists, generic platforms, and weak pages are removed before scoring starts.',
  },
  {
    key: 'resolve',
    title: 'Resolve real company',
    detail: 'Everything collapses to one clean company identity per root domain.',
  },
  {
    key: 'validate',
    title: 'Require multiple strong signals',
    detail: 'No company survives without recent, strong, buyer-relevant signals that can be packaged as proof.',
  },
  {
    key: 'score',
    title: 'Package whyNow + outreach',
    detail: 'Each visible buyer gets a whyBuying summary, whyNow context, outreach angle, timing window, and status.',
  },
]

const resultCards = [
  {
    company: 'North Ridge Payments',
    status: 'SEND_NOW',
    whyNow: 'Security hiring, vendor comparison activity, and buying committee movement were all detected this week.',
    outreach: 'Lead with migration-risk reduction and procurement acceleration.',
    confidence: 'high',
  },
  {
    company: 'HarborStack Cloud',
    status: 'QUEUE',
    whyNow: 'Pressure is building, but the strongest motion lines up with next week’s launch window.',
    outreach: 'Anchor the message on cost pressure and rollout timing.',
    confidence: 'medium',
  },
  {
    company: 'AtlasGrid Ops',
    status: 'HOLD',
    whyNow: 'Interesting activity, but not enough proof survived validation yet.',
    outreach: 'Continue monitoring until a second strong signal appears.',
    confidence: 'low',
  },
]

const deliverables = [
  { label: 'Qualified buyers', value: '12 accounts' },
  { label: 'Noise rejected', value: '73 pages' },
  { label: 'Avg proof strength', value: '89/100' },
  { label: 'Projected pipeline lift', value: '3.1x' },
]

export default function DemoPage() {
  const [stage, setStage] = useState<DemoStage>('idle')
  const [stepIndex, setStepIndex] = useState(0)

  const stageLabel = useMemo(() => {
    if (stage === 'idle') return 'Ready'
    if (stage === 'running') return `Running step ${stepIndex + 1}/${pipeline.length}`
    return 'Complete'
  }, [stage, stepIndex])

  function launchDemo() {
    setStage('running')
    setStepIndex(0)

    pipeline.forEach((_, index) => {
      window.setTimeout(() => {
        setStepIndex(index)
        if (index === pipeline.length - 1) {
          window.setTimeout(() => setStage('complete'), 700)
        }
      }, index * 950)
    })
  }

  return (
    <div className="dekes-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-5 rounded-[32px] border border-white/8 bg-[#07111f]/82 px-6 py-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="dekes-panel flex h-12 w-12 items-center justify-center rounded-2xl">
              <Radar className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="font-[var(--font-display)] text-xl font-semibold tracking-[0.16em] text-white">
                DEKES
              </p>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--dekes-subtle)]">
                Live buyer-intelligence simulation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white">
              Back to overview
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950"
            >
              Start Free Trial
            </Link>
          </div>
        </header>

        <section className="grid gap-8 xl:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-6">
            <div className="dekes-pill text-sm">
              <span className="dekes-dot dekes-pulse" />
              Public demo of the real pipeline logic, not a static mock.
            </div>

            <div>
              <h1 className="font-[var(--font-display)] text-4xl font-semibold text-white md:text-6xl">
                Watch DEKES move
                <span className="dekes-gradient-text block">from raw search to real buyer.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--dekes-muted)]">
                This demo mirrors the signed runtime contract: retrieve broadly, reject junk, resolve
                real entities, validate strong signals, and only surface actionable buyers with timing
                and outreach context.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {deliverables.map((item) => (
                <div key={item.label} className="dekes-panel rounded-[24px] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--dekes-subtle)]">
                    {item.label}
                  </p>
                  <p className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={launchDemo}
              disabled={stage === 'running'}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {stage === 'running' ? 'Running live demo...' : 'Launch live demo'}
              <PlayCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="dekes-panel-strong dekes-ring rounded-[32px] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-[var(--dekes-subtle)]">
                    Runtime pipeline
                  </p>
                  <h2 className="mt-2 font-[var(--font-display)] text-2xl font-semibold text-white">
                    {stageLabel}
                  </h2>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Live
                </div>
              </div>

              <div className="grid gap-3">
                {pipeline.map((item, index) => {
                  const active = stage !== 'idle' && index <= stepIndex
                  const current = stage === 'running' && index === stepIndex
                  return (
                    <div
                      key={item.key}
                      className={`rounded-[22px] border px-4 py-4 transition ${
                        current
                          ? 'border-cyan-400/30 bg-cyan-400/10'
                          : active
                            ? 'border-blue-400/20 bg-blue-500/8'
                            : 'border-white/8 bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--dekes-muted)]">{item.detail}</p>
                        </div>
                        <span
                          className={`mt-1 h-2.5 w-2.5 rounded-full ${
                            current
                              ? 'bg-cyan-300 shadow-[0_0_18px_rgba(0,209,199,0.6)]'
                              : active
                                ? 'bg-blue-300'
                                : 'bg-white/15'
                          }`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {resultCards.map((card) => (
                <div key={card.company} className="dekes-panel rounded-[24px] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{card.company}</p>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                      {card.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--dekes-muted)]">{card.whyNow}</p>
                  <p className="mt-4 text-sm text-white">{card.outreach}</p>
                  <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--dekes-subtle)]">
                    <ShieldCheck className="h-4 w-4 text-cyan-300" />
                    {card.confidence} confidence
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-5">
          <DemoSignalCard icon={SearchCheck} title="Discovery gate" detail="Eliminates weak entity matches before scoring." />
          <DemoSignalCard icon={Filter} title="Junk rejection" detail="Suppresses listicles, directories, and platform noise." />
          <DemoSignalCard icon={Target} title="Why now" detail="Shows the exact urgency window attached to the buyer." />
          <DemoSignalCard icon={BadgeCheck} title="Proof pack" detail="Evidence, confidence, and trigger event in one view." />
          <DemoSignalCard icon={Globe} title="Action status" detail="Only SEND_NOW, QUEUE, HOLD, or REJECTED." />
        </section>

        <section className="mt-10 rounded-[32px] border border-white/8 bg-[#07111f]/84 px-8 py-10 text-center backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">What happens next</p>
          <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold text-white">
            Turn the demo into your operating layer.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[var(--dekes-muted)]">
            Create an account to run live searches, score against your ICP, review proof packs, and hand
            high-confidence buyers into your revenue motion.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-semibold text-slate-950"
            >
              Start 14-day trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/runs/new"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3.5 font-semibold text-white"
            >
              Go to runtime
              <Activity className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function DemoSignalCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof SearchCheck
  title: string
  detail: string
}) {
  return (
    <div className="dekes-panel rounded-[24px] p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-[var(--font-display)] text-xl font-semibold text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--dekes-muted)]">{detail}</p>
    </div>
  )
}
