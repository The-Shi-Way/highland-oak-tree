# Contributing to The Highland Oak Tree

## Branching Strategy

| Branch | Purpose | Deploys to |
|--------|---------|------------|
| `main` | Production-ready code | Production (manual gate) |
| `develop` | Integration branch | Staging (auto) |
| `feature/*` | New features | — |
| `hotfix/*` | Urgent production fixes | — |

## Workflow

1. Create a branch from `develop`: `git checkout -b feature/my-feature develop`
2. Make changes, commit using conventional commits
3. Push and open a PR targeting `develop`
4. CI must pass (lint, type-check, tests, build)
5. Get review approval
6. Squash-merge into `develop`

## Commit Conventions

Format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

Scopes: `server`, `client`, `infra`, `ci`

Examples:
```
feat(server): add post publish/unpublish endpoints
fix(client): correct poetry theme rendering on mobile
ci: add staging deployment workflow
```

## Code Standards

- TypeScript strict mode, zero `any`
- All domain logic uses `Result<T, E>` pattern
- Co-located tests with source files
- Property-based tests for correctness properties (fast-check)
- ESLint + Prettier must pass before commit
