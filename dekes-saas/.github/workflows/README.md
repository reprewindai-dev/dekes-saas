# DKS SaaS - GitHub Actions CI Documentation

## Overview

Production-grade GitHub Actions for DKS SaaS that catch broken auth flows, app-shell issues, and regressions before merge or deployment.

## Workflow File

### `ci.yml` - DKS SaaS CI Pipeline
**Triggers**: Pull requests, pushes to main, manual dispatch

**Jobs**:
- **build-and-verify**: Type checking, Prisma generation, build validation, and lead-intelligence verification
- **smoke-public-routes**: Local production smoke test with database

## Environment Configuration

### Required for Production
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your_production_jwt_secret
NEXT_PUBLIC_APP_URL=https://dekes-saas.onrender.com
CO2ROUTER_API_URL=https://ecobe-engineclaude.onrender.com
CO2ROUTER_API_KEY=dk_production_integration_key_2024
CO2ROUTER_INTEGRATION_ENABLED=true
SERPAPI_API_KEY=your_serpapi_key
```

### Documented in `.env.example`
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
CO2ROUTER_API_URL=http://localhost:8080
CO2ROUTER_API_KEY=your_api_key_here
CO2ROUTER_INTEGRATION_ENABLED=true
SERPAPI_API_KEY=your_serpapi_key
```

## Success Criteria

- TypeScript compilation passes
- Prisma client generation passes
- Production build passes
- Lead intelligence verification passes
- Public routes render in smoke tests
- Render deployment variables stay aligned with the current runtime
