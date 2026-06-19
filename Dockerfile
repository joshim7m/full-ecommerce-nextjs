# =============================================================================
# Baby Planet BD — Frontend Dockerfile (Next.js 16 standalone)
# -----------------------------------------------------------------------------
# Multi-stage build:
#   1. deps    — install dependencies
#   2. builder — build the standalone Next.js app
#   3. runner  — minimal production image (~120MB)
# =============================================================================

FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install bun for faster installs
RUN npm install -g bun

# Copy lockfile + package.json first (cache layer)
COPY package.json bun.lock* ./
COPY prisma ./prisma

# Install deps
RUN bun install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 2: builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g bun

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js standalone output
RUN bun run build

# -----------------------------------------------------------------------------
# Stage 3: runner (production image)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build (includes only what's needed)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check (Next.js responds on /)
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
