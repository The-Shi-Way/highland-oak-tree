# Implementation Plan: Chirp Bulletin Board

## Overview

Implement the Chirp Bulletin Board feature following the existing Highland Oak Tree patterns. Backend first (shared types → entity → service → controller), then frontend (composables → pages → components). Property and unit tests are woven into each step.

## Tasks

- [x] 1. Set up shared types and Chirp entity
  - [x] 1.1 Add `ChirpId` branded type to `server-nestjs/src/shared/types/ids.ts` and re-export from barrel
    - Add `export type ChirpId = string & { readonly __brand: 'ChirpId' };`
    - Update `server-nestjs/src/shared/types/index.ts` barrel export if needed
    - _Requirements: 8.1_

  - [x] 1.2 Create Chirp entity at `server-nestjs/src/modules/chirp/entities/chirp.entity.ts`
    - Define `Chirp` class with TypeORM decorators matching the design data model
    - Add composite index `idx_chirps_status_pinned_published` on (status, isPinned, publishedAt)
    - Add index `idx_chirps_expires_at` on (expiresAt)
    - _Requirements: 8.1, 8.3_

  - [x] 1.3 Create database migration at `server-nestjs/src/database/migrations/1710000006-create-chirps.ts`
    - Create `chirps` table with all columns per the design
    - Add both indexes
    - _Requirements: 8.3_

  - [x] 1.4 Create Chirp interfaces at `server-nestjs/src/modules/chirp/interfaces/chirp.interfaces.ts`
    - Define `ChirpStatus`, `IChirp`, `ICreateChirp`, `IUpdateChirp`, `IChirpListResult`
    - _Requirements: 8.4_

- [x] 2. Implement ChirpService core CRUD
  - [x] 2.1 Create `server-nestjs/src/modules/chirp/chirp.service.ts` with create, update, softDelete, findById, and private toChirp mapping
    - Follow GroveService/LeafService patterns with `Result<T, DomainError>` returns
    - Implement validation: title 1–150 chars, body 1–500 chars, no whitespace-only, no past expiry
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 8.2_

  - [ ]* 2.2 Write property test: Creation round-trip
    - **Property 1: Creation round-trip**
    - **Validates: Requirements 1.1, 1.4, 1.5, 8.4**

  - [ ]* 2.3 Write property test: Validation rejects invalid field lengths
    - **Property 2: Validation rejects invalid field lengths**
    - **Validates: Requirements 1.2, 1.3, 2.4**

  - [ ]* 2.4 Write property test: Past expiry rejection
    - **Property 3: Past expiry rejection**
    - **Validates: Requirements 1.6**

  - [ ]* 2.5 Write property test: Update applies changes
    - **Property 4: Update applies changes**
    - **Validates: Requirements 2.1, 2.3**

  - [ ]* 2.6 Write property test: Operations on non-existent Chirps return not_found
    - **Property 5: Operations on non-existent Chirps return not_found**
    - **Validates: Requirements 2.2, 3.2**

  - [ ]* 2.7 Write property test: Soft delete sets deleted_at
    - **Property 6: Soft delete sets deleted_at**
    - **Validates: Requirements 3.1**

  - [ ]* 2.8 Write property test: Service never throws exceptions
    - **Property 14: Service never throws exceptions**
    - **Validates: Requirements 8.2**

- [x] 3. Implement publish/unpublish and pin/unpin operations
  - [x] 3.1 Add publish, unpublish, pin, and unpin methods to ChirpService
    - Publish: draft → published (set publishedAt), conflict if already published
    - Unpublish: published → draft (clear publishedAt), conflict if already draft
    - Pin: set isPinned to true
    - Unpin: set isPinned to false
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2_

  - [ ]* 3.2 Write property test: Publish/unpublish round-trip
    - **Property 7: Publish/unpublish round-trip**
    - **Validates: Requirements 4.1, 4.3**

  - [ ]* 3.3 Write property test: Duplicate state transitions return conflict
    - **Property 8: Duplicate state transitions return conflict**
    - **Validates: Requirements 4.2, 4.4**

  - [ ]* 3.4 Write property test: Pin/unpin round-trip
    - **Property 9: Pin/unpin round-trip**
    - **Validates: Requirements 5.1, 5.2**

- [x] 4. Implement listing methods and checkpoint
  - [x] 4.1 Add listActive and listAll methods to ChirpService
    - `listActive`: query published, non-deleted, non-expired chirps ordered by isPinned DESC, publishedAt DESC with pagination
    - `listAll`: query all non-deleted chirps ordered by createdAt DESC with pagination
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3_

  - [ ]* 4.2 Write property test: Active listing filter invariant
    - **Property 10: Active listing filter invariant**
    - **Validates: Requirements 6.1, 6.4, 3.3**

  - [ ]* 4.3 Write property test: Active listing ordering
    - **Property 11: Active listing ordering**
    - **Validates: Requirements 5.3, 6.2**

  - [ ]* 4.4 Write property test: Pagination respects limits
    - **Property 12: Pagination respects limits**
    - **Validates: Requirements 6.3, 7.3**

  - [ ]* 4.5 Write property test: Admin listing includes all non-deleted Chirps
    - **Property 13: Admin listing includes all non-deleted Chirps**
    - **Validates: Requirements 7.1, 7.2**

- [x] 5. Checkpoint — Backend service tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create DTOs and ChirpController
  - [x] 6.1 Create DTOs at `server-nestjs/src/modules/chirp/dto/`
    - `create-chirp.dto.ts`: title (string, 1–150), body (string, 1–500), expiresAt (optional ISO date string)
    - `update-chirp.dto.ts`: all fields optional, same validation
    - `chirp-list-query.dto.ts`: page (int, min 1, default 1), limit (int, min 1, max 50, default 20)
    - Use class-validator decorators
    - _Requirements: 1.1, 1.2, 2.1, 6.3, 7.3_

  - [x] 6.2 Create `server-nestjs/src/modules/chirp/chirp.controller.ts`
    - Public endpoint: GET `/chirps` → listActive
    - Admin endpoints: GET `/chirps/admin/all`, GET `/chirps/admin/:id`, POST `/chirps`, PATCH `/chirps/:id`, PATCH `/chirps/:id/publish`, PATCH `/chirps/:id/unpublish`, PATCH `/chirps/:id/pin`, PATCH `/chirps/:id/unpin`, DELETE `/chirps/:id`
    - Apply `@UseGuards(CognitoGuard)` and `@ApiBearerAuth()` on admin endpoints
    - Map Result errors to HTTP status codes following LeafController pattern
    - _Requirements: 7.4, 8.4_

  - [x] 6.3 Create `server-nestjs/src/modules/chirp/chirp.module.ts` and register in `server-nestjs/src/app.module.ts`
    - Import TypeOrmModule.forFeature([Chirp])
    - Provide ChirpService, ChirpController
    - Add ChirpModule to AppModule imports
    - _Requirements: 8.1_

  - [ ]* 6.4 Write unit tests for ChirpController at `server-nestjs/src/modules/chirp/chirp.service.spec.ts`
    - Test boundary values: title at exactly 150 chars, body at exactly 500 chars
    - Test expiry date edge case at current time
    - Test empty string vs whitespace-only string
    - _Requirements: 1.2, 1.3, 1.6_

- [x] 7. Checkpoint — Backend fully wired
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement frontend composables
  - [x] 8.1 Create `client/composables/useChirps.ts`
    - `useChirpList(page: Ref<number>)` — fetches GET `/chirps` with TanStack Query
    - Define `IChirpListItem` and `IChirpListResponse` interfaces
    - Follow useLeaves.ts pattern
    - _Requirements: 9.1_

  - [x] 8.2 Create `client/composables/useAdminChirps.ts`
    - Export functions: `createChirp`, `updateChirp`, `publishChirp`, `unpublishChirp`, `pinChirp`, `unpinChirp`, `deleteChirp`
    - `useAdminChirpList(page: Ref<number>)` — fetches GET `/chirps/admin/all` with TanStack Query
    - Follow useAdminGrove.ts pattern
    - _Requirements: 10.1, 10.3, 10.5_

- [x] 9. Implement frontend pages and components
  - [x] 9.1 Create `client/components/chirp/ChirpCard.vue`
    - Display title, body, published date, and pinned indicator
    - Use CSS custom properties for seasonal theming
    - _Requirements: 9.2, 9.5_

  - [x] 9.2 Create `client/pages/bulletin-board.vue`
    - Fetch active chirps using `useChirpList` composable
    - Render ChirpCard for each chirp
    - Show pagination controls when total exceeds page limit
    - Show empty state when no active chirps exist
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 9.3 Create `client/pages/admin/chirps.vue`
    - List all chirps with status badges, pinned indicator, expiry info
    - New/edit form with title, body, optional expiresAt fields
    - Action buttons for publish, unpublish, pin, unpin, delete
    - Follow admin/grove.vue pattern with `definePageMeta({ layout: 'admin' })`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 10. Final checkpoint — Full feature integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases using Jest
