# Implementation Plan: AI Blog Platform

## Overview

Incremental build of the AI Blog Platform as a pnpm monorepo with NestJS backend (`server-nestjs/`) and Nuxt 3 frontend (`client/`). Tasks are ordered to establish shared types and infrastructure first, then domain modules with their property tests, then frontend pages, and finally integration wiring.

## Tasks

- [x] 1. Project scaffolding and shared types
  - [x] 1.1 Initialize pnpm monorepo with `server-nestjs/` and `client/` workspaces
    - Create root `pnpm-workspace.yaml`, root `package.json`, root `tsconfig.json`
    - Initialize NestJS app in `server-nestjs/` with strict TypeScript config
    - Initialize Nuxt 3 app in `client/` with Vue 3, Pinia, TanStack Query
    - Configure ESLint + Prettier for both workspaces
    - _Requirements: 8.4_

  - [x] 1.2 Create shared types and error handling
    - Create `server-nestjs/src/shared/types/result.ts` with `Result<T, E>` type
    - Create `server-nestjs/src/shared/types/errors.ts` with `DomainError` discriminated union
    - Create `server-nestjs/src/shared/types/ids.ts` with branded types (`PostId`, `PoemId`, `MediaAssetId`)
    - Create `server-nestjs/src/shared/types/content.ts` with `ContentStatus` type
    - _Requirements: 2.1, 3.1, 4.2_

  - [x] 1.3 Set up database module and base configuration
    - Configure TypeORM with PostgreSQL 16 connection in `server-nestjs/src/database/`
    - Enable `pg_trgm` extension in initial migration
    - Set up Redis module for caching and pub/sub
    - Configure environment variables via `@nestjs/config`
    - _Requirements: 7.4_

  - [x] 1.4 Create global HTTP exception filter
    - Implement `HttpExceptionFilter` that maps `DomainError.kind` to HTTP status codes
    - Include `correlationId` in all error responses
    - Register as global filter in `main.ts`
    - _Requirements: 1.6, 6.5_

- [-] 2. Auth module
  - [x] 2.1 Implement Auth module with Cognito integration
    - Create `server-nestjs/src/modules/auth/` with module, service, controller
    - Implement `AuthService` with Cognito `InitiateAuth`, token validation, refresh
    - Create `CognitoGuard` route guard for protected endpoints
    - Create DTOs: `LoginDto`, `RefreshTokenDto`
    - Endpoints: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.2 Write property test for auth guard
    - **Property 1: Auth guard enforces access control**
    - **Validates: Requirements 1.4, 1.6**

  - [ ]* 2.3 Write unit tests for auth service
    - Test login with valid/invalid credentials (mock Cognito)
    - Test token refresh flow
    - Test error message does not reveal which field is incorrect
    - _Requirements: 1.2, 1.3, 1.5_

- [-] 3. Post module
  - [x] 3.1 Create Post entity and migration
    - Create `server-nestjs/src/modules/post/entities/post.entity.ts`
    - Create migration for `posts` table with all columns, indexes on `slug` and `status`
    - Create `post_tags` join table migration
    - _Requirements: 2.1, 2.6_

  - [x] 3.2 Implement Post service with CRUD and publish workflow
    - Create `server-nestjs/src/modules/post/` with module, service, controller
    - Implement `PostService`: create (draft), update, publish, unpublish, soft delete
    - Implement slug generation with duplicate handling
    - Implement tag assignment
    - Create DTOs: `CreatePostDto`, `UpdatePostDto`, `PostListQueryDto`
    - All methods return `Result<T, DomainError>`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.3 Implement Post controller with public and admin endpoints
    - Public: `GET /posts` (paginated, filterable by tag), `GET /posts/:slug`
    - Admin: `POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id`, `PATCH /posts/:id/publish`, `PATCH /posts/:id/unpublish`
    - Apply `CognitoGuard` to admin endpoints
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 3.4 Write property tests for Post module
    - **Property 2: Post creation invariants**
    - **Property 3: Post edit updates timestamp**
    - **Property 4: Publish/unpublish round-trip (post half)**
    - **Property 5: Soft delete preserves data**
    - **Property 6: Tag assignment integrity**
    - **Property 7: Slug generation URL-safety and uniqueness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

  - [ ]* 3.5 Write property tests for public post endpoints
    - **Property 17: Post listing ordered by publication date**
    - **Property 19: Tag filtering returns only matching posts**
    - **Property 20: Slug URL resolves to correct post**
    - **Property 21: Non-existent or unpublished slug returns 404**
    - **Validates: Requirements 6.1, 6.3, 6.4, 6.5**

  - [ ]* 3.6 Write unit tests for Post service
    - Test slug edge cases: special characters, unicode, very long titles, duplicate handling
    - Test post detail response includes all required fields (Property 18)
    - _Requirements: 2.7, 6.2_

- [ ] 4. Checkpoint - Post module verification
  - Ensure all tests pass, ask the user if questions arise.

- [-] 5. Poem module
  - [x] 5.1 Create Poem entity and migration
    - Create `server-nestjs/src/modules/poem/entities/poem.entity.ts`
    - Create migration for `poems` table with columns, index on `status`
    - _Requirements: 3.1_

  - [x] 5.2 Implement Poem service and controller
    - Create `server-nestjs/src/modules/poem/` with module, service, controller
    - Implement `PoemService`: create (draft), update, publish, theme assignment
    - Public: `GET /poems` (all published), `GET /poems/:id`
    - Admin: `POST /poems`, `PATCH /poems/:id`, `DELETE /poems/:id`, `PATCH /poems/:id/publish`
    - Apply `CognitoGuard` to admin endpoints
    - All methods return `Result<T, DomainError>`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 5.3 Write property tests for Poem module
    - **Property 4: Publish/unpublish round-trip (poem half)**
    - **Property 8: Poem creation invariants**
    - **Property 9: Poem theme assignment**
    - **Property 10: Poetry page returns all published poems**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [-] 6. Content serialization
  - [x] 6.1 Implement content serialization utilities
    - Create `server-nestjs/src/shared/utils/content-serializer.ts`
    - Implement `serializeContent` and `deserializeContent` for TipTap JSON
    - Wire into PostService and PoemService for storage/retrieval
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

  - [ ]* 6.2 Write property test for content serialization round-trip
    - **Property 24: Content serialization round-trip**
    - Use fast-check to generate arbitrary TipTap-like JSON structures
    - **Validates: Requirements 9.3, 9.6**

- [-] 7. Media module
  - [x] 7.1 Create MediaAsset entity and migration
    - Create `server-nestjs/src/modules/media/entities/media-asset.entity.ts`
    - Create migration for `media_assets` table
    - Create `post_media` and `poem_media` join table migrations
    - _Requirements: 4.2, 4.6_

  - [x] 7.2 Implement Media service with S3 integration
    - Create `server-nestjs/src/modules/media/` with module, service, controller
    - Implement file validation (MIME type + size)
    - Implement S3 upload with presigned URLs
    - Implement thumbnail generation via Sharp (320px, 768px, 1280px)
    - Implement CDN URL construction
    - Implement deletion with S3 cleanup and association removal
    - Admin endpoints: `POST /media/upload`, `GET /media`, `DELETE /media/:id`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 7.3 Write property tests for Media module
    - **Property 11: Media validation accepts allowed types and rejects others**
    - **Property 12: Media upload returns unique identifiers**
    - **Property 13: Image thumbnail generation**
    - **Property 14: Media-content association**
    - **Property 15: Media deletion cascade**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

  - [ ]* 7.4 Write unit tests for media validation
    - Test specific MIME type acceptance/rejection examples
    - Test 50MB boundary (49.9MB passes, 50.1MB fails)
    - Test thumbnail dimensions for various image sizes
    - _Requirements: 4.1, 4.3, 4.5_

- [ ] 8. Checkpoint - Core backend modules verification
  - Ensure all tests pass, ask the user if questions arise.

- [-] 9. AI Assistant module
  - [x] 9.1 Implement AI Assistant service with Bedrock integration
    - Create `server-nestjs/src/modules/ai-assistant/` with module, service, controller
    - Implement `AiAssistantService`: review (returns suggestions), rewrite (returns rewritten text)
    - Configure Bedrock client with model ID, system prompt with style guide
    - Implement structured suggestion parsing from Bedrock response
    - Implement timeout handling (30s) and error fallback
    - Admin endpoints: `POST /ai/review`, `POST /ai/rewrite`
    - _Requirements: 5.1, 5.5, 5.6, 5.7_

  - [ ]* 9.2 Write unit tests for AI Assistant service
    - Test suggestion parsing from mock Bedrock response
    - Test timeout handling returns appropriate error
    - Test system prompt includes style guide
    - Test rewrite preserves content structure
    - _Requirements: 5.1, 5.5, 5.6, 5.7_

- [ ] 10. Search module
  - [x] 10.1 Implement Search service with PostgreSQL full-text search
    - Create `server-nestjs/src/modules/search/` with module, service, controller
    - Create migration to add `tsvector` columns and GIN indexes on posts and poems
    - Implement search query builder using `pg_trgm` and `tsvector`
    - Implement relevance ranking and excerpt generation with term highlighting
    - Public endpoint: `GET /search?q=`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 10.2 Write property tests for Search module
    - **Property 22: Search returns only matching published content**
    - **Property 23: Search results contain required fields**
    - **Validates: Requirements 7.1, 7.2, 7.4**

  - [ ]* 10.3 Write unit tests for Search module
    - Test empty query handling
    - Test no-results response message
    - _Requirements: 7.3_

- [ ] 11. Dashboard module
  - [x] 11.1 Implement Dashboard service
    - Create `server-nestjs/src/modules/dashboard/` with module, service, controller
    - Implement stats aggregation: total/published/draft posts, total poems, total media
    - Implement recent items query: 10 most recently modified posts and poems
    - Admin endpoints: `GET /dashboard/stats`, `GET /dashboard/recent`
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 11.2 Write property tests for Dashboard module
    - **Property 27: Dashboard counts accuracy**
    - **Property 28: Dashboard recent items**
    - **Validates: Requirements 11.1, 11.2**

- [ ] 12. SEO module
  - [x] 12.1 Implement SEO service
    - Create `server-nestjs/src/modules/seo/` with module, service, controller
    - Implement sitemap.xml generation from published posts and poetry page
    - Implement robots.txt generation (allow public, disallow admin)
    - Subscribe to publish/unpublish events via Redis pub/sub for sitemap regeneration
    - Public endpoints: `GET /sitemap.xml`, `GET /robots.txt`
    - _Requirements: 10.1, 10.2, 10.5_

  - [ ]* 12.2 Write property tests for SEO module
    - **Property 25: Sitemap contains all published content**
    - **Validates: Requirements 10.1**

  - [ ]* 12.3 Write unit tests for SEO module
    - Test robots.txt content (allows public, disallows admin)
    - Test sitemap regeneration triggered by publish event
    - _Requirements: 10.2, 10.5_

- [ ] 13. Checkpoint - Full backend verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Frontend - Public pages
  - [x] 14.1 Implement public layout and homepage
    - Create Nuxt 3 layout for public pages with responsive design
    - Implement `pages/index.vue`: paginated post list, tag filter sidebar
    - Create `composables/usePosts.ts` with TanStack Query for post fetching
    - Implement responsive image srcsets in post list cards
    - _Requirements: 6.1, 6.3, 8.1, 8.3_

  - [x] 14.2 Implement single post page
    - Implement `pages/posts/[slug].vue` with SSR
    - Render TipTap JSON content to HTML
    - Display attached media, author info, publication date, tags
    - Add Open Graph and canonical URL meta tags via `useHead()`
    - Implement 404 page for non-existent/unpublished slugs
    - _Requirements: 6.2, 6.4, 6.5, 6.6, 10.3, 10.4_

  - [ ]* 14.3 Write property test for SEO meta tags
    - **Property 26: SEO meta tags on published content**
    - **Validates: Requirements 10.3, 10.4**

  - [x] 14.4 Implement poetry page and single poem view
    - Implement `pages/poetry/index.vue`: grid/list of published poems with creative themes
    - Implement `pages/poetry/[id].vue`: full-page immersive poem view with theme rendering
    - Create theme renderer components for different poem display styles
    - _Requirements: 3.4, 3.5_

  - [x] 14.5 Implement search page
    - Implement `pages/search.vue` with search input and results display
    - Create `composables/useSearch.ts` with TanStack Query
    - Display results with title, excerpt (highlighted), content type, date
    - Handle no-results state with suggestion message
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 15. Frontend - Admin pages
  - [x] 15.1 Implement admin auth and layout
    - Implement `pages/admin/login.vue` with Cognito login form
    - Create admin layout with navigation sidebar
    - Create `stores/auth.ts` Pinia store for token management
    - Create `composables/useAuth.ts` for login/logout/refresh
    - Implement route middleware to protect admin pages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 15.2 Implement admin dashboard page
    - Implement `pages/admin/index.vue` with stats cards and recent items list
    - Wire to `GET /dashboard/stats` and `GET /dashboard/recent`
    - Click-through navigation to edit views
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 15.3 Implement post editor with TipTap
    - Implement `pages/admin/posts/[id].vue` with TipTap rich text editor
    - Create `components/content/TipTapEditor.vue` with toolbar
    - Implement save (draft), publish, unpublish actions
    - Implement tag management UI
    - Implement media attachment from media library
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 9.1, 9.2_

  - [x] 15.4 Implement poem editor with TipTap and theme selector
    - Implement `pages/admin/poems/[id].vue` with TipTap editor
    - Add theme selector dropdown
    - Implement save, publish actions
    - _Requirements: 3.1, 3.2, 3.3, 9.4, 9.5_

  - [x] 15.5 Implement AI assistant panel in editors
    - Create `components/content/AiSuggestionPanel.vue`
    - Implement "Review" button that calls `POST /ai/review`
    - Display suggestions with diff highlighting alongside original text
    - Implement accept/reject per suggestion
    - Implement "Rewrite" for selected text via `POST /ai/rewrite`
    - Handle AI service unavailability with error message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 15.6 Write property test for suggestion accept/reject
    - **Property 16: Suggestion accept/reject correctness**
    - **Validates: Requirements 5.3, 5.4**

  - [x] 15.7 Implement media library page
    - Implement `pages/admin/media.vue` with upload widget and gallery grid
    - Create `components/media/UploadWidget.vue` with drag-and-drop
    - Create `composables/useMedia.ts` for upload, list, delete
    - Display file type, size, thumbnail preview
    - Implement delete with confirmation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [ ] 16. Checkpoint - Full frontend verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Integration wiring and final polish
  - [x] 17.1 Wire NestJS app module with all domain modules
    - Register all modules in `AppModule`
    - Configure CORS for Nuxt frontend origin
    - Set up Swagger/OpenAPI documentation at `/api/docs`
    - _Requirements: 1.4, 6.1_

  - [x] 17.2 Create Podman compose for local development
    - Create `podman-compose.yml` with PostgreSQL 16, Redis 7, S3-compatible MinIO
    - Create `.env.example` with all required environment variables
    - Create `direnv` `.envrc` for environment isolation
    - _Requirements: 8.4_

  - [ ]* 17.3 Write integration tests for critical flows
    - Test: Create post → publish → verify in public listing → search → verify in sitemap
    - Test: Upload media → attach to post → verify in post detail → delete media → verify removed
    - Test: Create poem → assign theme → publish → verify on poetry page
    - _Requirements: 2.1, 2.3, 4.2, 4.6, 4.7, 3.1, 3.2, 3.3, 6.1, 7.1, 10.1_

- [x] 18. Dockerfiles and container builds
  - [x] 18.1 Create NestJS Dockerfile
    - Multi-stage build: `node:22-alpine` builder → runner
    - Install production deps only in runner stage
    - Health check endpoint integration
    - _Requirements: 8.4_

  - [x] 18.2 Create Nuxt 3 Dockerfile
    - Multi-stage build: `node:22-alpine` builder → runner
    - Build Nuxt with SSR output (`.output/`)
    - Health check endpoint integration
    - _Requirements: 8.4_

  - [x] 18.3 Create `.dockerignore` files
    - Exclude `node_modules`, `.env*`, `dist`, `.git`, test files
    - One per workspace (`server-nestjs/`, `client/`)

- [x] 19. Git repository setup
  - [x] 19.1 Initialize Git and configure repository
    - Create `.gitignore` (node_modules, dist, .env*, .output, coverage)
    - Create `.gitattributes` for line endings
    - Create `README.md` with project overview, setup instructions, and architecture summary
    - _Requirements: N/A (infrastructure)_

  - [x] 19.2 Set up branch protection rules documentation
    - Document branching strategy: `main` (production), `develop` (staging), `feature/*`, `hotfix/*`
    - Create `CONTRIBUTING.md` with PR workflow and commit conventions
    - _Requirements: N/A (infrastructure)_

- [x] 20. CI/CD pipeline (GitHub Actions)
  - [x] 20.1 Create CI workflow for PRs
    - Create `.github/workflows/ci.yml`
    - Jobs: lint → type-check → unit tests → property tests → build
    - Run on every PR to `develop` and `main`
    - Cache pnpm store for faster builds
    - _Requirements: N/A (infrastructure)_

  - [x] 20.2 Create staging deployment workflow
    - Create `.github/workflows/deploy-staging.yml`
    - Trigger on push to `develop`
    - Build Docker images → push to ECR → update ECS services
    - Run database migrations
    - _Requirements: N/A (infrastructure)_

  - [x] 20.3 Create production deployment workflow
    - Create `.github/workflows/deploy-production.yml`
    - Trigger on push to `main` with manual approval gate
    - Build Docker images → push to ECR → rolling ECS update
    - Run database migrations
    - Zero-downtime deployment with health checks
    - _Requirements: N/A (infrastructure)_

- [x] 21. Terraform infrastructure
  - [x] 21.1 Create Terraform project structure and networking module
    - Create `infra/main.tf` with S3 backend for state
    - Create `infra/modules/networking/` — VPC, subnets (public + private), NAT gateway, security groups, ALB
    - Create `infra/variables.tf` and `infra/outputs.tf`
    - Create `infra/environments/staging.tfvars` and `production.tfvars`
    - _Requirements: N/A (infrastructure)_

  - [x] 21.2 Create ECS and container registry module
    - Create `infra/modules/ecs/` — ECS Fargate cluster, task definitions, services for NestJS + Nuxt
    - Create ECR repositories for both images
    - Configure auto-scaling policies
    - Configure health checks and rolling deployment
    - _Requirements: N/A (infrastructure)_

  - [x] 21.3 Create database and cache module
    - Create `infra/modules/database/` — RDS PostgreSQL 16 (Multi-AZ), ElastiCache Redis 7
    - Configure security groups for private subnet access only
    - Set up Secrets Manager for DB credentials
    - _Requirements: N/A (infrastructure)_

  - [x] 21.4 Create storage and CDN module
    - Create `infra/modules/storage/` — S3 media bucket, S3 static assets bucket
    - Create CloudFront distribution with custom domain
    - Configure Route 53 DNS records
    - Set up S3 lifecycle policies for cost management
    - _Requirements: N/A (infrastructure)_

  - [x] 21.5 Create auth and monitoring modules
    - Create `infra/modules/auth/` — Cognito user pool and app client
    - Create `infra/modules/monitoring/` — CloudWatch log groups, metric alarms, dashboard
    - _Requirements: N/A (infrastructure)_

- [ ] 22. Final checkpoint - Full platform verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (fast-check, 100+ iterations)
- Unit tests validate specific examples and edge cases
- Backend uses TypeScript strict mode with `Result<T, E>` pattern throughout
- Frontend uses Nuxt 3 SSR for public pages, SPA for admin pages
