# syntax=docker/dockerfile:1
# 构建上下文：仓库根目录
#   docker build -f web/calendar/Dockerfile -t qhr-profile-calendar .

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
RUN apk add --no-cache git
RUN git config --global url."https://github.com/".insteadOf "git@github.com:"
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
COPY packages ./packages
COPY npm ./npm
COPY web/calendar/package.json ./web/calendar/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    set -e; \
    for attempt in 1 2 3 4 5; do \
      pnpm install --frozen-lockfile --filter @profile/calendar... --ignore-scripts && break; \
      echo "pnpm install attempt ${attempt} failed, retrying..."; \
      sleep 15; \
    done

FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/web/calendar/node_modules ./web/calendar/node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/npm ./npm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json ./
COPY config ./config
COPY packages ./packages
COPY npm ./npm
# @profile/db schema 仍聚合 web/web 模块表定义
COPY web/web/src/modules ./web/web/src/modules
COPY web/calendar ./web/calendar

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-calendar
ENV NEXT_PUBLIC_BASE_PATH=/calendar

RUN pnpm --filter @profile/calendar build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-calendar

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p web/calendar/.next-calendar
RUN chown -R nextjs:nodejs web

COPY --from=builder --chown=nextjs:nodejs /app/web/calendar/.next-calendar/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/calendar/.next-calendar/static ./web/calendar/.next-calendar/static

RUN rm -rf /app/web/calendar/.next-calendar/cache /tmp/*

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "web/calendar/server.js"]
