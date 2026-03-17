# ── Stage 1: Build ────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files first (lockfile + overrides)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server-nestjs/package.json ./server-nestjs/

# Install only server deps using workspace filtering
RUN pnpm install --filter highland-oak-tree-server --frozen-lockfile

# Copy server source
COPY server-nestjs/ ./server-nestjs/

# Build from workspace root
RUN pnpm --filter highland-oak-tree-server build

# ── Stage 2: Production ──────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server-nestjs/package.json ./server-nestjs/

RUN pnpm install --filter highland-oak-tree-server --frozen-lockfile --prod

COPY --from=builder /app/server-nestjs/dist ./server-nestjs/dist
COPY server-nestjs/docker-entrypoint.sh ./server-nestjs/

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

USER node

ENTRYPOINT ["sh", "server-nestjs/docker-entrypoint.sh"]
