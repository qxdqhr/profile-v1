# syntax=docker/dockerfile:1
# 构建上下文：仓库根目录
#   docker build -f apps/teach-hub/Dockerfile -t qhr-profile-teach-hub .

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
RUN apk add --no-cache git
RUN git config --global url."https://github.com/".insteadOf "git@github.com:"
WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
COPY packages ./packages
COPY apps/teach-hub/package.json ./apps/teach-hub/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    set -e; \
    for attempt in 1 2 3 4 5; do \
      pnpm install --frozen-lockfile --filter @profile/teach-hub... --ignore-scripts && break; \
      echo "pnpm install attempt ${attempt} failed, retrying..."; \
      sleep 15; \
    done

FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/teach-hub/node_modules ./apps/teach-hub/node_modules
COPY --from=deps /app/packages ./packages

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json ./
COPY config ./config
COPY packages ./packages
COPY apps/web/src/modules ./apps/web/src/modules
COPY apps/teach-hub ./apps/teach-hub

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-teach-hub

RUN pnpm --filter @profile/teach-hub build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-teach-hub

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p apps/teach-hub/.next-teach-hub
RUN chown -R nextjs:nodejs apps

COPY --from=builder --chown=nextjs:nodejs /app/apps/teach-hub/.next-teach-hub/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/teach-hub/.next-teach-hub/static ./apps/teach-hub/.next-teach-hub/static

RUN rm -rf /app/apps/teach-hub/.next-teach-hub/cache /tmp/*

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/teach-hub/server.js"]
