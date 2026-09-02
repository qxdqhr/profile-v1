# 兼容旧命令：等价于 web/web/Dockerfile（monorepo 根目录构建）
#   docker build -f dockerfile -t qhr-profile-web .
# 推荐：docker build -f web/web/Dockerfile -t qhr-profile-web .

# syntax=docker/dockerfile:1
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
COPY web/web/package.json ./web/web/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline --filter @profile/web...

FROM base AS builder
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/web/web/node_modules ./web/web/node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/npm ./npm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.json ./
COPY config ./config
COPY packages ./packages
COPY npm ./npm
COPY web/web ./web/web

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter @profile/web build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/web/web/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/web/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/web/.next/static ./web/web/.next/static

RUN rm -rf /app/.next/cache /tmp/*

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "web/web/server.js"]
