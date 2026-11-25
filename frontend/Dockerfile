# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build Next.js standalone bundle
FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:5066/api
ARG NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:5066
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_ENABLE_DEMO_MODULES=false
ARG NEXT_PUBLIC_IMAGE_UNOPTIMIZED=true

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_BACKEND_ORIGIN=$NEXT_PUBLIC_BACKEND_ORIGIN \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_ENABLE_DEMO_MODULES=$NEXT_PUBLIC_ENABLE_DEMO_MODULES \
    NEXT_PUBLIC_IMAGE_UNOPTIMIZED=$NEXT_PUBLIC_IMAGE_UNOPTIMIZED \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p public && npm run build

# Stage 3: Minimal production runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
