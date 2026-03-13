# The Highland Oak Tree

A personal blog platform built around a living tree metaphor — content grows as Leaves on four Branches (Prose, Blossom, Fruit, Seed), connected by thematic Vines, with seasonal visual theming and botanical taxonomy.

## Tech Stack

- **Backend**: NestJS (TypeScript strict) with TypeORM, PostgreSQL 16, Redis 7
- **Frontend**: Nuxt 3 (Vue 3) with Pinia, TanStack Query, TipTap editor
- **AI**: AWS Bedrock (Claude) for content review and rewriting suggestions
- **Auth**: Amazon Cognito (single admin)
- **Storage**: S3 + CloudFront CDN for media assets
- **Infrastructure**: Terraform on AWS (ECS Fargate, RDS, ElastiCache, CloudFront)

## Content Model

All content is a **Leaf** with a type (branch), growth stage, seasonal assignment, and vine tags:

| Branch | Description | Icon |
|--------|-------------|------|
| Prose | Long-form essays and articles | 🍃 |
| Blossom | Poetry and verse | 🌸 |
| Fruit | Curated links, reviews, recommendations | 🍎 |
| Seed | Quick thoughts and micro-posts | 🌱 |

**Growth stages**: Seedling → Budding → Mature → Evergreen
**Seasons**: Spring (Mar-May), Summer (Jun-Aug), Autumn (Sep-Nov), Winter (Dec-Feb) — auto-computed from publish date, drives site-wide color palette

## Project Structure

```
├── server-nestjs/     # NestJS API backend
│   └── src/modules/
│       ├── leaf/      # Unified content (Leaf entity, service, controller)
│       ├── grove/     # Blogroll (Grove entries)
│       ├── search/    # Full-text search across leaves
│       ├── seo/       # Sitemap, RSS feeds (main + per-branch)
│       └── ai-assistant/ # Bedrock-powered writing assistant
├── client/            # Nuxt 3 frontend
│   ├── pages/         # Branch landings, leaf detail, canopy, forest floor, etc.
│   ├── composables/   # useLeaves, useLeaf, useSeason, useGrove, etc.
│   └── components/    # LeafCard, TreeNavigation, GrowthRings, FallingLeaves
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
