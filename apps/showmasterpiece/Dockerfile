# syntax=docker/dockerfile:1
# docker build -f apps/showmasterpiece/Dockerfile -t qhr-profile-showmasterpiece .

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
RUN apk add --no-cache git
RUN git config --global url."https://github.com/".insteadOf "git@github.com:"
WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
COPY packages ./packages
COPY apps/showmasterpiece/package.json ./apps/showmasterpiece/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    set -e; \
    for attempt in 1 2 3 4 5; do \
      pnpm install --frozen-lockfile --filter @profile/showmasterpiece... --ignore-scripts && break; \
      echo "pnpm install attempt ${attempt} failed, retrying..."; \
      sleep 15; \
    done

FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/showmasterpiece/node_modules ./apps/showmasterpiece/node_modules
COPY --from=deps /app/packages ./packages

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json ./
COPY config ./config
COPY packages ./packages
# @profile/db schema 仍聚合 apps/web 模块表定义
COPY apps/web/src/modules ./apps/web/src/modules
COPY apps/showmasterpiece ./apps/showmasterpiece

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-showmasterpiece
ENV NEXT_PUBLIC_BASE_PATH=/showmasterpiece

RUN pnpm --filter @profile/showmasterpiece build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-showmasterpiece

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p apps/showmasterpiece/.next-showmasterpiece
RUN chown -R nextjs:nodejs apps

COPY --from=builder --chown=nextjs:nodejs /app/apps/showmasterpiece/.next-showmasterpiece/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/showmasterpiece/.next-showmasterpiece/static ./apps/showmasterpiece/.next-showmasterpiece/static

RUN rm -rf /app/apps/showmasterpiece/.next-showmasterpiece/cache /tmp/*

USER nextjs

EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/showmasterpiece/server.js"]
