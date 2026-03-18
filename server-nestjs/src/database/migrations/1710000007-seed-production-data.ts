import { MigrationInterface, QueryRunner } from 'typeorm';

/* eslint-disable max-len */

interface LeafRow {
  id: string;
  title: string;
  slug: string;
  body: Record<string, unknown>;
  excerpt: string | null;
  featured_image: string | null;
  leaf_type: string;
  season: string;
  growth: string;
  vines: string[];
  status: string;
  is_forest_floor: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ChirpRow {
  id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  status: string;
  expires_at: string | null;
  published_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export class SeedProductionData1710000007000 implements MigrationInterface {
  name = 'SeedProductionData1710000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const leaf of LEAVES) {
      await queryRunner.query(
        `INSERT INTO leaves (id, title, slug, body, excerpt, featured_image, leaf_type, season, growth, vines, status, is_forest_floor, published_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7::leaf_type, $8::season, $9::growth_stage, $10::text[], $11::content_status, $12, $13, $14, $15)
         ON CONFLICT (id) DO NOTHING`,
        [
          leaf.id, leaf.title, leaf.slug,
          JSON.stringify(leaf.body),
          leaf.excerpt, leaf.featured_image,
          leaf.leaf_type, leaf.season, leaf.growth,
          leaf.vines, leaf.status, leaf.is_forest_floor,
          leaf.published_at, leaf.created_at, leaf.updated_at,
        ],
      );
    }

    for (const chirp of CHIRPS) {
      await queryRunner.query(
        `INSERT INTO chirps (id, title, body, is_pinned, status, expires_at, published_at, deleted_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          chirp.id, chirp.title, chirp.body,
          chirp.is_pinned, chirp.status, chirp.expires_at,
          chirp.published_at, chirp.deleted_at,
          chirp.created_at, chirp.updated_at,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const leafIds = LEAVES.map((l) => l.id);
    const chirpIds = CHIRPS.map((c) => c.id);
    await queryRunner.query(`DELETE FROM chirps WHERE id = ANY($1::uuid[])`, [chirpIds]);
    await queryRunner.query(`DELETE FROM leaves WHERE id = ANY($1::uuid[])`, [leafIds]);
  }
}
const LEAVES: LeafRow[] = [
  {
    "id": "fb5a2c1b-426c-48b0-a02d-45d48646e2f6",
    "title": "The Search for Meaning Begins Within",
    "slug": "untitled-leaf",
    "body": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "text": "We move through life with meanings, purposes, and goals that we gradually discover or decide for ourselves. Some of these come from our upbringing, some from our experiences, and others from the dreams we form along the way. Yet as life unfolds, these meanings and identities are constantly tested. Sometimes we succeed and feel validated in who we believe we are. Other times we face failures that force us to question everything we thought we understood about ourselves.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Over time, I’ve come to realize something important: some people eventually find their true identity and discover a purpose that feels permanent—something that gives their life lasting direction. But I also see that many people never quite reach that point. They move through life without ever clearly seeing who they are or why they do what they do. In a sense, they live their entire lives in a kind of blindness.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "This realization led me to ask an important question: How does one truly see?",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "How does a person find a motivation so real and enduring that it lasts a lifetime—something worth believing in, protecting, and nurturing as life unfolds?",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "I am still at the beginning of my own journey, and my story is far from complete. But there is one thing I’ve come to believe with certainty: the search must begin with the self. It begins with the individual.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "To truly understand who we are, we must reflect on our past and examine our present. We must look deeply within ourselves and observe the patterns of our lives—the choices we make, the emotions that drive us, the successes we celebrate, and the failures we endure. All of these moments are data points in the story of who we are. When we take the time to reflect on them honestly, they become clues that help us understand our real identity.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Through self-reflection, we inevitably discover both strengths and weaknesses. For a long time, I viewed my weaknesses as burdens—things that needed to be eliminated so that I could become a better version of myself. Looking back now, I realize that this was a very negative perspective. Trying to erase what we perceive as weaknesses can mean erasing parts of ourselves that may actually hold hidden value.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "What if the burdens we see are not burdens at all?",
              "type": "text"
            },
            {
              "type": "hardBreak"
            },
            {
              "text": "What if they are strengths that we simply have not learned how to understand yet?",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "I experienced this realization personally.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "I have always been someone who thinks deeply about many things. Even small daily interactions can stay in my mind long after they occur. If a conversation didn’t go well, I might spend a significant amount of time replaying it—thinking about what I could have said differently or how I could have handled it better.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "At times, this habit felt exhausting. Thinking about events we cannot change can drain our energy. When our thoughts focus on negative perspectives, they can stir up emotions that leave us feeling even worse than before. Instead of helping us grow, this cycle can make us feel incapable or inadequate.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "For a long time, I saw this tendency as a weakness.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "But eventually I began to see it differently.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "The ability to reflect deeply is not inherently negative. It can become a powerful strength when used in the right way. Reflection allows us to learn from experience. It allows us to understand ourselves and others more clearly. What once felt like a burden can become a source of awareness, growth, and empathy.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "In many ways, the real challenge is learning how to guide our reflections, rather than letting them guide us into negativity.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Life can make this difficult. Modern life is busy, fast-moving, and often filled with routine responsibilities. In the middle of all the mundane tasks and pressures, it becomes easy to lose sight of what truly matters. I have experienced this myself—living through periods where I felt drained, unmotivated, and even incapable.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "That, to me, is a terrible way to live.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Life is already challenging enough without the added weight of believing we are powerless or without direction. To move through our limited time on this earth feeling constantly defeated is not how our lives should be lived.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Life is full of remarkable experiences. The people we meet, the challenges we face, the lessons we learn—these moments shape who we become. When we reflect on them with a healthier perspective, we begin to see that our past does not merely define us; it also guides us.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "To live with ongoing inspiration, motivation, and passion is not only possible—it is a worthwhile pursuit.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Of course, this is easier said than done. The journey toward understanding oneself takes time, patience, and courage. But the alternative—never trying at all—is far worse.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Perhaps the most encouraging realization is that none of us are truly alone in this search. As we move through our own journeys, we discover others who are asking the same questions and walking similar paths. Together, we exchange experiences, share stories, and pass along pieces of wisdom that help each other grow.",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "In the end, this shared journey—learning, growing, and supporting one another—may be one of the greatest gifts life has to offer.",
              "type": "text"
            }
          ]
        }
      ]
    },
    "excerpt": "One's search for life meaning begins within...",
    "featured_image": null,
    "leaf_type": "prose",
    "season": "spring",
    "growth": "seedling",
    "vines": [],
    "status": "published",
    "is_forest_floor": false,
    "published_at": "2026-03-14T21:29:24.334",
    "created_at": "2026-03-14T21:34:15.152861",
    "updated_at": "2026-03-15T07:00:00.084169"
  },
  {
    "id": "e3154291-f8b0-445d-9608-3b79ebca2231",
    "title": "The Highland Oak Tree",
    "slug": "untitled-blossom-1",
    "body": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "text": "\"Our heritage. Our hope.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "Our mother gave us her spirit.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "We will not let evil take root in her soil.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "For our children.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "For our community.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "For the world to come. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "This is our cause. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "This is our stand. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "We believe: evil cannot overcome the righteous. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "We have watched long enough. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "Now we rise. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "For our mother.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "For her goodness. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "For her hope. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "For our roots.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "For our home. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "For the Highland Oaks!\"",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        }
      ]
    },
    "excerpt": "Evil cannot overcome the righteous",
    "featured_image": null,
    "leaf_type": "blossom",
    "season": "spring",
    "growth": "seedling",
    "vines": [
      "philosophy"
    ],
    "status": "published",
    "is_forest_floor": false,
    "published_at": "2026-03-14T22:20:10.624",
    "created_at": "2026-03-15T04:58:33.555824",
    "updated_at": "2026-03-15T07:00:00.084169"
  },
  {
    "id": "22422030-73b4-42d2-8871-d5156b8801f3",
    "title": "A Lone Wolf",
    "slug": "untitled-blossom-2",
    "body": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "text": "\"A lone wolf survives.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "In the cold, he endures.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "But winter is long. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "A pack thrives",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "not louder,",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "but warmer.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "When the cold closes in, ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "titles fall.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "Egos fade.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "Excuses die. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "One mind.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "One vision.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "One hunt. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "We are the pack. ",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "We are the team.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "We have sharpened in silence.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "We have waited through the frost.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "When time comes,",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "together",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "we feast.\"",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        }
      ]
    },
    "excerpt": "A team, a pack",
    "featured_image": null,
    "leaf_type": "blossom",
    "season": "spring",
    "growth": "seedling",
    "vines": [
      "team work"
    ],
    "status": "published",
    "is_forest_floor": false,
    "published_at": "2026-03-14T22:18:19.913",
    "created_at": "2026-03-15T05:02:17.751608",
    "updated_at": "2026-03-15T07:00:00.084169"
  },
  {
    "id": "03253757-9189-4175-b5ae-9edc097ac019",
    "title": "A relay, a race",
    "slug": "untitled-blossom-4",
    "body": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "text": "\"A relay, race",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "many steps, one pace.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "Each hand bears the weight,",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "each stride finds its place.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "Ice in the breath,",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "eyes fixed on the line.",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "Run the ground beneath us,",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "until the crown is mine...",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "type": "hardBreak",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            },
            {
              "text": "and ours in time.\"",
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ]
            }
          ]
        }
      ]
    },
    "excerpt": "Each hand bears the weight",
    "featured_image": null,
    "leaf_type": "blossom",
    "season": "spring",
    "growth": "seedling",
    "vines": [
      "team work"
    ],
    "status": "published",
    "is_forest_floor": false,
    "published_at": "2026-03-14T22:23:36.171",
    "created_at": "2026-03-15T05:20:45.938191",
    "updated_at": "2026-03-15T07:00:00.084169"
  },
  {
    "id": "5fa00df8-33a3-48e9-b6c9-4179b49fcc96",
    "title": "Creativity",
    "slug": "untitled-seed",
    "body": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Creativity ≈ Practice × Combinations × Iterations × (Chaos + Order)",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Where:",
              "type": "text"
            }
          ]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "text": "Practice",
                      "type": "text",
                      "marks": [
                        {
                          "type": "bold"
                        }
                      ]
                    },
                    {
                      "text": " – The number of times you engage with a skill or idea.",
                      "type": "text"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "text": "Combinations",
                      "type": "text",
                      "marks": [
                        {
                          "type": "bold"
                        }
                      ]
                    },
                    {
                      "text": " – The different ways you connect ideas, skills, or perspectives.",
                      "type": "text"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "text": "Iterations",
                      "type": "text",
                      "marks": [
                        {
                          "type": "bold"
                        }
                      ]
                    },
                    {
                      "text": " – The number of experiments or refinements you attempt.",
                      "type": "text"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "text": "Chaos",
                      "type": "text",
                      "marks": [
                        {
                          "type": "bold"
                        }
                      ]
                    },
                    {
                      "text": " – Randomness, unexpected influences, mistakes, or external inputs.",
                      "type": "text"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "text": "Order",
                      "type": "text",
                      "marks": [
                        {
                          "type": "bold"
                        }
                      ]
                    },
                    {
                      "text": " – Structure, discipline, and the ability to organize ideas.",
                      "type": "text"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Interpretation:",
              "type": "text"
            },
            {
              "type": "hardBreak"
            },
            {
              "text": "Creativity emerges when repeated practice allows you to experiment with many combinations of ideas, refine them through iterations, and balance randomness (chaos) with structure (order).",
              "type": "text"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Meaning:",
              "type": "text"
            }
          ]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "text": "Repetition builds skill",
                      "type": "text"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "text": "Recombination generates ideas",
                      "type": "text"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "text": "Experimentation discovers what works",
                      "type": "text"
                    }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "text": "The tension between chaos and order produces originality",
                      "type": "text"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "paragraph"
        }
      ]
    },
    "excerpt": "Formula for creativity",
    "featured_image": null,
    "leaf_type": "seed",
    "season": "spring",
    "growth": "seedling",
    "vines": [
      "philosophy"
    ],
    "status": "published",
    "is_forest_floor": false,
    "published_at": "2026-03-15T18:09:18.248",
    "created_at": "2026-03-16T00:28:59.906746",
    "updated_at": "2026-03-16T01:09:18.249306"
  }
];

const CHIRPS: ChirpRow[] = [
  {
    "id": "cdbcb831-920b-4c6c-bc59-bdd8a8a66a98",
    "title": "The Highland Oak Tree Blog Is Going Live!",
    "body": "The H.O.T Blog is going live today! I look forward to a bright and hopeful beginning!  ",
    "is_pinned": false,
    "status": "published",
    "expires_at": null,
    "published_at": "2026-03-15T17:25:48.983",
    "deleted_at": null,
    "created_at": "2026-03-16T00:23:19.563944",
    "updated_at": "2026-03-16T00:25:48.988403"
  }
];
