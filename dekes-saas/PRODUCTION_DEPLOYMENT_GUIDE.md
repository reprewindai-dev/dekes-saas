# DEKES Production Deployment Guide

## Services

- `dekes-saas` on Render
- `ecobe-engineclaude` on Render
- `co2-router-dashboard` on Render

## Render runtime

- Web service runs from the repository Dockerfile.
- Health check path: `/api/health`
- Search provider is `SERPAPI_API_KEY`.
- `SEARCH_PROVIDER=serpapi` is the default primary provider.
- Fallback search can use `SEARCH_FALLBACK=apify` if you choose to keep it enabled.

## Production URLs

- DKS SaaS: `https://dekes-saas.onrender.com`
- CO2Router engine: `https://ecobe-engineclaude.onrender.com`
- CO2Router dashboard: `https://co2-router-dashboard.onrender.com`

## DKS SaaS environment

- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SERPAPI_API_KEY`
- `CO2ROUTER_API_URL`
- `CO2ROUTER_API_KEY`
- `CO2ROUTER_INTEGRATION_ENABLED`

## Verification

- `GET /api/health`
- `POST /api/leads/run`
- `GET /api/dashboard/ecobe-signals`
- `POST /api/auth/login`
- `node scripts/verify-production-deployment.js`

## Notes

- Keep Render as the single deployment target for the SaaS app.
- Keep SerpAPI as the search provider for real lead generation runs.
