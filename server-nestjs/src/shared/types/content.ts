/**
 * Content lifecycle states — used by the Leaf entity.
 */
export type ContentStatus = 'draft' | 'published' | 'archived';

/**
 * Leaf type — maps to a Branch in the tree taxonomy.
 */
export type LeafType = 'prose' | 'blossom' | 'fruit' | 'seed';

/**
 * Season — derived from a Leaf's publish date.
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * Growth stage — maturity indicator for content.
 */
export type GrowthStage = 'seedling' | 'sapling' | 'mature' | 'evergreen';
