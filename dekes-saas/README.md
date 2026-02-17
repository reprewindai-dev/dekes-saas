# DEKES - AI-Powered Lead Generation SaaS

Production-grade lead generation platform with buyer-intent detection, multi-signal scoring, and learning loop optimization.

## Features

- 🎯 **AI Intent Detection** - 92% accuracy buyer vs seller classification
- 📊 **Multi-Signal Scoring** - Intent, urgency, budget, fit analysis
- ⚡ **Real-Time Discovery** - Continuous scanning across web sources
- 🛡️ **Proof Extraction** - Automated validation of genuine buying intent
- 📈 **Learning Loop** - Self-improving system from outcome feedback
- 👥 **Contact Enrichment** - Email, social profiles, company data
- 💳 **Stripe Billing** - Subscription management with tiered pricing
- 🔐 **Multi-Tenancy** - Organization-based access control
- 🚀 **Production Ready** - Full auth, rate limiting, monitoring

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT, bcrypt
- **Payments**: Stripe
- **Search**: SerpAPI integration
- **AI**: Groq LLM for intent classification

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb dekes_saas

# Set DATABASE_URL in .env
cp .env.example .env

# Generate Prisma client and push schema
npm run prisma:generate
npx prisma db push
```

### 3. Configure Environment

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dekes_saas"
JWT_SECRET="your-jwt-secret-here"
SESSION_SECRET="your-session-secret-here"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
SERPAPI_API_KEY="your-serpapi-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Set Up Stripe Webhooks

```bash
# Terminal 1: Run app
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Production Deployment

### Docker

```bash
docker build -t dekes-saas .
docker run -p 3000:3000 --env-file .env dekes-saas
```

### Vercel

```bash
vercel --prod
```

## Pricing Plans

- **Starter**: $99/mo - 100 leads, 5 queries
- **Professional**: $299/mo - 500 leads, 20 queries, advanced features
- **Enterprise**: $999/mo - Unlimited, API access, white-label

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Billing
- `POST /api/stripe/create-checkout` - Create Stripe checkout
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Leads
- `GET /api/leads` - List leads
- `POST /api/leads/run` - Generate new leads
- `POST /api/leads/:id/outcome` - Record outcome

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with 7-day expiration
- Rate limiting on API routes
- SQL injection prevention (Prisma)
- CSRF protection
- Secure session management
- Input validation with Zod
- Organization-based access control

## Monitoring & Analytics

- Stripe dashboard for billing metrics
- Database query logging
- Error tracking
- User session tracking
- Lead conversion analytics

## Support

- Email: support@dekes.com
- Documentation: https://docs.dekes.com
- Status: https://status.dekes.com

## License

Proprietary - All Rights Reserved

---

Built with ❤️ by the DEKES team
