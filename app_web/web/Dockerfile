# syntax=docker/dockerfile:1
# 构建上下文：仓库根目录
#   docker build -f app_web/web/Dockerfile -t qhr-profile-web .

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
RUN apk add --no-cache git
RUN git config --global url."https://github.com/".insteadOf "git@github.com:"
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY packages/sa2kit ./packages/sa2kit
COPY packages/sa2kit-ui ./packages/sa2kit-ui
COPY app_web/web/package.json ./app_web/web/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline --filter @profile/web... --ignore-scripts

FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app_web/web/node_modules ./app_web/web/node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/packages/sa2kit ./packages/sa2kit
COPY --from=deps /app/packages/sa2kit-ui ./packages/sa2kit-ui

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json ./
COPY config ./config
COPY packages ./packages
COPY packages/sa2kit ./packages/sa2kit
COPY packages/sa2kit-ui ./packages/sa2kit-ui
COPY app_web/web ./app_web/web

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_CALENDAR_URL=/calendar
ENV NEXT_PUBLIC_TEACH_HUB_URL=/teach-hub

RUN pnpm --filter @sa2kit-ui/shared build \
 && pnpm --filter @sa2kit-ui/react build \
 && SA2KIT_WITH_BUSINESS=1 pnpm --filter sa2kit run build \
 && pnpm --filter @profile/web build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/app_web/web/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/app_web/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/app_web/web/.next/static ./app_web/web/.next/static

RUN rm -rf /app/.next/cache /tmp/*

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "app_web/web/server.js"]
