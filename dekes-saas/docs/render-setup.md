# Render Setup

## What this covers

- Render deployment for DEKES SaaS
- Render-hosted Web Service
- Render-friendly environment variables
- ECOBE and search integration defaults

## Render service

Use the repository `render.yaml` as the deployment blueprint.

### Service settings

- Type: Web Service
- Runtime: Docker
- Health check path: `/api/health`
- Build source: `Dockerfile`
- Auto deploy: on

## Required environment variables

- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SERPAPI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PROFESSIONAL`
- `STRIPE_PRICE_ENTERPRISE`

## Optional environment variables

- `APIFY_TOKEN`
- `CO2ROUTER_API_URL`
- `CO2ROUTER_API_KEY`
- `CO2ROUTER_INTEGRATION_ENABLED`
- `ECOBE_ENGINE_URL`
- `ECOBE_ENGINE_API_KEY`
- `ECOBE_API_BASE_URL`
- `ECOBE_API_KEY`
- `DEKES_API_KEY`
- `ECOBE_OPTIMIZE_URL`
- `ECOBE_REPORT_URL`
- `ECOBE_ANALYTICS_URL`
- `ECOBE_ROUTE_BASE_URL`
- `NEXT_PUBLIC_ECOBE_DASHBOARD_URL`
- `ECOBE_WEBHOOK_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `UPSTASH_VECTOR_REST_URL`
- `UPSTASH_VECTOR_REST_TOKEN`
- `OPENAI_API_KEY`

## Integration defaults

- Search provider: `serpapi`
- Search fallback: optional `apify`
- ECOBE URLs: Render-hosted `ecobe-engineclaude.onrender.com`
- Public app URL: `dekes-saas.onrender.com`

## Verification

- Open `/api/health`
- Confirm the app reports healthy database connectivity
- Confirm the settings UI shows the Render ECOBE URL by default
- Run the production verification script against the Render URLs
