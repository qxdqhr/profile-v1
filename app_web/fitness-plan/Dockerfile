# syntax=docker/dockerfile:1
# 构建上下文：仓库根目录
#   docker build -f app_web/fitness-plan/Dockerfile -t qhr-profile-fitness-plan .

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
RUN apk add --no-cache git
RUN git config --global url."https://github.com/".insteadOf "git@github.com:"
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY host ./host
COPY packages/sa2kit ./packages/sa2kit
COPY packages/sa2kit-ui ./packages/sa2kit-ui
COPY app_web/fitness-plan/package.json ./app_web/fitness-plan/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    set -e; \
    for attempt in 1 2 3 4 5; do \
      pnpm install --frozen-lockfile --filter @profile/fitness-plan... --ignore-scripts && break; \
      echo "pnpm install attempt ${attempt} failed, retrying..."; \
      sleep 15; \
    done

FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app_web/fitness-plan/node_modules ./app_web/fitness-plan/node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/host ./host
COPY --from=deps /app/packages/sa2kit ./packages/sa2kit
COPY --from=deps /app/packages/sa2kit-ui ./packages/sa2kit-ui

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json ./
COPY config ./config
COPY packages ./packages
COPY host ./host
COPY packages/sa2kit ./packages/sa2kit
COPY packages/sa2kit-ui ./packages/sa2kit-ui
# @profile/db schema 仍聚合 app_web/web 模块表定义
COPY app_web/web/src/modules ./app_web/web/src/modules
COPY app_web/fitness-plan ./app_web/fitness-plan

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-fitness-plan
ENV NEXT_PUBLIC_BASE_PATH=/fitness-plan

ENV SA2KIT_SKIP_PREPARE=1
ENV SA2KIT_SKIP_DTS=1
COPY deploy/scripts/ci/docker-build-sa2kit-libs.sh ./deploy/scripts/ci/docker-build-sa2kit-libs.sh
RUN sh deploy/scripts/ci/docker-build-sa2kit-libs.sh \
 && pnpm --filter @profile/fitness-plan build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-fitness-plan

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p app_web/fitness-plan/.next-fitness-plan
RUN chown -R nextjs:nodejs app_web

COPY --from=builder --chown=nextjs:nodejs /app/app_web/fitness-plan/.next-fitness-plan/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/app_web/fitness-plan/.next-fitness-plan/static ./app_web/fitness-plan/.next-fitness-plan/static

RUN rm -rf /app/app_web/fitness-plan/.next-fitness-plan/cache /tmp/*

USER nextjs

EXPOSE 3009

ENV PORT=3009
ENV HOSTNAME="0.0.0.0"

CMD ["node", "app_web/fitness-plan/server.js"]
