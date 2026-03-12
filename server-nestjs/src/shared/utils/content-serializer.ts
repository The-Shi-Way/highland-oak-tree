/**
 * Content serialization utilities for TipTap JSON documents.
 * Used by PostService and PoemService for storage/retrieval.
 *
 * The round-trip property is critical:
 *   deserializeContent(serializeContent(content)) ≡ content
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

export interface IJSONContent {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: IJSONContent[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
}

/**
 * Serializes a TipTap JSON content object to a string for database storage.
 */
export function serializeContent(editorJson: IJSONContent): string {
  return JSON.stringify(editorJson);
}

/**
 * Deserializes a stored JSON string back to a TipTap-compatible content object.
 */
export function deserializeContent(stored: string): IJSONContent {
  return JSON.parse(stored) as IJSONContent;
}
