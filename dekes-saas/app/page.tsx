"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Brain,
  Sparkles,
  PlayCircle,
  ShieldCheck,
  BarChart3,
  LineChart,
  Globe,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export default function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [persona, setPersona] = useState<'revenue' | 'sales' | 'marketing'>('revenue')

  const pricingPlans = useMemo(() => {
    const starterMonthly = 129
    const professionalMonthly = 349

    const annualMultiplier = 0.8
    const starterAnnual = Math.round(starterMonthly * 12 * annualMultiplier)
    const professionalAnnual = Math.round(professionalMonthly * 12 * annualMultiplier)

    return [
      {
        name: 'Starter',
        priceLabel: billing === 'monthly' ? `$${starterMonthly}` : `$${starterAnnual}`,
        priceMeta: billing === 'monthly' ? '/month' : '/year',
        popular: false,
        highlight: 'Close one deal and this pays for itself.',
        features: [
          '100 qualified leads',
          '5 active scans',
          'Basic scoring',
          'Email support',
        ],
      },
      {
        name: 'Professional',
        priceLabel: billing === 'monthly' ? `$${professionalMonthly}` : `$${professionalAnnual}`,
        priceMeta: billing === 'monthly' ? '/month' : '/year',
        popular: true,
        highlight: 'Close one deal and this pays for itself.',
        features: [
          '500 qualified leads',
          '20 active scans',
          'Advanced scoring',
          'Contact enrichment',
          'Priority support',
        ],
      },
      {
        name: 'Enterprise',
        priceLabel: 'Custom',
        priceMeta: 'pricing',
        popular: false,
        highlight: 'Built for revenue teams that need infrastructure-level scale.',
        features: [
          'Unlimited leads',
          'Unlimited scans',
          'Custom scoring weights',
          'API access',
          'Dedicated success manager',
          'SLA guarantee',
        ],
      },
    ]
  }, [billing])

  const activePersona = personaDemo[persona]

  return (
    <div className="min-h-screen bg-[#030712] text-[#E6EDF7]">
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-3/4 rounded-full bg-[#1F6BFF]/30 blur-[120px]" />
        <div className="absolute top-64 right-1/2 h-96 w-96 translate-x-1/3 rounded-full bg-[#00D1C7]/20 blur-[160px]" />
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050A16]/80 backdrop-blur-2xl border-b border-[#1F2A3D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#121A2B] border border-[#1F2A3D] rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-[#00D1C7]" />
              </div>
              <span className="text-xl font-bold text-[#E6EDF7]">DEKES</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-[#9FB3C8] hover:text-[#E6EDF7] transition">Features</Link>
              <Link href="#how-it-works" className="text-[#9FB3C8] hover:text-[#E6EDF7] transition">How it works</Link>
              <Link href="#live-demo" className="text-[#9FB3C8] hover:text-[#E6EDF7] transition">Live demo</Link>
              <Link href="#pricing" className="text-[#9FB3C8] hover:text-[#E6EDF7] transition">Pricing</Link>
              <Link href="/auth/login" className="text-[#9FB3C8] hover:text-[#E6EDF7] transition">Login</Link>
              <Link href="/demo" className="px-4 py-2 bg-[#00D1C7] hover:bg-[#00B5AC] text-[#050A16] rounded-lg transition font-medium">
                Launch Live Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0C1424]/70 border border-[#1F2A3D] rounded-full mb-8">
              <Zap className="w-4 h-4 text-[#00D1C7]" />
              <span className="text-sm text-[#B0C6E3] font-medium">Revenue-Controlled Buyer Intent Infrastructure</span>
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold text-[#F5F8FF] mb-6 leading-tight tracking-tight">
              Turn Invisible Demand
              <br />
              Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1C7] via-[#1F6BFF] to-[#7B61FF]">pipeline you control.</span>
            </h1>

            <p className="text-xl text-[#9FB3C8] max-w-2xl mb-10 leading-relaxed">
              DEKES watches the web for intent spikes, validates every signal with multi-source proof, and drops audit-ready buyers straight into your outbound motion.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
              <Link
                href="/demo"
                className="px-8 py-4 bg-[#00D1C7] hover:bg-[#00B5AC] text-[#041022] rounded-2xl font-semibold text-lg transition flex items-center space-x-2 group shadow-[0_10px_30px_rgba(0,209,199,0.35)]"
              >
                <span>Launch Live Demo</span>
                <PlayCircle className="w-5 h-5 group-hover:scale-110 transition" />
              </Link>
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-[#101A2E]/80 hover:bg-[#101A2E] border border-[#1F2A3D] text-[#E6EDF7] rounded-2xl font-semibold text-lg transition flex items-center space-x-2"
              >
                <span>Start 14-Day Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="mt-10 text-sm text-[#9FB3C8] flex flex-col sm:flex-row gap-2 sm:items-center">
              <span>No credit card required</span>
              <span className="hidden sm:inline text-[#1F6BFF]">•</span>
              <span>Production data sandbox</span>
              <span className="hidden sm:inline text-[#1F6BFF]">•</span>
              <span>Instant governance controls</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#11203D] to-[#091120] blur-2xl opacity-70" aria-hidden />
            <div className="relative p-8 rounded-[32px] border border-[#1F2A3D] bg-[#050A16]/90 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-[#9FB3C8]">AI identifies new buyer</p>
                  <p className="text-2xl font-bold text-white">Precision SaaS Security Rollout</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#00D1C7]/15 text-[#00D1C7]">LIVE SIGNAL</span>
              </div>
              <div className="space-y-4">
                {heroSignals.map((signal) => (
                  <div key={signal.label} className="p-4 rounded-2xl border border-[#1F2A3D] bg-[#0B1424]">
                    <div className="text-sm text-[#9FB3C8] flex items-center gap-2">
                      <signal.icon className="w-4 h-4 text-[#1F6BFF]" />
                      {signal.label}
                    </div>
                    <p className="text-lg font-semibold text-white mt-1">{signal.value}</p>
                    <p className="text-sm text-[#72819A]">{signal.meta}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-[#071021] border border-[#1F6BFF]/30">
                <p className="text-sm text-[#9FB3C8]">Next action</p>
                <p className="text-lg font-semibold text-white">Auto-create outreach sequence & notify assigned rep</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Stats */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {heroStats.map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl border border-[#1F2A3D] bg-[#0B1220]/70">
              <p className="text-sm uppercase tracking-wide text-[#72819A]">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-[#9FB3C8]">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Logos */}
      <section className="py-10 border-y border-[#101A2E] bg-[#060B17]/70">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 opacity-70">
          {trustedLogos.map((logo) => (
            <div key={logo} className="text-[#9FB3C8] text-sm tracking-[0.4em]">
              {logo}
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {proofMetrics.map((metric) => (
              <div key={metric.label} className="p-6 rounded-2xl border border-[#1F2A3D] bg-[#101A2E]/60">
                <p className="text-sm text-[#72819A] uppercase tracking-wide">{metric.caption}</p>
                <p className="mt-2 text-4xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-sm text-[#9FB3C8]">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#E6EDF7] mb-6 tracking-tight">
              Buyer-Intent Intelligence Infrastructure
            </h2>
            <p className="text-xl text-[#9FB3C8] max-w-3xl mx-auto leading-relaxed">
              Capture signals, validate intent, and deliver buyers to revenue teams with infrastructure-level reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-6 bg-[#121A2B] border border-[#1F2A3D] rounded-2xl hover:border-[#1F6BFF]/60 transition group">
                <div className="w-12 h-12 bg-[#0B1220] border border-[#1F2A3D] rounded-xl flex items-center justify-center mb-4 group-hover:border-[#1F6BFF]/60 transition">
                  <feature.icon className="w-6 h-6 text-[#1F6BFF]" />
                </div>
                <h3 className="text-xl font-semibold text-[#E6EDF7] mb-3">{feature.title}</h3>
                <p className="text-[#9FB3C8] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#E6EDF7] mb-6 tracking-tight">How It Works</h2>
            <p className="text-xl text-[#9FB3C8] max-w-3xl mx-auto leading-relaxed">
              Everything is built to produce revenue outcomes, not dashboards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.title} className="p-8 bg-[#121A2B] border border-[#1F2A3D] rounded-2xl">
                <div className="text-sm font-semibold text-[#00D1C7] mb-3">{step.kicker}</div>
                <h3 className="text-2xl font-bold text-[#E6EDF7] mb-3">{step.title}</h3>
                <p className="text-[#9FB3C8] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Architecture */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#00D1C7] uppercase tracking-[0.3em]">Signal to revenue loop</p>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">Every signal is scored, validated, and routed.</h2>
            <p className="mt-4 text-[#9FB3C8] text-lg max-w-3xl mx-auto">
              Build a defensible revenue engine with governed data pipelines, enrichment, and outcome-based learning.
            </p>
          </div>
          <div className="grid lg:grid-cols-4 gap-6">
            {pipelineStages.map((stage, idx) => (
              <div key={stage.title} className="p-6 rounded-2xl border border-[#1F2A3D] bg-[#0B1220]/70">
                <div className="text-sm text-[#72819A] mb-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full border border-[#1F2A3D] text-xs">{idx + 1}</span>
                  {stage.kicker}
                </div>
                <stage.icon className="w-10 h-10 text-[#00D1C7] mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{stage.title}</h3>
                <p className="text-[#9FB3C8] text-sm leading-relaxed">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section id="live-demo" className="py-24 px-4 bg-[#050B17] border-y border-[#0E172B]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-[#00D1C7] uppercase tracking-[0.3em]">Try before you buy</p>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">Launch the production-grade sandbox.</h2>
            <p className="mt-4 text-lg text-[#9FB3C8]">
              Spin up a live run on real buyer data without touching your CRM. Select your team profile and see how DEKES prioritizes accounts, enriches contacts, and ships them to your reps automatically.
            </p>
            <ul className="mt-8 space-y-4 text-[#9FB3C8]">
              {demoBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00D1C7] mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/demo" className="px-6 py-3 rounded-2xl bg-[#00D1C7] text-[#041022] font-semibold flex items-center gap-2">
                Launch Live Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/signup" className="px-6 py-3 rounded-2xl border border-[#1F6BFF] text-[#E6EDF7] font-semibold">
                Create Account
              </Link>
            </div>
          </div>
          <div className="p-8 rounded-3xl border border-[#1F2A3D] bg-[#090F1E]/80 backdrop-blur-xl">
            <div className="flex gap-2 mb-6">
              {personaOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPersona(option.key)}
                  className={`flex-1 px-4 py-2 rounded-2xl text-sm font-semibold transition ${
                    persona === option.key ? 'bg-[#1F6BFF] text-white' : 'bg-[#0E172B] text-[#9FB3C8] border border-[#1F2A3D]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#0B1424] border border-[#1F2A3D]">
                <p className="text-sm text-[#72819A]">Objective</p>
                <p className="text-xl font-semibold text-white mt-1">{activePersona.objective}</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0B1424] border border-[#1F2A3D]">
                <p className="text-sm text-[#72819A]">Sample output</p>
                <p className="text-[#E6EDF7] text-base leading-relaxed">{activePersona.output}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activePersona.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs border border-[#1F2A3D] text-[#9FB3C8]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#0B1424] border border-[#1F2A3D]">
                <p className="text-sm text-[#72819A]">What happens next</p>
                <p className="text-[#E6EDF7] text-base">{activePersona.next}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Proof */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {proofPoints.map((point) => (
            <div key={point.title} className="p-6 rounded-2xl border border-[#1F2A3D] bg-[#0B1220]/70">
              <point.icon className="w-10 h-10 text-[#1F6BFF]" />
              <h3 className="mt-4 text-2xl font-semibold text-white">{point.title}</h3>
              <p className="mt-3 text-[#9FB3C8]">{point.description}</p>
              <div className="mt-4 text-sm text-[#00D1C7] font-semibold">{point.result}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-[#030712]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#E6EDF7] mb-6 tracking-tight">
              Pricing
            </h2>
            <p className="text-xl text-[#9FB3C8]">
              Close one deal and this pays for itself.
            </p>
          </div>

          <div className="flex items-center justify-center mb-10">
            <div className="inline-flex items-center gap-2 p-1 bg-[#121A2B] border border-[#1F2A3D] rounded-xl">
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${billing === 'monthly' ? 'bg-[#1F6BFF] text-white' : 'text-[#9FB3C8] hover:text-[#E6EDF7]'}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling('annual')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${billing === 'annual' ? 'bg-[#1F6BFF] text-white' : 'text-[#9FB3C8] hover:text-[#E6EDF7]'}`}
              >
                Annual
              </button>
              <div className="px-3 py-1 text-xs font-semibold text-[#00D1C7]">Save 20%</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl border ${plan.popular ? 'bg-[#121A2B] border-[#1F6BFF] md:scale-105' : 'bg-[#121A2B] border-[#1F2A3D]'}`}
              >
                {plan.popular && (
                  <div className="inline-block px-3 py-1 bg-[#1F6BFF] text-white text-xs font-semibold rounded-full mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-[#E6EDF7] mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-5xl font-bold text-[#E6EDF7]">{plan.priceLabel}</span>
                  <span className="text-[#9FB3C8] ml-2">{plan.priceMeta}</span>
                </div>
                <div className="text-sm text-[#9FB3C8] mb-6">{plan.highlight}</div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-[#00D1C7] flex-shrink-0 mt-0.5" />
                      <span className="text-[#E6EDF7]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition ${plan.popular ? 'bg-[#1F6BFF] hover:bg-[#1F6BFF]/90 text-white' : 'bg-[#0B1220] hover:bg-[#0B1220]/80 border border-[#1F2A3D] text-[#E6EDF7]'}`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#00D1C7]">Ready for revenue control?</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-[#E6EDF7] mb-6 tracking-tight">
            Turn intent noise into booked revenue.
          </h2>
          <p className="text-xl text-[#9FB3C8] mb-12 leading-relaxed">
            Launch your first signal stream in minutes, invite the team, and route qualified buyers directly into your existing workflow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/demo" className="inline-flex items-center space-x-2 px-8 py-4 bg-[#00D1C7] hover:bg-[#00B5AC] text-[#041022] rounded-xl font-semibold text-lg transition group">
              <span>Launch Live Demo</span>
              <PlayCircle className="w-5 h-5" />
            </Link>
            <Link href="/auth/signup" className="inline-flex items-center space-x-2 px-8 py-4 border border-[#1F6BFF] text-white rounded-xl font-semibold text-lg transition group">
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#1F2A3D]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-[#121A2B] border border-[#1F2A3D] rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-[#00D1C7]" />
              </div>
              <span className="text-lg font-bold text-[#E6EDF7]">DEKES</span>
            </div>
            <div className="text-sm text-[#9FB3C8]">
              © 2024 DEKES. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Brain,
    title: 'Signal Capture',
    description: 'Continuously senses buyer intent signals across public web surfaces before they consolidate into obvious demand.'
  },
  {
    icon: Target,
    title: 'Multi-Layer Validation',
    description: 'Validates intent with multi-signal scoring to reduce false positives and keep your pipeline clean.'
  },
  {
    icon: Zap,
    title: 'Buyer Delivery',
    description: 'Delivers validated buyers to the right workflow so reps spend time closing, not searching.'
  },
  {
    icon: Shield,
    title: 'Enterprise Controls',
    description: 'Structured scoring and operational controls designed to run as dependable infrastructure, not a hobby tool.'
  },
  {
    icon: TrendingUp,
    title: 'Revenue Feedback Loop',
    description: 'Improve targeting with real outcomes: what closed, what stalled, and what never qualified.'
  },
  {
    icon: Users,
    title: 'Sales-Ready Output',
    description: 'Intent signals, context, and enrichment packaged for immediate outreach and faster time-to-first-meeting.'
  }
]

const howItWorks = [
  {
    kicker: '1',
    title: 'Signal Capture',
    description: 'DEKES captures early buyer-intent signals across the web, before competitors see the pattern.',
  },
  {
    kicker: '2',
    title: 'Multi-Layer Validation',
    description: 'We validate intent using multiple signals to reduce noise and surface only real buying behavior.',
  },
  {
    kicker: '3',
    title: 'Buyer Delivery',
    description: 'Validated buyers are delivered to your pipeline with context, scoring, and enrichment for fast outreach.',
  },
]

type PersonaKey = 'revenue' | 'sales' | 'marketing'

type PersonaDemo = {
  objective: string
  output: string
  tags: string[]
  next: string
}

type HeroSignal = {
  icon: LucideIcon
  label: string
  value: string
  meta: string
}

const heroSignals: HeroSignal[] = [
  {
    icon: Sparkles,
    label: 'Trigger: Security audit',
    value: 'CISO searching for zero-trust partners',
    meta: 'Signal strength 94 • Mentioned budget window in last 48h',
  },
  {
    icon: ShieldCheck,
    label: 'Validation',
    value: 'Multi-signal proof packet generated',
    meta: 'Combines job posts, PR, and dark funnel chatter',
  },
  {
    icon: BarChart3,
    label: 'Revenue route',
    value: 'Synced to Salesforce intent queue',
    meta: 'Assigned to Strategic AE • SLA 2h',
  },
]

const heroStats = [
  {
    label: 'Qualified buyers delivered',
    value: '12,480',
    detail: 'Across SaaS, fintech, cybersecurity, and AI rollouts',
  },
  {
    label: 'Average signal accuracy',
    value: '92%',
    detail: 'Validation includes proof artifacts & intent scoring',
  },
  {
    label: 'Pipeline lift after 60 days',
    value: '3.2x',
    detail: 'Attributed revenue growth across customers',
  },
  {
    label: 'Security & governance coverage',
    value: '100%',
    detail: 'Every run audited and role-based access controlled',
  },
]

const trustedLogos = ['CARBON', 'STRATUM', 'ORBITAL', 'NIMBUS', 'FLEET', 'HALO']

const proofMetrics = [
  { caption: 'Signal Coverage', value: '48+', label: 'Unique web sources monitored' },
  { caption: 'Sales Activation', value: '12 min', label: 'Avg. time to first contact' },
  { caption: 'Intent Proof', value: '5.4', label: 'Signals validated per buyer' },
  { caption: 'Revenue Lift', value: '$4.8M', label: 'Net new pipeline created/quarter' },
]

const pipelineStages: Array<{
  icon: LucideIcon
  kicker: string
  title: string
  description: string
}> = [
  {
    icon: Sparkles,
    kicker: 'Signal capture',
    title: 'Sense hidden intent',
    description: 'Groq-powered models monitor narratives, job posts, PR, and financial signals to find hidden demand spikes.',
  },
  {
    icon: ShieldCheck,
    kicker: 'Validation & compliance',
    title: 'Score & de-risk',
    description: 'Multi-signal scoring with human-readable proof packets, governance controls, and audit-ready documentation.',
  },
  {
    icon: LineChart,
    kicker: 'Activation',
    title: 'Route to revenue',
    description: 'Sync enriched buyers with Salesforce, HubSpot, and custom webhooks so reps receive prioritized work instantly.',
  },
  {
    icon: Globe,
    kicker: 'Learning loop',
    title: 'Optimize outcomes',
    description: 'Closed-won/closed-lost feedback automatically retrains scoring weights and doubles down on profitable signals.',
  },
]

const demoBenefits = [
  'See real, anonymized buyer signals streaming live',
  'Switch personas to preview revenue, sales, or marketing automation',
  'Understand scoring logic, proof artifacts, and governance controls',
  'Export enriched leads into your outbound motion instantly',
]

const personaOptions: Array<{ key: PersonaKey; label: string }> = [
  { key: 'revenue', label: 'Revenue Ops' },
  { key: 'sales', label: 'Sales Leadership' },
  { key: 'marketing', label: 'Growth Marketing' },
]

const personaDemo: Record<PersonaKey, PersonaDemo> = {
  revenue: {
    objective: 'Create a governed buyer-intent feed that finance will approve.',
    output:
      '12 accounts prioritized for Q2 expansion with proof artifacts attached. Accounts synced to Salesforce “Intent - Tier 1” queue.',
    tags: ['Governance', 'Salesforce', 'Audit Trail'],
    next: 'Send auto-generated compliance summary to CRO + RevOps inbox.',
  },
  sales: {
    objective: 'Fill rep pipelines with net-new, sales-ready buyers.',
    output:
      '8 verified buyers flagged with urgency score >92, mapped to owning reps, enriched with champion contact info.',
    tags: ['Rep Routing', 'Urgency Score', 'Contact Enrichment'],
    next: 'Notify responsible reps inside Slack with recommended outreach sequence.',
  },
  marketing: {
    objective: 'Fuel ABM plays with live-intent cohorts.',
    output:
      'Marketing list of 25 accounts showing active replatform research, bundled with messaging angles + creative brief.',
    tags: ['ABM', 'Creative Brief', 'Campaign Ready'],
    next: 'Sync cohort to HubSpot, trigger paid media exclusion/inclusion rules.',
  },
}

const proofPoints: Array<{
  icon: LucideIcon
  title: string
  description: string
  result: string
}> = [
  {
    icon: Sparkles,
    title: 'Intent infrastructure',
    description: 'Governed ingest, scoring, enrichment, and routing built for security-heavy teams.',
    result: 'SOC2-aligned pipelines with RBAC & audit logging.',
  },
  {
    icon: BarChart3,
    title: 'Measurable revenue lift',
    description: 'Every signal is tied to closed-won or lost outcomes so budgets track back to revenue.',
    result: '+42% lead-to-meeting rate in 45 days.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by default',
    description: 'Encrypted storage, scoped API keys, and rate-limited webhooks ensure production readiness.',
    result: 'Zero data incidents across 18 months of enterprise usage.',
  },
]
