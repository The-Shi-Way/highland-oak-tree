/**
 * Branded types for domain entity IDs.
 * Prevents accidental mixing of ID types at compile time.
 */
export type PostId = string & { readonly __brand: 'PostId' };
export type PoemId = string & { readonly __brand: 'PoemId' };
export type MediaAssetId = string & { readonly __brand: 'MediaAssetId' };
export type LeafId = string & { readonly __brand: 'LeafId' };
export type GroveEntryId = string & { readonly __brand: 'GroveEntryId' };
