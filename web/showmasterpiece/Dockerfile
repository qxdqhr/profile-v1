# syntax=docker/dockerfile:1
# docker build -f web/showmasterpiece/Dockerfile -t qhr-profile-showmasterpiece .

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
COPY web/showmasterpiece/package.json ./web/showmasterpiece/

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
COPY --from=deps /app/web/showmasterpiece/node_modules ./web/showmasterpiece/node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/npm ./npm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json ./
COPY config ./config
COPY packages ./packages
COPY npm ./npm
# @profile/db schema 仍聚合 web/web 模块表定义
COPY web/web/src/modules ./web/web/src/modules
COPY web/showmasterpiece ./web/showmasterpiece

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

RUN mkdir -p web/showmasterpiece/.next-showmasterpiece
RUN chown -R nextjs:nodejs web

COPY --from=builder --chown=nextjs:nodejs /app/web/showmasterpiece/.next-showmasterpiece/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/showmasterpiece/.next-showmasterpiece/static ./web/showmasterpiece/.next-showmasterpiece/static

RUN rm -rf /app/web/showmasterpiece/.next-showmasterpiece/cache /tmp/*

USER nextjs

EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

CMD ["node", "web/showmasterpiece/server.js"]
