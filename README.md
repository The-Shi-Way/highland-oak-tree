# The Highland Oak Tree

A personal blog platform for an AI engineer & consultant, featuring rich content editing, poetry with creative themes, AI-assisted writing via AWS Bedrock, and media management.

## Tech Stack

- **Backend**: NestJS (TypeScript strict) with TypeORM, PostgreSQL 16, Redis 7
- **Frontend**: Nuxt 3 (Vue 3) with Pinia, TanStack Query, TipTap editor
- **AI**: AWS Bedrock (Claude) for content review and rewriting suggestions
- **Auth**: Amazon Cognito (single admin)
- **Storage**: S3 + CloudFront CDN for media assets
- **Infrastructure**: Terraform on AWS (ECS Fargate, RDS, ElastiCache, CloudFront)

## Project Structure

```
├── server-nestjs/     # NestJS API backend
├── client/            # Nuxt 3 frontend
├── infra/             # Terraform infrastructure modules
├── .github/workflows/ # CI/CD pipelines
└── podman-compose.yml # Local development containers
```

## Local Development

### Prerequisites

- Node.js 22+ (LTS)
- pnpm 9+
- Podman Desktop (or Docker)
- direnv (optional)

### Setup

```bash
# Install dependencies
pnpm install

# Start local services (PostgreSQL, Redis, MinIO)
podman-compose up -d

# Copy environment config
cp server-nestjs/.env.example server-nestjs/.env.local

# Run database migrations
pnpm --filter highland-oak-tree-server typeorm migration:run

# Start backend (port 3001)
pnpm --filter highland-oak-tree-server start:dev

# Start frontend (port 3000)
pnpm --filter client dev
```

### API Documentation

Swagger UI is available at `http://localhost:3001/api/docs` when the backend is running.

## Deployment

- **Staging**: Auto-deploys on push to `develop` branch
- **Production**: Auto-deploys on push to `main` with manual approval gate

See `infra/` for Terraform modules and `.github/workflows/` for CI/CD pipelines.

## License

Private — All rights reserved.
