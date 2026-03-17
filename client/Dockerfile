# ── Stage 1: Build ────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files first (lockfile + overrides)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/

# Install only client deps using workspace filtering
RUN pnpm install --filter client --frozen-lockfile

# Copy client source
COPY client/ ./client/

# Build from workspace root
RUN pnpm --filter client build

# ── Stage 2: Production ──────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/client/.output ./.output

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/_health || exit 1

USER node

CMD ["node", ".output/server/index.mjs"]
