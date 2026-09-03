# syntax=docker/dockerfile:1
# docker build -f app_web/showmasterpiece/Dockerfile -t qhr-profile-showmasterpiece .

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
COPY app_web/showmasterpiece/package.json ./app_web/showmasterpiece/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    set -e; \
    for attempt in 1 2 3 4 5; do \
      pnpm install --frozen-lockfile --filter @profile/showmasterpiece... --ignore-scripts && break; \
      echo "pnpm install attempt ${attempt} failed, retrying..."; \
      sleep 15; \
    done

FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app_web/showmasterpiece/node_modules ./app_web/showmasterpiece/node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/packages/sa2kit ./packages/sa2kit
COPY --from=deps /app/packages/sa2kit-ui ./packages/sa2kit-ui

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json ./
COPY config ./config
COPY packages ./packages
COPY packages/sa2kit ./packages/sa2kit
COPY packages/sa2kit-ui ./packages/sa2kit-ui
# @profile/db schema 仍聚合 app_web/web 模块表定义
COPY app_web/web/src/modules ./app_web/web/src/modules
COPY app_web/showmasterpiece ./app_web/showmasterpiece

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-showmasterpiece
ENV NEXT_PUBLIC_BASE_PATH=/showmasterpiece

RUN pnpm --filter @sa2kit-ui/shared build \
 && pnpm --filter @sa2kit-ui/react build \
 && SA2KIT_WITH_BUSINESS=1 pnpm --filter sa2kit run build \
 && pnpm --filter @profile/showmasterpiece build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-showmasterpiece

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p app_web/showmasterpiece/.next-showmasterpiece
RUN chown -R nextjs:nodejs app_web

COPY --from=builder --chown=nextjs:nodejs /app/app_web/showmasterpiece/.next-showmasterpiece/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/app_web/showmasterpiece/.next-showmasterpiece/static ./app_web/showmasterpiece/.next-showmasterpiece/static

RUN rm -rf /app/app_web/showmasterpiece/.next-showmasterpiece/cache /tmp/*

USER nextjs

EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

CMD ["node", "app_web/showmasterpiece/server.js"]
