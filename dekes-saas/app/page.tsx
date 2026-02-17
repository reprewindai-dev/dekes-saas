import Link from 'next/link'
import { ArrowRight, CheckCircle2, Target, Zap, Shield, TrendingUp, Users, Brain } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DEKES</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-slate-300 hover:text-white transition">Features</Link>
              <Link href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</Link>
              <Link href="/auth/login" className="text-slate-300 hover:text-white transition">Login</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">AI-Powered Lead Generation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Find Buyer-Intent Leads
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Before Your Competition
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
            DEKES automatically discovers, scores, and validates high-intent leads across the web.
            Stop wasting time on cold outreach. Target buyers who are actively searching for your solution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition flex items-center space-x-2 group">
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link href="#demo" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-lg transition">
              Watch Demo
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-slate-400">Leads Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">92%</div>
              <div className="text-slate-400">Intent Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">3.2x</div>
              <div className="text-slate-400">Conversion Lift</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-slate-400">Active Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The Complete Lead Generation Engine
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Everything you need to find, validate, and convert high-intent leads into customers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-400">
              Choose the plan that fits your growth stage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div key={idx} className={`p-8 rounded-2xl border ${plan.popular ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500 scale-105' : 'bg-slate-900/50 border-slate-800'}`}>
                {plan.popular && (
                  <div className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-slate-400 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`block w-full py-3 rounded-xl font-semibold text-center transition ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to 10x Your Lead Generation?
          </h2>
          <p className="text-xl text-slate-400 mb-12">
            Join hundreds of businesses finding better leads faster with DEKES
          </p>
          <Link href="/auth/signup" className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition group">
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">DEKES</span>
            </div>
            <div className="text-sm text-slate-500">
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
    title: "AI Intent Detection",
    description: "Advanced NLP classifies buyer vs seller intent with 92% accuracy, filtering out noise before it reaches you."
  },
  {
    icon: Target,
    title: "Multi-Signal Scoring",
    description: "Proprietary scoring engine analyzes intent depth, urgency, budget signals, and fit to surface only qualified leads."
  },
  {
    icon: Zap,
    title: "Real-Time Discovery",
    description: "Continuously scans forums, social media, and professional networks to catch buyers at the exact moment they're searching."
  },
  {
    icon: Shield,
    title: "Proof Extraction",
    description: "Automatically identifies and extracts proof points from lead content to validate genuine buying intent."
  },
  {
    icon: TrendingUp,
    title: "Learning Loop",
    description: "Self-improving system that learns from your wins and losses to continuously refine lead quality over time."
  },
  {
    icon: Users,
    title: "Contact Enrichment",
    description: "Enriches leads with email addresses, social profiles, and company data for immediate outreach readiness."
  }
]

const pricingPlans = [
  {
    name: "Starter",
    price: 99,
    popular: false,
    features: [
      "100 qualified leads/month",
      "5 active search queries",
      "Intent classification",
      "Basic scoring",
      "Email support"
    ]
  },
  {
    name: "Professional",
    price: 299,
    popular: true,
    features: [
      "500 qualified leads/month",
      "20 active search queries",
      "Advanced intent detection",
      "Multi-signal scoring",
      "Contact enrichment",
      "Learning loop optimization",
      "Priority support"
    ]
  },
  {
    name: "Enterprise",
    price: 999,
    popular: false,
    features: [
      "Unlimited qualified leads",
      "Unlimited search queries",
      "Custom scoring weights",
      "White-label options",
      "API access",
      "Dedicated success manager",
      "SLA guarantee"
    ]
  }
]
