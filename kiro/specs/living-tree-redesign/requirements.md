# Requirements Document

## Introduction

This document specifies the requirements for redesigning "The Highland Oak Tree" blog platform around a "living tree" metaphor. The redesign unifies the existing separate Post and Poem entities into a single Leaf content model, introduces a botanical taxonomy (Roots, Trunk, Branches, Leaves, Forest Floor, Grove, Canopy), adds a seasonal color system, and restructures navigation and URL patterns. The existing NestJS backend and Nuxt 3 frontend are preserved and extended — this is a migration, not a rewrite.

## Glossary

- **Leaf**: A single piece of content in the system, replacing the current Post and Poem entities. Every Leaf has a type, season, and growth stage.
- **Leaf_Type**: A discriminated union classifying content: `prose` (long-form writing), `blossom` (poetry/verse), `fruit` (media-centric posts), `seed` (microblog/short thoughts).
- **Branch**: A primary content category corresponding to a Leaf_Type. Each Branch has a landing page with description, featured leaves, and a chronological feed.
- **Vine**: A cross-cutting tag that connects Leaves across Branches. Replaces the current `tags` field.
- **Season**: A temporal classification derived from a Leaf's publish date: `spring` (Mar–May), `summer` (Jun–Aug), `autumn` (Sep–Nov), `winter` (Dec–Feb).
- **Growth_Stage**: A maturity indicator for content: `seedling` (draft/early idea), `sapling` (developing piece), `mature` (finished post), `evergreen` (timeless/pinned).
- **Trunk**: The homepage, serving as the central content feed mixing all Leaf types.
- **Roots**: Foundational static pages (About, Philosophy, Origin Story) accessible from the base of the navigation tree.
- **Forest_Floor**: The archive section where Leaves older than 12 months are surfaced with year-grouped sections.
- **Canopy**: A birds-eye-view page displaying all content in a filterable grid/masonry layout.
- **Grove**: A blogroll/recommended-reading page with tree-themed entries.
- **Growth_Rings**: A timeline visualization showing content as concentric rings (one ring per year).
- **Seasonal_Palette**: A set of CSS custom properties that shift the site color accent based on the current calendar season.
- **Leaf_Service**: The NestJS service responsible for Leaf CRUD, publishing, filtering, and season calculation.
- **Grove_Service**: The NestJS service responsible for Grove entry CRUD.
- **Migration_Service**: The NestJS service responsible for migrating existing Post and Poem records into Leaf records.
- **Season_Utility**: A pure function that computes a Season from a given Date.
- **Forest_Floor_Scheduler**: A scheduled process that marks Leaves older than 12 months as Forest Floor content.

## Requirements

### Requirement 1: Unified Leaf Data Model

**User Story:** As a blog author, I want all content types unified into a single Leaf entity, so that I can manage prose, poetry, media, and micro-posts through one consistent interface.

#### Acceptance Criteria

1. THE Leaf_Service SHALL store every Leaf with the fields: id (UUID), title, slug (unique), body (JSONB), excerpt (nullable), featuredImage (nullable), leafType (prose | blossom | fruit | seed), season (spring | summer | autumn | winter), growth (seedling | sapling | mature | evergreen), vines (text array), status (draft | published | archived), isForestFloor (boolean), publishedAt (nullable timestamp), updatedAt, and createdAt.
2. WHEN a Leaf is created without an explicit season, THE Leaf_Service SHALL compute the season from the current date using the Season_Utility.
3. WHEN a Leaf is published, THE Leaf_Service SHALL compute the season from the publishedAt date using the Season_Utility.
4. THE Season_Utility SHALL map months March through May to spring, June through August to summer, September through November to autumn, and December through February to winter.
5. WHEN a Leaf is created, THE Leaf_Service SHALL generate a unique slug from the title, appending a numeric suffix if the slug already exists.
6. WHEN a Leaf is created with an empty or whitespace-only title, THE Leaf_Service SHALL return a validation DomainError.
7. THE Leaf_Service SHALL enforce that leafType is exactly one of: prose, blossom, fruit, or seed.
8. THE Leaf_Service SHALL enforce that growth is exactly one of: seedling, sapling, mature, or evergreen.

### Requirement 2: Leaf CRUD and Publishing

**User Story:** As a blog author, I want to create, read, update, delete, publish, and unpublish Leaves, so that I can manage the full content lifecycle.

#### Acceptance Criteria

1. WHEN an authenticated author creates a Leaf with valid data, THE Leaf_Service SHALL persist the Leaf with status draft and return the created Leaf.
2. WHEN an authenticated author updates a Leaf by ID, THE Leaf_Service SHALL apply the provided field changes and return the updated Leaf.
3. WHEN an authenticated author publishes a draft Leaf, THE Leaf_Service SHALL set status to published, set publishedAt to the current timestamp, compute the season from publishedAt, and return the updated Leaf.
4. WHEN an authenticated author attempts to publish an already-published Leaf, THE Leaf_Service SHALL return a conflict DomainError.
5. WHEN an authenticated author unpublishes a published Leaf, THE Leaf_Service SHALL set status to draft, clear publishedAt, and return the updated Leaf.
6. WHEN an authenticated author soft-deletes a Leaf, THE Leaf_Service SHALL set status to archived and return the updated Leaf.
7. IF a Leaf with the given ID does not exist, THEN THE Leaf_Service SHALL return a not_found DomainError.
8. WHEN a public visitor requests a Leaf by slug, THE Leaf_Service SHALL return the Leaf only if its status is published.

### Requirement 3: Branch Listing and Filtering

**User Story:** As a visitor, I want to browse content by Branch (prose, blossom, fruit, seed) with filtering by growth stage and season, so that I can find content matching my interests.

#### Acceptance Criteria

1. WHEN a visitor requests a Branch listing for a given leafType, THE Leaf_Service SHALL return only published Leaves of that leafType, ordered by publishedAt descending.
2. WHEN a visitor provides a growth filter, THE Leaf_Service SHALL return only Leaves matching the specified growth stage.
3. WHEN a visitor provides a season filter, THE Leaf_Service SHALL return only Leaves matching the specified season.
4. WHEN a visitor provides both growth and season filters, THE Leaf_Service SHALL return only Leaves matching both criteria.
5. THE Leaf_Service SHALL paginate Branch listing results with page and limit parameters, returning total count, current page, and limit alongside the Leaf array.

### Requirement 4: Vine (Tag) Navigation

**User Story:** As a visitor, I want to click a vine tag and see all Leaves connected by that vine across all Branches, so that I can explore related content regardless of content type.

#### Acceptance Criteria

1. WHEN a visitor requests Leaves by a specific vine name, THE Leaf_Service SHALL return all published Leaves whose vines array contains that vine name, ordered by publishedAt descending.
2. THE Leaf_Service SHALL paginate vine listing results with page and limit parameters.
3. WHEN a visitor requests a vine that matches zero published Leaves, THE Leaf_Service SHALL return an empty array with total count zero.

### Requirement 5: Forest Floor (Archive)

**User Story:** As a visitor, I want to browse archived content older than 12 months on the Forest Floor page, so that I can discover older writing organized by year.

#### Acceptance Criteria

1. THE Forest_Floor_Scheduler SHALL run on a daily schedule and set isForestFloor to true for all published Leaves whose publishedAt is more than 12 months before the current date.
2. THE Forest_Floor_Scheduler SHALL set isForestFloor to false for any Leaf whose publishedAt is within the last 12 months.
3. WHEN a visitor requests the Forest Floor listing, THE Leaf_Service SHALL return all published Leaves where isForestFloor is true, grouped by year of publishedAt, ordered by publishedAt descending within each year.
4. THE Leaf_Service SHALL paginate Forest Floor results with page and limit parameters.

### Requirement 6: Canopy (All-Content Overview)

**User Story:** As a visitor, I want a birds-eye-view page showing all published content in a filterable grid, so that I can quickly scan everything available.

#### Acceptance Criteria

1. WHEN a visitor requests the Canopy listing, THE Leaf_Service SHALL return all published Leaves ordered by publishedAt descending.
2. WHEN a visitor provides leafType, vine, season, or growth filters on the Canopy listing, THE Leaf_Service SHALL return only Leaves matching all specified filters.
3. THE Leaf_Service SHALL paginate Canopy results with page and limit parameters.

### Requirement 7: Grove (Blogroll)

**User Story:** As a blog author, I want to maintain a blogroll of recommended sites with tree-themed labels, so that visitors can discover related reading.

#### Acceptance Criteria

1. THE Grove_Service SHALL store each Grove entry with the fields: id (UUID), name, url, description, treeLabel (e.g. "Old Oak", "Willow", "Pine"), displayOrder (integer), createdAt, and updatedAt.
2. WHEN an authenticated author creates a Grove entry with valid data, THE Grove_Service SHALL persist and return the entry.
3. WHEN an authenticated author creates a Grove entry with an empty name or empty url, THE Grove_Service SHALL return a validation DomainError.
4. WHEN a visitor requests the Grove listing, THE Grove_Service SHALL return all Grove entries ordered by displayOrder ascending.
5. WHEN an authenticated author updates a Grove entry, THE Grove_Service SHALL apply the changes and return the updated entry.
6. WHEN an authenticated author deletes a Grove entry, THE Grove_Service SHALL remove the entry from the database.
7. IF a Grove entry with the given ID does not exist, THEN THE Grove_Service SHALL return a not_found DomainError.

### Requirement 8: Data Migration (Post and Poem to Leaf)

**User Story:** As a blog author, I want existing Posts migrated to prose Leaves and existing Poems migrated to blossom Leaves, so that no content is lost during the redesign.

#### Acceptance Criteria

1. WHEN the Migration_Service runs, THE Migration_Service SHALL create one Leaf of leafType prose for each existing Post, copying title, slug, body, excerpt, coverImageUrl to featuredImage, tags to vines, status, publishedAt, createdAt, and updatedAt.
2. WHEN the Migration_Service runs, THE Migration_Service SHALL create one Leaf of leafType blossom for each existing Poem, copying title, body, status, publishedAt, createdAt, and updatedAt, and generating a slug from the Poem title.
3. WHEN the Migration_Service migrates a Leaf with a publishedAt date, THE Migration_Service SHALL compute the season from publishedAt using the Season_Utility.
4. WHEN the Migration_Service migrates a Leaf without a publishedAt date, THE Migration_Service SHALL compute the season from createdAt using the Season_Utility.
5. THE Migration_Service SHALL assign growth stage mature to all published migrated Leaves and growth stage seedling to all draft migrated Leaves.
6. THE Migration_Service SHALL produce a count of migrated Posts and migrated Poems upon completion.
7. IF a slug collision occurs during Poem migration, THEN THE Migration_Service SHALL append a numeric suffix to produce a unique slug.

### Requirement 9: Season Utility (Pure Computation)

**User Story:** As a developer, I want a pure function that computes the season from a date, so that season assignment is consistent and testable across the entire system.

#### Acceptance Criteria

1. THE Season_Utility SHALL accept a Date and return exactly one of: spring, summer, autumn, or winter.
2. THE Season_Utility SHALL map month indices 2, 3, 4 (March, April, May) to spring.
3. THE Season_Utility SHALL map month indices 5, 6, 7 (June, July, August) to summer.
4. THE Season_Utility SHALL map month indices 8, 9, 10 (September, October, November) to autumn.
5. THE Season_Utility SHALL map month indices 11, 0, 1 (December, January, February) to winter.
6. THE Season_Utility SHALL produce the same output for any two Dates within the same calendar month.

### Requirement 10: Seasonal Color Palette

**User Story:** As a visitor, I want the site color palette to shift based on the current calendar season, so that the visual experience reflects the living tree metaphor.

#### Acceptance Criteria

1. THE Seasonal_Palette SHALL define CSS custom properties for primary, secondary, tertiary, and accent colors for each of the four seasons.
2. WHEN the site loads, THE Seasonal_Palette SHALL apply the color set corresponding to the current calendar season as determined by the Season_Utility.
3. THE Seasonal_Palette SHALL use spring colors (fresh green #4a7c59, soft pink #d4a5a5, cream #faf3e0) for months March through May.
4. THE Seasonal_Palette SHALL use summer colors (deep green #2d5a27, warm gold #c9a959, sky blue #87CEEB) for months June through August.
5. THE Seasonal_Palette SHALL use autumn colors (amber #b8860b, burnt orange #cc5500, deep red #8b1a1a, warm brown #5c4033) for months September through November.
6. THE Seasonal_Palette SHALL use winter colors (cool grey #708090, frost blue #b0c4de, bare wood brown #8b7355, white #f5f5f5) for months December through February.
7. THE Seasonal_Palette SHALL maintain off-white (#fcfcfb) background and dark charcoal (#2c2c2c) text as base colors across all seasons.

### Requirement 11: Navigation and URL Structure

**User Story:** As a visitor, I want a tree-themed navigation structure with intuitive URLs, so that I can easily find and bookmark content.

#### Acceptance Criteria

1. THE Navigation SHALL display primary links: Trunk (Home at /), Branches (dropdown with Prose at /prose, Blossom at /blossom, Fruit at /fruit, Seed at /seed), Canopy at /canopy, Forest Floor at /forest-floor, Roots at /roots, and The Grove at /grove.
2. WHEN a visitor navigates to /prose/[slug], /blossom/[slug], /fruit/[slug], or /seed/[slug], THE System SHALL display the corresponding published Leaf.
3. WHEN a visitor navigates to /vine/[vine-name], THE System SHALL display all published Leaves connected by that vine.
4. WHEN a visitor navigates to /growth-rings, THE System SHALL display the Growth Rings timeline visualization.
5. THE Navigation SHALL include a Branches dropdown that expands to show all four Branch links with their respective leaf-type icons.

### Requirement 12: Leaf Type Visual Indicators

**User Story:** As a visitor, I want each content type to have a distinct visual accent, so that I can quickly identify the type of content at a glance.

#### Acceptance Criteria

1. THE System SHALL display a green accent color for prose Leaves.
2. THE System SHALL display a pink/rose accent color for blossom Leaves.
3. THE System SHALL display a warm orange accent color for fruit Leaves.
4. THE System SHALL display an earth brown accent color for seed Leaves.
5. WHEN displaying a Leaf in any listing or detail view, THE System SHALL show a leaf-type badge indicating the content type.

### Requirement 13: Typography System

**User Story:** As a visitor, I want a typographic hierarchy that uses organic serif headings and clean sans-serif body text, with a special italic serif for poetry, so that the reading experience matches the tree metaphor.

#### Acceptance Criteria

1. THE System SHALL render headings in a serif typeface with organic character (Fraunces, Playfair Display, or Lora).
2. THE System SHALL render body text in a clean sans-serif typeface (Source Sans 3 or Nunito).
3. WHEN displaying blossom (poetry) content, THE System SHALL render verse text in an italic serif typeface (Cormorant Garamond italic) with centered alignment and increased line-height.

### Requirement 14: Homepage (Trunk) Redesign

**User Story:** As a visitor, I want the homepage to feature a seasonal hero tree illustration and a curated feed mixing all leaf types, so that the landing experience embodies the living tree.

#### Acceptance Criteria

1. THE Trunk page SHALL display a hero section with a stylized tree SVG illustration that changes appearance based on the current season (spring blossoms, summer full canopy, autumn golden/red leaves, winter bare branches).
2. THE Trunk page SHALL display a curated content feed showing recent published Leaves of all types, ordered by publishedAt descending.
3. THE Trunk page SHALL display a sidebar section showing recent seed-type Leaves.
4. THE Trunk page SHALL display a sidebar section featuring a selection of Grove entries.

### Requirement 15: Individual Leaf Detail Pages

**User Story:** As a visitor, I want each content piece displayed with its leaf-type badge, season indicator, growth stage, vine tags, and related content, so that I understand the content in context of the tree metaphor.

#### Acceptance Criteria

1. WHEN displaying a Leaf detail page, THE System SHALL show the leaf-type badge, season indicator, and growth stage.
2. WHEN displaying a Leaf detail page, THE System SHALL render vine tags as clickable links navigating to /vine/[vine-name].
3. WHEN displaying a Leaf detail page, THE System SHALL show a "Related leaves on this vine" section listing other published Leaves sharing at least one vine with the current Leaf.
4. WHEN displaying a blossom Leaf, THE System SHALL use the poetry-optimized layout with centered text, larger line-height, and italic serif typeface.
5. WHEN displaying a seed Leaf, THE System SHALL use a compact layout without requiring a featured image.

### Requirement 16: Search Integration

**User Story:** As a visitor, I want to search across all Leaf types with results showing leaf-type indicators, so that I can find content regardless of which Branch it belongs to.

#### Acceptance Criteria

1. WHEN a visitor submits a search query, THE Search_Service SHALL search across all published Leaves by title and body content.
2. WHEN displaying search results, THE Search_Service SHALL include the leafType, season, and growth fields for each result.
3. THE Search_Service SHALL return results ordered by relevance, with publishedAt as a tiebreaker.

### Requirement 17: RSS Feeds

**User Story:** As a visitor, I want RSS feeds for the full site and for each Branch, so that I can subscribe to content in my preferred reader.

#### Acceptance Criteria

1. THE SEO_Service SHALL generate a main RSS feed at /feed containing all published Leaves ordered by publishedAt descending, with the feed title "The Wind — The Highland Oak Tree".
2. THE SEO_Service SHALL generate per-branch RSS feeds at /prose/feed, /blossom/feed, /fruit/feed, and /seed/feed, each containing only Leaves of the corresponding leafType.
3. THE SEO_Service SHALL include title, slug-based link, excerpt, leafType, and publishedAt for each feed entry.

### Requirement 18: SEO and Sitemap Updates

**User Story:** As a blog author, I want the sitemap and Open Graph metadata updated to reflect the new URL structure and tree metaphor, so that search engines correctly index the redesigned site.

#### Acceptance Criteria

1. WHEN generating the sitemap, THE SEO_Service SHALL include URLs for all published Leaves using the pattern /{leafType}/{slug}.
2. WHEN generating the sitemap, THE SEO_Service SHALL include URLs for Branch landing pages (/prose, /blossom, /fruit, /seed), the Canopy (/canopy), Forest Floor (/forest-floor), Roots (/roots), Grove (/grove), and Growth Rings (/growth-rings).
3. WHEN rendering a Leaf detail page, THE System SHALL set Open Graph meta tags including og:title, og:description (from excerpt), og:type (article), and og:image (from featuredImage).

### Requirement 19: Seasonal Hero Tree SVG

**User Story:** As a visitor, I want the homepage hero to display a stylized tree that visually changes with the seasons, so that the site feels alive and connected to the passage of time.

#### Acceptance Criteria

1. THE Seasonal_Hero SHALL render an SVG tree illustration on the Trunk page.
2. WHEN the current season is spring, THE Seasonal_Hero SHALL display the tree with blossom elements and fresh green foliage.
3. WHEN the current season is summer, THE Seasonal_Hero SHALL display the tree with a full dense canopy in deep greens.
4. WHEN the current season is autumn, THE Seasonal_Hero SHALL display the tree with golden and red foliage and falling leaf elements.
5. WHEN the current season is winter, THE Seasonal_Hero SHALL display the tree with bare branches and a frost-tinted palette.

### Requirement 20: Falling Leaves Animation

**User Story:** As a visitor during autumn, I want a subtle CSS animation of leaves drifting across the page, so that the seasonal atmosphere is enhanced without harming usability.

#### Acceptance Criteria

1. WHILE the current season is autumn, THE System SHALL display a CSS-only falling leaves animation on public pages.
2. WHEN the user has prefers-reduced-motion enabled, THE System SHALL disable the falling leaves animation entirely.
3. THE falling leaves animation SHALL use lightweight CSS transforms and opacity transitions without JavaScript runtime cost.

### Requirement 21: Growth Rings Timeline Visualization

**User Story:** As a visitor, I want an alternative archive view showing content as concentric rings (tree cross-section), so that I can explore the blog's history in a visually engaging way.

#### Acceptance Criteria

1. WHEN a visitor navigates to /growth-rings, THE System SHALL display a visualization of concentric rings where each ring represents one calendar year.
2. THE Growth_Rings page SHALL plot published Leaves along their respective year ring, positioned by publish month.
3. WHEN a visitor clicks a Leaf marker on a ring, THE System SHALL navigate to that Leaf's detail page.
4. THE Growth_Rings page SHALL visually distinguish Leaf types using the leaf-type accent colors.

### Requirement 22: Admin Leaf Editor

**User Story:** As a blog author, I want the admin editor updated to support the unified Leaf model with leafType, growth, and vine fields, so that I can create and manage all content types from one editor.

#### Acceptance Criteria

1. THE Admin_Editor SHALL provide a leafType selector allowing the author to choose prose, blossom, fruit, or seed.
2. THE Admin_Editor SHALL provide a growth stage selector allowing the author to choose seedling, sapling, mature, or evergreen.
3. THE Admin_Editor SHALL provide a vines input field allowing the author to add and remove vine tags.
4. THE Admin_Editor SHALL preserve the existing TipTap rich text editor for body content.
5. THE Admin_Editor SHALL preserve the existing AI assistant integration for content review and rewrite.
6. THE Admin_Editor SHALL preserve the existing media upload integration for featured images.
