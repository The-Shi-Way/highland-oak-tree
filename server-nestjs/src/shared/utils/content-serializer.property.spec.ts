import * as fc from 'fast-check';
import { serializeContent, deserializeContent, IJSONContent } from './content-serializer';

/**
 * Feature: living-tree-redesign, Property 24: Content serialization round-trip
 * **Validates: Requirements 9.3, 9.6**
 */

function jsonContentArb(): fc.Arbitrary<IJSONContent> {
  const textNode: fc.Arbitrary<IJSONContent> = fc.record({
    type: fc.constantFrom('text', 'hardBreak'),
    text: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    marks: fc.option(
      fc.array(
        fc.record({
          type: fc.constantFrom('bold', 'italic', 'code', 'link', 'underline'),
          attrs: fc.option(
            fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.string({ maxLength: 30 })),
            { nil: undefined },
          ),
        }),
        { maxLength: 3 },
      ),
      { nil: undefined },
    ),
  });

  const blockNode: fc.Arbitrary<IJSONContent> = fc.record({
    type: fc.constantFrom('paragraph', 'heading', 'blockquote', 'codeBlock'),
    attrs: fc.option(
      fc.dictionary(
        fc.constantFrom('level', 'language', 'class'),
        fc.oneof(fc.string({ maxLength: 20 }), fc.integer({ min: 1, max: 6 }).map(String)),
      ),
      { nil: undefined },
    ),
    content: fc.option(fc.array(textNode, { maxLength: 5 }), { nil: undefined }),
  });

  return fc.record({
    type: fc.constant('doc'),
    content: fc.array(blockNode, { maxLength: 8 }),
  });
}

describe('Content Serializer — Property Tests', () => {
  it('round-trip: deserialize(serialize(content)) equals original', () => {
    fc.assert(
      fc.property(jsonContentArb(), (doc: IJSONContent) => {
        const roundTripped = deserializeContent(serializeContent(doc));
        expect(roundTripped).toEqual(doc);
      }),
      { numRuns: 200 },
    );
  });

  it('serialized output is always valid JSON', () => {
    fc.assert(
      fc.property(jsonContentArb(), (doc: IJSONContent) => {
        const serialized = serializeContent(doc);
        expect(() => JSON.parse(serialized)).not.toThrow();
      }),
      { numRuns: 200 },
    );
  });
});
