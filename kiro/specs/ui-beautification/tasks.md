# Implementation Plan: UI Beautification

## Overview

Transform the Highland Oak Tree frontend into a magazine-quality editorial blog through CSS foundation files, component style/template updates, and page layout refinements. All changes are in `client/` — no backend modifications. Implementation proceeds bottom-up: foundation CSS first, then components, then pages.

## Tasks

- [x] 1. Create typography scale and animation foundation CSS
  - [x] 1.1 Create `client/assets/css/typography.css` with modular type scale
    - Define CSS custom properties `--text-xs` through `--text-4xl` (9 steps, Major Third ratio)
    - Define line-height variables (`--leading-tight` through `--leading-loose`)
    - Define font weight variables (`--weight-normal` through `--weight-black`)
    - Define spacing scale variables (`--space-xs` through `--space-4xl`)
    - Add mobile media query (`max-width: 768px`) that proportionally reduces heading sizes
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.2 Create `client/assets/css/animations.css` with shared animation system
    - Define `fadeIn`, `slideUp`, `scaleIn` keyframe animations
    - Define utility classes `.animate-fade-in`, `.animate-slide-up`, `.animate-scale-in`
    - Define `.hover-lift` transition utility class
    - Add `prefers-reduced-motion: reduce` media query that disables all animations and transitions
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.3 Enhance `client/assets/css/seasons.css` with additional seasonal variables
    - Add `--seasonal-gradient`, `--color-hero-bg`, `--color-accent-secondary`, `--color-hero-text` to each season block
    - Ensure all four season blocks define the same set of variable names
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 1.4 Update `client/nuxt.config.ts` to import new CSS files
    - Add `typography.css` and `animations.css` to the `css` array before `seasons.css`
    - _Requirements: 1.6, 2.4_

  - [ ]* 1.5 Write property tests for CSS foundation (Properties 1, 2, 3, 10)
    - Create `client/assets/css/css-design-system.property.spec.ts`
    - **Property 1: Typography scale variables are fully defined**
    - **Property 2: Typography scale ratio is maintained on mobile**
    - **Property 3: Seasonal CSS variables are structurally consistent**
    - **Property 10: Color contrast ratio meets WCAG AA across all seasons**
    - **Validates: Requirements 1.1, 1.5, 3.1, 3.3, 12.4**

- [x] 2. Checkpoint — Verify foundation CSS
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Redesign SeasonalHeroTree and LeafCard components
  - [x] 3.1 Redesign `client/components/home/SeasonalHeroTree.vue` as editorial hero
    - Replace SVG tree template with full-width editorial hero section
    - Use seasonal gradient background via `var(--seasonal-gradient)`
    - Render site title at `var(--text-4xl)` with Fraunces and tagline at `var(--text-lg)`
    - Add scroll-down indicator with ChevronDown icon
    - Add mobile media query for proportional text/padding reduction
    - Preserve `season: string` prop interface
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 3.2 Refine `client/components/content/LeafCard.vue` styles
    - Add `hover-lift` behavior (translateY + shadow on hover)
    - Set image `aspect-ratio: 16/9` with `object-fit: cover`
    - Update title to use `var(--font-heading)` at `var(--text-lg)`
    - Increase body padding to `var(--space-lg)`
    - Add `prefers-reduced-motion` override for hover animations
    - Preserve `leaf: ILeafCard` prop interface
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 3.3 Refine `client/components/content/LeafTypeBadge.vue` and `client/components/content/VineTag.vue`
    - Update font sizes to use typography scale variables
    - Ensure consistent use of seasonal color variables
    - _Requirements: 5.3_

  - [ ]* 3.4 Write unit tests for SeasonalHeroTree and LeafCard
    - Create `client/components/home/SeasonalHeroTree.spec.ts`
    - Create `client/components/content/LeafCard.spec.ts`
    - Test hero renders title, tagline, and scroll indicator
    - Test card renders hover-lift class and heading font
    - **Validates: Requirements 4.1, 4.6, 5.1, 5.3, 5.4**

- [x] 4. Polish TreeNavigation with scroll-awareness and dropdown animation
  - [x] 4.1 Update `client/components/layout/TreeNavigation.vue`
    - Add scroll listener in `onMounted` that sets `isScrolled` ref when `scrollY > 60`
    - Clean up listener in `onUnmounted`
    - Apply `scrolled` CSS class to header for compact padding with transition
    - Replace `v-show` on dropdown with CSS transition (max-height + opacity)
    - Add bottom-border active indicator on `.router-link-active`
    - Update logo to use `var(--font-heading)` explicitly
    - Preserve all ARIA attributes and mobile toggle behavior
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 4.2 Write property test for scroll-aware navigation (Property 4)
    - Create `client/components/layout/TreeNavigation.property.spec.ts`
    - **Property 4: Scroll-aware navigation state is correct**
    - **Validates: Requirements 6.4, 6.5**

  - [ ]* 4.3 Write unit tests for TreeNavigation
    - Create `client/components/layout/TreeNavigation.spec.ts`
    - Test dropdown has transition CSS
    - Test active route link has indicator
    - Test all ARIA attributes present
    - **Validates: Requirements 6.2, 6.3, 6.6**

- [x] 5. Checkpoint — Verify component updates
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Enhance article reading experience and BranchLanding
  - [x] 6.1 Update `client/pages/[leafType]/[slug].vue` for reading-optimized layout
    - Set `.leaf-body` to `max-width: 65ch`, `font-size: var(--text-md)`, `line-height: var(--leading-relaxed)`
    - Update `.leaf-title` to `var(--text-3xl)`, `font-weight: var(--weight-bold)`, Fraunces
    - Style blockquotes with `border-left: 3px solid var(--color-primary)`, italic Fraunces
    - Style inline code with `background: var(--color-tertiary)`, monospace font
    - Update blossom variant to use `var(--font-poetry)` with centered text and `var(--leading-loose)`
    - Preserve existing composable and route param interfaces
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 6.2 Update `client/components/content/BranchLanding.vue` for magazine layout
    - Update title to Fraunces at `var(--text-3xl)` with `var(--color-primary)`
    - Add `.divider-vine` element between header and content grid
    - Replace plain text empty state with botanical empty state (icon + heading + message)
    - Preserve `leafType`, `title`, `description` prop interface
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 6.3 Write unit tests for BranchLanding empty state
    - Create `client/components/content/BranchLanding.spec.ts`
    - Test empty state renders icon, heading, and message
    - Test divider element present
    - **Property 5: Empty states contain required elements**
    - **Validates: Requirements 8.4, 10.1**

- [x] 7. Redesign footer and homepage layout
  - [x] 7.1 Redesign footer in `client/layouts/default.vue`
    - Replace single-line footer with multi-column grid (brand, branches nav, explore nav)
    - Brand section: Fraunces heading with `var(--color-primary)`, site description
    - Navigation sections with footer-specific ARIA labels
    - Bottom bar with copyright and current year
    - Mobile media query to stack columns vertically
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 7.2 Update `client/pages/index.vue` homepage layout
    - Update section titles to Fraunces at `var(--text-2xl)`
    - Increase feed grid gap to `var(--space-xl)`
    - Add subtle left border to sidebar
    - Replace plain empty state with botanical empty state pattern
    - _Requirements: 10.3, 11.1_

  - [ ]* 7.3 Write unit tests for footer and homepage
    - Create `client/layouts/default.spec.ts`
    - Test footer renders three-column grid with expected nav links
    - Test footer contains copyright with current year
    - **Validates: Requirements 9.1, 9.3**

- [x] 8. Polish search, grove, and responsive refinements
  - [x] 8.1 Update `client/pages/search.vue` with typography scale and empty state
    - Update heading to use Fraunces and typography scale variables
    - Enhance empty state with botanical styling
    - _Requirements: 10.1_

  - [x] 8.2 Update `client/pages/grove.vue` with typography scale and card refinements
    - Update heading to Fraunces and typography scale
    - Add hover-lift to grove cards
    - Enhance empty state with botanical styling
    - _Requirements: 10.1_

  - [x] 8.3 Add global responsive and accessibility refinements
    - Add `focus-visible` outline styles (2px) to `texture.css` for all interactive elements
    - Add mobile touch target sizing (min-height: 44px) for buttons and nav links
    - Verify all grid components have single-column mobile media queries
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3_

  - [ ]* 8.4 Write property test for reduced motion (Property 9)
    - Create `client/components/ui-beautification.property.spec.ts`
    - **Property 9: Reduced motion disables all animations site-wide**
    - **Validates: Requirements 2.3, 12.3**

- [x] 9. Final checkpoint — Verify all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases using Vitest
- All changes are CSS/template-only in `client/` — no backend modifications
- Existing component prop interfaces (ILeafCard, season: string, etc.) are preserved throughout
