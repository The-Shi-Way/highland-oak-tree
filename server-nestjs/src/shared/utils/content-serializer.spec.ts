import { serializeContent, deserializeContent, IJSONContent } from './content-serializer';

describe('Content Serializer', () => {
  it('round-trips a simple document', () => {
    const doc: IJSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
    };
    expect(deserializeContent(serializeContent(doc))).toEqual(doc);
  });

  it('round-trips a document with marks', () => {
    const doc: IJSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'bold text',
              marks: [{ type: 'bold' }],
            },
          ],
        },
      ],
    };
    expect(deserializeContent(serializeContent(doc))).toEqual(doc);
  });

  it('round-trips an empty document', () => {
    const doc: IJSONContent = { type: 'doc', content: [] };
    expect(deserializeContent(serializeContent(doc))).toEqual(doc);
  });

  it('round-trips a document with attrs', () => {
    const doc: IJSONContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Title' }],
        },
      ],
    };
    expect(deserializeContent(serializeContent(doc))).toEqual(doc);
  });
});
