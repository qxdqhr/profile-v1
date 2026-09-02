# syntax=docker/dockerfile:1
# 构建上下文：仓库根目录
#   docker build -f web/teach-hub/Dockerfile -t qhr-profile-teach-hub .

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
COPY web/teach-hub/package.json ./web/teach-hub/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    set -e; \
    for attempt in 1 2 3 4 5; do \
      pnpm install --frozen-lockfile --filter @profile/teach-hub... --ignore-scripts && break; \
      echo "pnpm install attempt ${attempt} failed, retrying..."; \
      sleep 15; \
    done

FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/web/teach-hub/node_modules ./web/teach-hub/node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/npm ./npm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json ./
COPY config ./config
COPY packages ./packages
COPY npm ./npm
COPY web/web/src/modules ./web/web/src/modules
COPY web/teach-hub ./web/teach-hub

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-teach-hub
ENV NEXT_PUBLIC_BASE_PATH=/teach-hub
# 子应用 basePath 已含 /teach-hub，站内 Link 勿再叠一层前缀
ENV NEXT_PUBLIC_TEACH_HUB_BASE_URL=

RUN pnpm --filter @profile/teach-hub build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DIST_DIR=.next-teach-hub

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p web/teach-hub/.next-teach-hub
RUN chown -R nextjs:nodejs web

COPY --from=builder --chown=nextjs:nodejs /app/web/teach-hub/.next-teach-hub/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/teach-hub/.next-teach-hub/static ./web/teach-hub/.next-teach-hub/static

RUN rm -rf /app/web/teach-hub/.next-teach-hub/cache /tmp/*

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "web/teach-hub/server.js"]
