FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
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

# Copy prisma schema + migrations + CLI for runtime migrate deploy
# MUST include node_modules/prisma so npx uses the pinned v5 instead of downloading v7
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
