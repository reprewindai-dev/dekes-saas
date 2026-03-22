FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate && npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user with dynamic UID/GID to avoid conflicts
RUN addgroup --system --gid 1001 nodejs || true
RUN adduser --system --uid 1001 nextjs || true

# Validate user creation
RUN id nextjs 2>/dev/null || (echo "Failed to create nextjs user" && exit 1)

# Copy standalone output + static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./.next/static

# Copy prisma schema + migrations + engine binaries + CLI for runtime migrate deploy
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Set secure permissions
RUN chown -R nextjs:nodejs /app && \
    chmod -R 755 /app && \
    find /app -type f -name '*.js' -exec chmod 644 {} \; && \
    find /app -type f -name '*.json' -exec chmod 644 {} \;

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use more secure command with proper error handling
CMD ["sh", "-c", "if [ \"$(id -u)\" = \"0\" ]; then echo 'Running as root is not allowed'; exit 1; fi; npx prisma migrate deploy || echo 'Migration skipped or failed'; node server.js"]
=======
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

<<<<<<< HEAD
CMD ["node", "server.js"]
>>>>>>> b4a3aaa (Fix Prisma SSL library error)
=======
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.setTimeout(5000, () => process.exit(1));"

CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma || echo 'Migration skipped, continuing...'; node server.js"]
>>>>>>> e7c8e3a (fix: dekes runtime, auth flow, env validation, and health endpoint)
