# Implementation Plan: Living Tree Redesign

## Overview

This plan migrates "The Highland Oak Tree" blog from separate Post/Poem entities to a unified Leaf-based content system with botanical taxonomy, seasonal theming, and tree-metaphor navigation. Tasks are ordered so each builds on the previous, starting with shared types and pure utilities, then backend modules, then migration, then frontend.

## Tasks

- [x] 1. Shared types and Season utility
  - [x] 1.1 Add new shared types (LeafId, GroveEntryId, LeafType, Season, GrowthStage) to `server-nestjs/src/shared/types/`
    - Add `LeafId` and `GroveEntryId` branded types to `ids.ts`
    - Add `LeafType`, `Season`, `GrowthStage` union types to `content.ts`
    - Export all new types from `index.ts`
    - _Requirements: 1.1, 1.7, 1.8_

  - [x] 1.2 Implement `computeSeason` utility in `server-nestjs/src/shared/utils/season.ts`
    - Pure function: `(date: Date) => Season`
    - Map month indices to seasons per Requirement 9
    - _Requirements: 1.4, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x]* 1.3 Write property test for Season utility
    - **Property 1: Season utility maps every date to the correct season**
    - **Validates: Requirements 1.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

- [x] 2. Leaf entity and database migration
  - [x] 2.1 Create Leaf entity in `server-nestjs/src/modules/leaf/entities/leaf.entity.ts`
    - Define all columns per Data Models section: id, title, slug, body, excerpt, featuredImage, leafType, season, growth, vines, status, isForestFloor, publishedAt, createdAt, updatedAt
    - Use TypeORM enums for leafType, season, growth, status
    - _Requirements: 1.1_

  - [x] 2.2 Create GroveEntry entity in `server-nestjs/src/modules/grove/entities/grove-entry.entity.ts`
    - Define all columns: id, name, url, description, treeLabel, displayOrder, createdAt, updatedAt
    - _Requirements: 7.1_

  - [x] 2.3 Create TypeORM migration to add `leaves` and `grove_entries` tables with all indexes
    - Migration file in `server-nestjs/src/database/migrations/`
    - Include indexes: status+publishedAt, leafType+status, unique slug, GIN on vines, isForestFloor+publishedAt, season+status
    - Do NOT drop posts or poems tables
    - _Requirements: 1.1, 7.1_

- [x] 3. Leaf module — service and controller
  - [x] 3.1 Create Leaf interfaces in `server-nestjs/src/modules/leaf/interfaces/leaf.interfaces.ts`
    - Define ILeaf, ICreateLeaf, IUpdateLeaf, ILeafListResult, ILeafListQuery
    - _Requirements: 1.1, 3.5_

  - [x] 3.2 Create Leaf DTOs in `server-nestjs/src/modules/leaf/dto/`
    - CreateLeafDto with class-validator decorators for title, body, leafType, growth, vines, excerpt, featuredImage
    - UpdateLeafDto with optional fields
    - LeafListQueryDto with page, limit, leafType, season, growth, vine filters
    - _Requirements: 1.6, 1.7, 1.8, 3.1, 3.2, 3.3_

  - [x] 3.3 Implement LeafService in `server-nestjs/src/modules/leaf/leaf.service.ts`
    - create(): validate title, generate slug, compute season, persist with status=draft
    - update(): find by ID, apply changes, return Result
    - publish(): set status=published, set publishedAt, compute season
    - unpublish(): set status=draft, clear publishedAt
    - softDelete(): set status=archived
    - findBySlug(): return only published
    - findById(): return any status (admin)
    - listByBranch(): filter by leafType + optional growth/season/vine, paginate
    - listByVine(): filter by vine array contains, paginate
    - listForestFloor(): filter isForestFloor=true, paginate
    - listCanopy(): all published with multi-filter, paginate
    - listForTrunk(): recent published all types + seed sidebar
    - findRelatedByVines(): find published leaves sharing vines with a given leaf
    - All methods return Result<T, DomainError>
    - _Requirements: 1.1–1.8, 2.1–2.8, 3.1–3.5, 4.1–4.3, 5.3–5.4, 6.1–6.3, 14.2, 14.3, 15.3_

  - [x] 3.4 Implement LeafController in `server-nestjs/src/modules/leaf/leaf.controller.ts`
    - Wire all public and admin endpoints per design table
    - Use CognitoGuard for admin endpoints
    - Map DomainError to HTTP status codes
    - _Requirements: 2.1–2.8, 3.1, 4.1, 5.3, 6.1, 11.2_

  - [x] 3.5 Create LeafModule in `server-nestjs/src/modules/leaf/leaf.module.ts`
    - Register Leaf entity, LeafService, LeafController
    - Import TypeOrmModule.forFeature([Leaf])
    - _Requirements: 1.1_

  - [ ]* 3.6 Write property tests for Leaf service
    - **Property 2: Leaf creation produces correct defaults**
    - **Property 3: Leaf validation rejects invalid inputs**
    - **Property 4: Slug uniqueness across all Leaves**
    - **Property 5: Publish lifecycle state transitions**
    - **Property 6: Public slug lookup returns only published Leaves**
    - **Property 7: Listing filters return only matching Leaves**
    - **Property 8: Pagination bounds results correctly**
    - **Property 9: Vine listing returns only Leaves containing that vine**
    - **Validates: Requirements 1.1–1.8, 2.1–2.8, 3.1–3.5, 4.1–4.3, 6.1–6.3**

- [x] 4. Forest Floor scheduler
  - [x] 4.1 Implement ForestFloorScheduler in `server-nestjs/src/modules/leaf/forest-floor.scheduler.ts`
    - Use @nestjs/schedule with daily cron
    - Update isForestFloor based on 12-month threshold
    - Log via LoggerService, no thrown exceptions
    - _Requirements: 5.1, 5.2_

  - [ ]* 4.2 Write property tests for Forest Floor scheduler
    - **Property 10: Forest Floor scheduler correctly partitions by age**
    - **Property 11: Forest Floor listing returns only archived Leaves in order**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 5. Grove module
  - [x] 5.1 Create Grove interfaces, DTOs, service, controller, and module
    - GroveService: create, update, delete, listAll — all returning Result<T, DomainError>
    - GroveController: GET /grove (public), POST/PATCH/DELETE /grove/:id (admin)
    - Validate non-empty name and url
    - Order by displayOrder ascending
    - _Requirements: 7.1–7.7_

  - [ ]* 5.2 Write property tests for Grove service
    - **Property 12: Grove validation rejects empty name or URL**
    - **Property 13: Grove listing respects display order**
    - **Validates: Requirements 7.3, 7.4**

- [x] 6. Checkpoint — Backend core modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Data migration service
  - [x] 7.1 Implement MigrationService in `server-nestjs/src/modules/leaf/migration.service.ts`
    - Read all Posts, create prose Leaves with field mapping (coverImageUrl → featuredImage, tags → vines)
    - Read all Poems, create blossom Leaves with slug generation from title
    - Compute season from publishedAt (or createdAt if null)
    - Set growth=mature for published, growth=seedling for draft
    - Wrap in transaction, return migration counts
    - _Requirements: 8.1–8.7_

  - [x] 7.2 Add migration endpoint to LeafController: POST /leaves/admin/migrate
    - Admin-only, calls MigrationService.migrate()
    - _Requirements: 8.1_

  - [ ]* 7.3 Write property tests for migration service
    - **Property 14: Migration preserves all content**
    - **Property 15: Migration computes correct season from dates**
    - **Validates: Requirements 8.1–8.6, 8.3, 8.4**

- [x] 8. Update Search and SEO services
  - [x] 8.1 Update SearchService to query `leaves` table instead of `posts` and `poems`
    - Return leafType, season, growth in search results
    - Update ISearchResult interface
    - _Requirements: 16.1, 16.2_

  - [x] 8.2 Update SeoService for new URL structure and RSS feeds
    - Sitemap: use /{leafType}/{slug} pattern, add static pages
    - Main RSS feed "The Wind" at /feed
    - Per-branch RSS feeds at /prose/feed, /blossom/feed, /fruit/feed, /seed/feed
    - _Requirements: 17.1, 17.2, 17.3, 18.1, 18.2_

  - [ ]* 8.3 Write property tests for Search and SEO
    - **Property 16: Search returns only published Leaves with required fields**
    - **Property 17: Branch RSS feeds contain only correct leaf type with required fields**
    - **Property 18: Sitemap includes all published Leaves**
    - **Validates: Requirements 16.1, 16.2, 17.2, 17.3, 18.1**

- [x] 9. Update AppModule and wire backend
  - [x] 9.1 Update `server-nestjs/src/app.module.ts`
    - Add LeafModule and GroveModule imports
    - Add ScheduleModule.forRoot() for Forest Floor scheduler
    - Keep PostModule and PoemModule temporarily for migration source access
    - Update DashboardModule to use LeafService for stats
    - _Requirements: 1.1, 7.1_

- [x] 10. Checkpoint — Full backend complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Frontend — Season composable and CSS palette
  - [x] 11.1 Create `client/composables/useSeason.ts`
    - Implement client-side `computeSeason` (same logic as backend)
    - Set `document.documentElement.dataset.season` on mount
    - Export reactive `currentSeason` ref
    - _Requirements: 10.2_

  - [x] 11.2 Create `client/assets/css/seasons.css`
    - Define CSS custom properties for all four seasonal palettes (primary, secondary, tertiary, accent)
    - Define base colors (background, text) that persist across seasons
    - Use `html[data-season="spring"]` etc. selectors
    - _Requirements: 10.1, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 11.3 Import seasons.css in Nuxt config and call `useSeason()` in `client/layouts/default.vue`
    - _Requirements: 10.2_

- [x] 12. Frontend — Shared components
  - [x] 12.1 Create `client/components/content/LeafTypeBadge.vue`
    - Props: leafType. Renders icon + label with accent color per type
    - Prose: green 🍃, Blossom: pink 🌸, Fruit: orange 🍎, Seed: brown 🌱
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 12.2 Create `client/components/content/VineTag.vue`
    - Props: vine. Renders clickable NuxtLink to /vine/[name]
    - _Requirements: 15.2_

  - [x] 12.3 Create `client/components/content/LeafCard.vue`
    - Props: leaf (ILeaf). Displays featured image, LeafTypeBadge, title, excerpt, date, vines, growth indicator
    - Seed type: compact card, no featured image required
    - _Requirements: 12.5, 15.5_

  - [x] 12.4 Create filter components: `client/components/filters/GrowthFilter.vue` and `client/components/filters/SeasonFilter.vue`
    - Emit selected filter values for listing pages
    - _Requirements: 3.2, 3.3_

- [x] 13. Frontend — Navigation and layout
  - [x] 13.1 Create `client/components/layout/TreeNavigation.vue`
    - Logo link to /, Branches dropdown (Prose/Blossom/Fruit/Seed with icons), Canopy, Forest Floor, Roots, Grove, Search
    - Mobile hamburger menu
    - _Requirements: 11.1, 11.5_

  - [x] 13.2 Update `client/layouts/default.vue`
    - Replace current nav with TreeNavigation component
    - Apply seasonal palette via useSeason composable
    - Update typography: serif headings, sans-serif body
    - _Requirements: 11.1, 13.1, 13.2_

- [x] 14. Frontend — Composables for data fetching
  - [x] 14.1 Create `client/composables/useLeaves.ts`
    - useLeafList(leafType, page, filters) — branch listings
    - useVineLeaves(vine, page) — vine page
    - useForestFloor(page) — archive
    - useCanopy(page, filters) — all-content grid
    - useTrunkFeed(page) — homepage feed
    - _Requirements: 3.1, 4.1, 5.3, 6.1, 14.2_

  - [x] 14.2 Create `client/composables/useLeaf.ts`
    - useLeafBySlug(leafType, slug) — single leaf detail
    - useRelatedLeaves(leafId) — related leaves by vine
    - _Requirements: 2.8, 15.3_

  - [x] 14.3 Create `client/composables/useAdminLeaves.ts`
    - useAdminLeafList, useAdminLeaf, createLeaf, updateLeaf, publishLeaf, unpublishLeaf, deleteLeaf, runMigration
    - _Requirements: 2.1–2.6, 8.1_

  - [x] 14.4 Create `client/composables/useGrove.ts` and `client/composables/useAdminGrove.ts`
    - Public grove listing, admin CRUD
    - _Requirements: 7.2, 7.4, 7.5, 7.6_

- [x] 15. Frontend — Pages (Branch landings and Leaf detail)
  - [x] 15.1 Create branch landing pages: `client/pages/prose/index.vue`, `client/pages/blossom/index.vue`, `client/pages/fruit/index.vue`, `client/pages/seed/index.vue`
    - Each: branch description, featured/pinned leaves, chronological feed with GrowthFilter and SeasonFilter
    - Use useLeafList composable with leafType filter
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 15.2 Create dynamic leaf detail page: `client/pages/[leafType]/[slug].vue`
    - LeafTypeBadge, season indicator, growth stage, vine tags as VineTag links
    - Related leaves section via useRelatedLeaves
    - Blossom layout: centered text, italic serif, larger line-height
    - Seed layout: compact, no featured image required
    - Open Graph meta tags
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 18.3_

- [x] 16. Frontend — Homepage (Trunk) redesign
  - [x] 16.1 Create `client/components/home/SeasonalHeroTree.vue`
    - Inline SVG tree with four seasonal variants controlled by season prop
    - Spring: blossoms + fresh green, Summer: full canopy, Autumn: golden/red + falling elements, Winter: bare branches + frost
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

  - [x] 16.2 Rewrite `client/pages/index.vue` as Trunk page
    - SeasonalHeroTree hero section
    - Mixed content feed using useTrunkFeed (all leaf types)
    - Sidebar: recent seeds, featured Grove entries
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ]* 16.3 Write unit tests for Trunk feed composition
    - **Property 19: Trunk feed mixes all types and seed sidebar filters correctly**
    - **Validates: Requirements 14.2, 14.3**

- [x] 17. Frontend — Canopy, Forest Floor, Roots, Grove pages
  - [x] 17.1 Create `client/pages/canopy.vue`
    - Masonry/grid layout with LeafCard components
    - Multi-filter bar: leafType, vine, season, growth
    - Pagination
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 17.2 Create `client/pages/forest-floor.vue`
    - Year-grouped sections, earthy visual treatment
    - Search within archive
    - _Requirements: 5.3, 5.4_

  - [x] 17.3 Create `client/pages/roots.vue`
    - About/philosophy page with tree metaphor content
    - _Requirements: 11.1_

  - [x] 17.4 Create `client/pages/grove.vue`
    - Tree-themed cards for each Grove entry (name, url, description, treeLabel)
    - _Requirements: 7.4_

  - [x] 17.5 Create `client/pages/vine/[name].vue`
    - Cross-branch listing of all leaves sharing the vine
    - _Requirements: 4.1, 11.3_

- [x] 18. Frontend — Growth Rings and animations
  - [x] 18.1 Create `client/pages/growth-rings.vue` with `client/components/visualizations/GrowthRings.vue`
    - SVG concentric rings, one per year
    - Leaves plotted by month position with leaf-type accent colors
    - Click handlers navigate to leaf detail
    - _Requirements: 21.1, 21.2, 21.3, 21.4_

  - [x] 18.2 Create `client/components/effects/FallingLeaves.vue`
    - CSS-only animation, renders only in autumn
    - Respects prefers-reduced-motion via CSS media query
    - _Requirements: 20.1, 20.2, 20.3_

  - [x] 18.3 Add FallingLeaves to `client/layouts/default.vue` (conditional on autumn season)
    - _Requirements: 20.1_

- [x] 19. Frontend — Admin pages
  - [x] 19.1 Create `client/pages/admin/leaves/index.vue`
    - List all leaves with status, leafType, growth filters
    - Create new leaf button
    - _Requirements: 2.1, 22.1_

  - [x] 19.2 Create `client/pages/admin/leaves/[id].vue`
    - Unified editor with leafType selector, growth selector, vines input
    - Preserve TipTap editor, AI assistant panel, media upload
    - Publish/unpublish/delete actions
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6_

  - [x] 19.3 Create `client/pages/admin/grove.vue`
    - CRUD for grove entries with drag-to-reorder for displayOrder
    - _Requirements: 7.2, 7.5, 7.6_

  - [x] 19.4 Add migration trigger to admin dashboard
    - Button to run POST /leaves/admin/migrate with progress/result display
    - _Requirements: 8.1_

  - [x] 19.5 Update `client/pages/admin/index.vue` dashboard stats to use Leaf data
    - _Requirements: 22.1_

- [x] 20. Frontend — Typography and texture
  - [x] 20.1 Add Google Fonts (Fraunces for headings, Source Sans 3 for body, Cormorant Garamond italic for poetry) to Nuxt config
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 20.2 Add subtle background texture via CSS SVG filter or gradient in `client/assets/css/texture.css`
    - Leaf-vein or branch-line SVG dividers
    - Soft shadows and rounded corners as global styles
    - _Requirements: 10.1_

- [x] 21. Frontend — Search page update
  - [x] 21.1 Update `client/pages/search.vue` to display leafType badge, season, and growth in results
    - Update useSearch composable to handle new result fields
    - _Requirements: 16.1, 16.2_

- [x] 22. Checkpoint — Full frontend complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 23. Final integration and cleanup
  - [x] 23.1 Update `client/nuxt.config.ts` with new route aliases and head configuration
    - RSS feed link tags pointing to /feed and per-branch feeds
    - _Requirements: 17.1_

  - [x] 23.2 Remove old post/poem frontend routes and composables (usePosts, usePoems, useAdminPosts, useAdminPoems)
    - Remove `client/pages/posts/`, `client/pages/poetry/`
    - _Requirements: 8.1_

  - [x] 23.3 Update `client/stores/auth.ts` and admin layout if needed for new admin routes
    - _Requirements: 22.1_

- [x] 24. Final checkpoint — All tests pass, full integration verified
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 6, 10, 22, and 24 ensure incremental validation
- Legacy `posts` and `poems` tables are preserved — the old PostModule and PoemModule stay in AppModule until migration is confirmed successful, then can be removed in a follow-up
- Property tests use `fast-check` with minimum 100 iterations per property
