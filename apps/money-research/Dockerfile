# syntax=docker/dockerfile:1
# docker build -f apps/money-research/Dockerfile -t qhr-profile-money-research .

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 py3-pip git

FROM base AS deps
WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
COPY apps/money-research/package.json ./apps/money-research/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    set -e; \
    for attempt in 1 2 3 4 5; do \
      pnpm install --frozen-lockfile --filter @profile/money-research... --ignore-scripts && break; \
      echo "pnpm install attempt ${attempt} failed, retrying..."; \
      sleep 15; \
    done

FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/money-research/node_modules ./apps/money-research/node_modules

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json ./
COPY apps/money-research ./apps/money-research

RUN pip3 install --no-cache-dir -r apps/money-research/demo/requirements.txt

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-money-research
ENV NEXT_PUBLIC_BASE_PATH=/money-research

RUN pnpm --filter @profile/money-research build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-money-research

RUN pip3 install --no-cache-dir --break-system-packages \
    requests>=2.31.0 xhs>=0.2.13 lxml>=5.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p apps/money-research/.next-money-research
RUN chown -R nextjs:nodejs apps

COPY --from=builder --chown=nextjs:nodejs /app/apps/money-research/.next-money-research/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/money-research/.next-money-research/static ./apps/money-research/.next-money-research/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/money-research/demo ./apps/money-research/demo

RUN rm -rf /app/apps/money-research/.next-money-research/cache /tmp/*

USER nextjs

EXPOSE 3004

ENV PORT=3004
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/money-research/server.js"]
