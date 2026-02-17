"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Target, Zap, Shield, TrendingUp, Users, Brain } from 'lucide-react'

export default function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

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
          'Basic intent scoring',
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
          'Advanced intent detection',
          'Multi-signal scoring',
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

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#E6EDF7]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B1220]/90 backdrop-blur-xl border-b border-[#1F2A3D]">
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
              <Link href="#pricing" className="text-[#9FB3C8] hover:text-[#E6EDF7] transition">Pricing</Link>
              <Link href="/auth/login" className="text-[#9FB3C8] hover:text-[#E6EDF7] transition">Login</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-[#1F6BFF] hover:bg-[#1F6BFF]/90 text-white rounded-lg transition font-medium">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#121A2B] border border-[#1F2A3D] rounded-full mb-8">
            <Zap className="w-4 h-4 text-[#00D1C7]" />
            <span className="text-sm text-[#9FB3C8] font-medium">Buyer-Intent Intelligence Infrastructure</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-[#E6EDF7] mb-6 leading-tight tracking-tight">
            Detect Buyer Intent
            <br />
            <span className="text-[#00D1C7]">Before It Surfaces.</span>
          </h1>

          <p className="text-xl text-[#9FB3C8] max-w-3xl mx-auto mb-12 leading-relaxed">
            DEKES senses high-intent signals across the web and delivers validated buyers directly to your pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="px-8 py-4 bg-[#1F6BFF] hover:bg-[#1F6BFF]/90 text-white rounded-xl font-semibold text-lg transition flex items-center space-x-2 group">
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link href="#how-it-works" className="px-8 py-4 bg-[#121A2B] hover:bg-[#121A2B]/80 border border-[#1F2A3D] text-[#E6EDF7] rounded-xl font-semibold text-lg transition">
              See How It Works
            </Link>
          </div>

          <div className="mt-10 text-sm text-[#9FB3C8]">
            No credit card required · 14-day trial · Cancel anytime
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-[#1F2A3D] bg-[#121A2B]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#E6EDF7] mb-2">10K+</div>
              <div className="text-[#9FB3C8]">Leads Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#E6EDF7] mb-2">92%</div>
              <div className="text-[#9FB3C8]">Intent Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#E6EDF7] mb-2">3.2x</div>
              <div className="text-[#9FB3C8]">Pipeline Lift</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#E6EDF7] mb-2">500+</div>
              <div className="text-[#9FB3C8]">Teams Activated</div>
            </div>
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

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-[#0B1220]">
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
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#E6EDF7] mb-6 tracking-tight">
            Stop Guessing. Start Detecting.
          </h2>
          <p className="text-xl text-[#9FB3C8] mb-12 leading-relaxed">
            Activate your first buyer-intent stream in minutes.
          </p>
          <Link href="/auth/signup" className="inline-flex items-center space-x-2 px-8 py-4 bg-[#1F6BFF] hover:bg-[#1F6BFF]/90 text-white rounded-xl font-semibold text-lg transition group">
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
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
