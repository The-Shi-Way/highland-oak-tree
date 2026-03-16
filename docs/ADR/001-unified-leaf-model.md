# ADR-001: Unified Leaf Content Model

## Status
Accepted

## Date
2026-03-13

## Context
The original blog platform had two separate content entities — Post and Poem — each with their own module, service, controller, entity, and migration. This created duplication in CRUD logic, search indexing, SEO generation, and admin UI. Adding new content types (e.g., micro-posts, media-centric posts) would require creating entirely new modules each time.

## Decision
Replace the dual Post/Poem model with a single Leaf entity that uses a `leafType` discriminator field. All content types (prose, blossom, fruit, seed) share the same table, service, and controller. Type-specific behavior is handled via conditional logic within the unified service.

## Consequences
- Single migration path for schema changes
- One search index covers all content
- Simpler admin UI with a unified editor
- Legacy Post and Poem modules kept temporarily for data migration
- Type-specific rendering handled in frontend components via leafType prop
