# Requirements Document

## Introduction

The Chirp Bulletin Board introduces short-form announcements to The Highland Oak Tree platform. Chirps represent birds living in the oak tree, chirping out news and updates to visitors. Unlike Leaves (the primary content model), Chirps are lightweight — no leaf type, growth stage, or vine taxonomy. They support a title, short body text, optional pinning, and optional expiry dates. The feature includes a public-facing bulletin board page and admin CRUD operations.

## Glossary

- **Chirp**: A short announcement or news item displayed on the bulletin board. Stored in the `chirps` database table.
- **Chirp_Service**: The NestJS service responsible for Chirp business logic, returning `Result<T, DomainError>`.
- **Chirp_Controller**: The NestJS controller exposing REST endpoints for Chirp operations.
- **Bulletin_Board**: The public-facing page (`/bulletin-board`) displaying active Chirps.
- **ChirpId**: A branded string type (`string & { readonly __brand: 'ChirpId' }`) uniquely identifying a Chirp.
- **Pinned_Chirp**: A Chirp with `is_pinned = true`, displayed at the top of the bulletin board regardless of creation date.
- **Expired_Chirp**: A Chirp whose `expires_at` timestamp is in the past. Expired Chirps are excluded from the public bulletin board.
- **Active_Chirp**: A Chirp that is published, not soft-deleted, and not expired.

## Requirements

### Requirement 1: Create a Chirp

**User Story:** As an admin, I want to create a new Chirp, so that I can post short announcements to the bulletin board.

#### Acceptance Criteria

1. WHEN an admin submits a valid Chirp with a title (1–150 characters) and body (1–500 characters), THE Chirp_Service SHALL create the Chirp and return the created Chirp object.
2. WHEN an admin submits a Chirp with a title exceeding 150 characters or a body exceeding 500 characters, THE Chirp_Service SHALL return a validation error indicating the violated constraint.
3. WHEN an admin submits a Chirp with an empty or whitespace-only title or body, THE Chirp_Service SHALL return a validation error.
4. WHEN a Chirp is created, THE Chirp_Service SHALL assign a unique ChirpId, set `is_pinned` to false, set `status` to draft, and record `created_at` and `updated_at` timestamps.
5. WHEN an admin provides an optional `expires_at` date, THE Chirp_Service SHALL store the expiry date on the Chirp.
6. IF the provided `expires_at` date is in the past, THEN THE Chirp_Service SHALL return a validation error.

### Requirement 2: Update a Chirp

**User Story:** As an admin, I want to update an existing Chirp, so that I can correct or revise announcements.

#### Acceptance Criteria

1. WHEN an admin submits valid updates to an existing Chirp, THE Chirp_Service SHALL apply the changes and return the updated Chirp object.
2. WHEN an admin attempts to update a Chirp that does not exist, THE Chirp_Service SHALL return a not_found error identifying the missing Chirp.
3. WHEN an admin updates a Chirp, THE Chirp_Service SHALL update the `updated_at` timestamp.
4. WHEN an admin updates a Chirp with fields that violate validation rules (title length, body length, past expiry), THE Chirp_Service SHALL return a validation error.

### Requirement 3: Delete a Chirp

**User Story:** As an admin, I want to delete a Chirp, so that I can remove outdated or incorrect announcements.

#### Acceptance Criteria

1. WHEN an admin deletes an existing Chirp, THE Chirp_Service SHALL soft-delete the Chirp by setting `deleted_at` and return the deleted Chirp object.
2. WHEN an admin attempts to delete a Chirp that does not exist, THE Chirp_Service SHALL return a not_found error.
3. WHEN a Chirp is soft-deleted, THE Bulletin_Board SHALL exclude the Chirp from public listings.

### Requirement 4: Publish and Unpublish a Chirp

**User Story:** As an admin, I want to control Chirp visibility, so that I can draft Chirps before making them public.

#### Acceptance Criteria

1. WHEN an admin publishes a draft Chirp, THE Chirp_Service SHALL set the status to published, record `published_at`, and return the updated Chirp.
2. WHEN an admin attempts to publish a Chirp that is already published, THE Chirp_Service SHALL return a conflict error.
3. WHEN an admin unpublishes a published Chirp, THE Chirp_Service SHALL set the status to draft, clear `published_at`, and return the updated Chirp.
4. WHEN an admin attempts to unpublish a Chirp that is already in draft status, THE Chirp_Service SHALL return a conflict error.

### Requirement 5: Pin and Unpin a Chirp

**User Story:** As an admin, I want to pin important Chirps, so that they appear at the top of the bulletin board.

#### Acceptance Criteria

1. WHEN an admin pins a Chirp, THE Chirp_Service SHALL set `is_pinned` to true and return the updated Chirp.
2. WHEN an admin unpins a Chirp, THE Chirp_Service SHALL set `is_pinned` to false and return the updated Chirp.
3. WHEN multiple Chirps are pinned, THE Bulletin_Board SHALL display all pinned Chirps before unpinned Chirps.

### Requirement 6: List Active Chirps on the Bulletin Board

**User Story:** As a visitor, I want to view the bulletin board, so that I can read current announcements.

#### Acceptance Criteria

1. WHEN a visitor requests the bulletin board, THE Chirp_Service SHALL return only Active_Chirps (published, not soft-deleted, not expired).
2. WHEN listing Active_Chirps, THE Chirp_Service SHALL order Pinned_Chirps first, then remaining Chirps by `published_at` descending.
3. WHEN listing Active_Chirps, THE Chirp_Service SHALL support pagination with `page` and `limit` parameters.
4. WHEN a Chirp's `expires_at` timestamp is in the past at the time of the request, THE Chirp_Service SHALL exclude the Chirp from the active listing.

### Requirement 7: List All Chirps for Admin

**User Story:** As an admin, I want to view all Chirps including drafts and expired ones, so that I can manage the full set of announcements.

#### Acceptance Criteria

1. WHEN an admin requests the admin Chirp listing, THE Chirp_Service SHALL return all non-deleted Chirps regardless of status or expiry.
2. WHEN listing admin Chirps, THE Chirp_Service SHALL order by `created_at` descending.
3. WHEN listing admin Chirps, THE Chirp_Service SHALL support pagination with `page` and `limit` parameters.
4. THE Chirp_Controller SHALL require Cognito authentication for all admin endpoints.

### Requirement 8: Chirp Data Integrity

**User Story:** As a developer, I want Chirps to follow the platform's data patterns, so that the feature integrates cleanly with the existing codebase.

#### Acceptance Criteria

1. THE Chirp entity SHALL use a branded `ChirpId` type for the primary key.
2. THE Chirp_Service SHALL return `Result<T, DomainError>` for all operations — the service SHALL NOT throw exceptions.
3. THE Chirp entity SHALL store `title` as varchar(150), `body` as varchar(500), `is_pinned` as boolean, `status` as varchar, `expires_at` as nullable timestamp, `published_at` as nullable timestamp, `deleted_at` as nullable timestamp, `created_at` as timestamp, and `updated_at` as timestamp.
4. WHEN serializing a Chirp for API responses, THE Chirp_Controller SHALL map the entity to an `IChirp` interface excluding soft-deleted internal fields.

### Requirement 9: Bulletin Board Frontend Page

**User Story:** As a visitor, I want a dedicated bulletin board page, so that I can browse all current Chirps in one place.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/bulletin-board`, THE Bulletin_Board page SHALL fetch and display Active_Chirps from the API.
2. WHEN displaying Chirps, THE Bulletin_Board page SHALL show the title, body, published date, and a pinned indicator for Pinned_Chirps.
3. WHEN more Chirps exist than the current page displays, THE Bulletin_Board page SHALL provide pagination controls.
4. WHEN no Active_Chirps exist, THE Bulletin_Board page SHALL display an empty state message indicating no current announcements.
5. THE Bulletin_Board page SHALL apply seasonal theming consistent with the rest of the platform using CSS custom properties.

### Requirement 10: Admin Chirp Management UI

**User Story:** As an admin, I want a management interface for Chirps, so that I can create, edit, publish, pin, and delete Chirps from the dashboard.

#### Acceptance Criteria

1. WHEN an admin navigates to `/admin/chirps`, THE admin page SHALL display a list of all Chirps with status, pinned state, and expiry information.
2. WHEN an admin clicks "New Chirp", THE admin page SHALL display a form with title, body, and optional expiry date fields.
3. WHEN an admin submits the new Chirp form with valid data, THE admin page SHALL call the create API and display the new Chirp in the list.
4. WHEN an admin clicks edit on a Chirp, THE admin page SHALL populate the form with the existing Chirp data for modification.
5. WHEN an admin uses publish, unpublish, pin, unpin, or delete actions, THE admin page SHALL call the corresponding API endpoint and update the list.
