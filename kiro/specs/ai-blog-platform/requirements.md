# Requirements Document

> **⚠️ ARCHIVED** — This spec is superseded by [`living-tree-redesign`](../living-tree-redesign/requirements.md). The Post/Poem dual-entity model described here has been replaced by the unified Leaf content system. Kept for historical reference only.

## Introduction

A personal blog platform for an AI engineer and consultant, combining technical writing, poetry, and multimedia content with AI-powered content assistance. The platform serves two audiences: the admin author who creates and manages content, and public readers who consume it without authentication. The system is hosted on AWS, built with NestJS + Vue 3, and integrates AWS Bedrock for AI-assisted content refinement.

## Glossary

- **Blog_Platform**: The full-stack web application comprising the backend API, frontend client, and supporting infrastructure
- **Admin**: The authenticated blog owner who creates, edits, publishes, and manages all content
- **Reader**: An unauthenticated public visitor who browses and reads published content
- **Post**: A piece of written content with a title, body (rich text/Markdown), optional media attachments, tags, and metadata
- **Poem**: A specialized content type displayed with creative typography and layout on a dedicated poetry page
- **Media_Asset**: An uploaded file (image, video, audio, or document) stored in S3 and referenced by posts or poems
- **AI_Assistant**: The AWS Bedrock-backed service that reviews, rewrites, or suggests improvements to draft content
- **Content_Editor**: The rich-text editing interface used by the Admin to compose posts and poems
- **Auth_Service**: The Amazon Cognito-backed authentication and authorization layer for Admin access
- **Media_Service**: The backend service responsible for uploading, storing, transforming, and serving media assets
- **Post_Service**: The backend service managing CRUD operations, publishing workflow, and querying of posts
- **Poem_Service**: The backend service managing CRUD operations and presentation data for poems
- **Search_Service**: The service providing full-text search across published posts and poems

## Requirements

### Requirement 1: Admin Authentication

**User Story:** As the blog Admin, I want to securely log in to manage my content, so that only I can create, edit, and publish posts and poems.

#### Acceptance Criteria

1. WHEN the Admin navigates to the login page, THE Auth_Service SHALL present a login form requesting email and password credentials
2. WHEN the Admin submits valid credentials, THE Auth_Service SHALL issue a JWT session token and redirect the Admin to the dashboard
3. WHEN the Admin submits invalid credentials, THE Auth_Service SHALL return a descriptive error message without revealing which field is incorrect
4. WHILE the Admin holds a valid session token, THE Blog_Platform SHALL grant access to all content management endpoints
5. WHEN the Admin session token expires, THE Auth_Service SHALL require re-authentication before granting further access
6. IF an unauthenticated user attempts to access a content management endpoint, THEN THE Auth_Service SHALL return a 401 Unauthorized response

### Requirement 2: Blog Post Management

**User Story:** As the Admin, I want to create, edit, publish, unpublish, and delete blog posts, so that I can share technical and business insights with my audience.

#### Acceptance Criteria

1. WHEN the Admin creates a new post with a title and body, THE Post_Service SHALL save the post in draft status with a generated slug, creation timestamp, and the Admin as author
2. WHEN the Admin edits an existing post, THE Post_Service SHALL update the post content and record the modification timestamp
3. WHEN the Admin publishes a draft post, THE Post_Service SHALL change the post status to published and set the publication timestamp
4. WHEN the Admin unpublishes a published post, THE Post_Service SHALL change the post status back to draft and remove the post from public listings
5. WHEN the Admin deletes a post, THE Post_Service SHALL perform a soft delete, marking the post as archived rather than removing data
6. WHEN the Admin assigns tags to a post, THE Post_Service SHALL associate the provided tags with the post for categorization and filtering
7. THE Post_Service SHALL generate a URL-safe slug from the post title, appending a numeric suffix when a duplicate slug exists

### Requirement 3: Poetry Page and Poem Management

**User Story:** As the Admin, I want to manage poems displayed on a dedicated poetry page with creative formatting, so that I can showcase my poetry in a visually distinctive way.

#### Acceptance Criteria

1. WHEN the Admin creates a new poem with a title and body, THE Poem_Service SHALL save the poem in draft status with a creation timestamp
2. WHEN the Admin publishes a poem, THE Poem_Service SHALL change the poem status to published and include the poem on the public poetry page
3. WHEN the Admin assigns a display theme to a poem, THE Poem_Service SHALL store the selected theme identifier for use during rendering
4. WHEN a Reader visits the poetry page, THE Blog_Platform SHALL display all published poems using their assigned creative themes with typography and layout distinct from standard blog posts
5. WHEN a Reader selects a single poem, THE Blog_Platform SHALL render the poem in a full-page immersive view with the assigned theme applied

### Requirement 4: Media Upload and Management

**User Story:** As the Admin, I want to upload images, videos, audio files, and documents to attach to my posts and poems, so that I can create rich multimedia content.

#### Acceptance Criteria

1. WHEN the Admin uploads a file, THE Media_Service SHALL validate the file type against an allowed list (images: JPEG, PNG, WebP, GIF, SVG; video: MP4, WebM; audio: MP3, WAV, OGG; documents: PDF)
2. WHEN the Admin uploads a valid file, THE Media_Service SHALL store the file in S3 and return a unique media asset identifier and a CDN-accessible URL
3. IF the Admin uploads a file exceeding the maximum allowed size (50 MB), THEN THE Media_Service SHALL reject the upload and return a descriptive error indicating the size limit
4. IF the Admin uploads a file with a disallowed type, THEN THE Media_Service SHALL reject the upload and return a descriptive error listing allowed types
5. WHEN the Admin uploads an image, THE Media_Service SHALL generate responsive thumbnail variants (small: 320px, medium: 768px, large: 1280px width) in addition to storing the original
6. WHEN the Admin attaches a media asset to a post or poem, THE Post_Service or Poem_Service SHALL record the association between the content and the media asset
7. WHEN the Admin deletes a media asset, THE Media_Service SHALL remove the S3 object and all generated variants, and remove associations from any referencing content

### Requirement 5: AI-Assisted Content Editing

**User Story:** As the Admin, I want to run my draft content through an AI assistant to get suggestions for improving clarity, tone, grammar, and structure, so that I can publish higher-quality writing.

#### Acceptance Criteria

1. WHEN the Admin requests an AI review of a draft post or poem, THE AI_Assistant SHALL send the content to AWS Bedrock and return improvement suggestions within 30 seconds
2. WHEN the AI_Assistant returns suggestions, THE Content_Editor SHALL display the suggestions alongside the original text with clear diff highlighting
3. WHEN the Admin accepts a suggestion, THE Content_Editor SHALL apply the change to the draft content
4. WHEN the Admin rejects a suggestion, THE Content_Editor SHALL discard the suggestion and preserve the original text unchanged
5. WHEN the Admin requests a full rewrite of selected text, THE AI_Assistant SHALL return a rewritten version while preserving the original meaning and the Admin's voice
6. IF the AI_Assistant service is unavailable, THEN THE Content_Editor SHALL display a clear error message and allow the Admin to continue editing without AI assistance
7. THE AI_Assistant SHALL include a system prompt instructing the model to maintain the Admin's personal writing style and tone

### Requirement 6: Public Blog Reading Experience

**User Story:** As a Reader, I want to browse and read published blog posts without needing to log in, so that I can access the content freely.

#### Acceptance Criteria

1. WHEN a Reader visits the blog homepage, THE Blog_Platform SHALL display a paginated list of published posts ordered by publication date descending
2. WHEN a Reader selects a post from the listing, THE Blog_Platform SHALL render the full post content with all attached media, author info, publication date, and tags
3. WHEN a Reader filters posts by tag, THE Blog_Platform SHALL display only published posts associated with the selected tag
4. WHEN a Reader navigates to a post via its slug URL, THE Blog_Platform SHALL render the corresponding published post
5. IF a Reader navigates to a slug URL for a non-existent or unpublished post, THEN THE Blog_Platform SHALL return a 404 page with a link back to the homepage
6. WHEN a Reader views a post, THE Blog_Platform SHALL render the page with appropriate Open Graph and meta tags for social media sharing

### Requirement 7: Search

**User Story:** As a Reader, I want to search across all published content, so that I can find posts and poems relevant to my interests.

#### Acceptance Criteria

1. WHEN a Reader submits a search query, THE Search_Service SHALL return published posts and poems matching the query, ranked by relevance
2. WHEN displaying search results, THE Search_Service SHALL include the content title, an excerpt with highlighted matching terms, content type (post or poem), and publication date
3. IF a search query returns no results, THEN THE Search_Service SHALL display a message indicating no matches and suggest broadening the search terms
4. THE Search_Service SHALL support full-text search across post titles, post bodies, poem titles, and poem bodies

### Requirement 8: Responsive Design and Performance

**User Story:** As a Reader, I want the blog to load quickly and display correctly on any device, so that I have a good reading experience regardless of how I access the site.

#### Acceptance Criteria

1. THE Blog_Platform SHALL render all public pages in a responsive layout that adapts to viewport widths from 320px to 2560px
2. THE Blog_Platform SHALL achieve a Lighthouse performance score of 90 or above on published post pages
3. WHEN serving images, THE Blog_Platform SHALL use responsive image srcsets to deliver the appropriately sized variant based on the Reader's viewport
4. THE Blog_Platform SHALL implement server-side rendering or static generation for published content pages to optimize initial load time

### Requirement 9: Content Serialization

**User Story:** As the Admin, I want my post and poem content stored in a structured format that can be reliably saved and rendered, so that content integrity is maintained across edits and displays.

#### Acceptance Criteria

1. THE Post_Service SHALL serialize post body content to a structured JSON format for storage
2. THE Post_Service SHALL deserialize stored JSON content back to the editor-compatible format without data loss
3. FOR ALL valid Post content objects, serializing then deserializing SHALL produce an equivalent object (round-trip property)
4. THE Poem_Service SHALL serialize poem body content to a structured JSON format for storage
5. THE Poem_Service SHALL deserialize stored JSON content back to the editor-compatible format without data loss
6. FOR ALL valid Poem content objects, serializing then deserializing SHALL produce an equivalent object (round-trip property)

### Requirement 10: SEO and Social Sharing

**User Story:** As the Admin, I want my blog to be well-indexed by search engines and shareable on social media, so that my content reaches a wider audience.

#### Acceptance Criteria

1. THE Blog_Platform SHALL generate a sitemap.xml containing URLs for all published posts and the poetry page
2. WHEN a post is published or unpublished, THE Blog_Platform SHALL regenerate the sitemap.xml within 5 minutes
3. THE Blog_Platform SHALL render canonical URL meta tags on every public page
4. THE Blog_Platform SHALL render Open Graph tags (og:title, og:description, og:image, og:type) on every published post and poem page
5. THE Blog_Platform SHALL render a robots.txt file that permits indexing of public content and disallows indexing of admin routes

### Requirement 11: Admin Dashboard

**User Story:** As the Admin, I want a dashboard showing an overview of my content and recent activity, so that I can quickly assess the state of my blog.

#### Acceptance Criteria

1. WHEN the Admin navigates to the dashboard, THE Blog_Platform SHALL display counts of total posts, published posts, draft posts, total poems, and total media assets
2. WHEN the Admin navigates to the dashboard, THE Blog_Platform SHALL display a list of the 10 most recently modified content items (posts and poems) with their status and last modified date
3. WHEN the Admin selects a content item from the dashboard list, THE Blog_Platform SHALL navigate to the edit view for that item

### Requirement 12: Deployment and CI/CD

**User Story:** As the Admin, I want the blog deployed to AWS with automated CI/CD pipelines, so that I can ship updates reliably with zero-downtime deployments.

#### Acceptance Criteria

1. THE Blog_Platform SHALL be deployable to AWS using containerized services (ECS Fargate) with infrastructure defined as code (Terraform)
2. WHEN code is merged to the `develop` branch, THE CI/CD pipeline SHALL automatically build, test, and deploy to a staging environment
3. WHEN code is merged to the `main` branch, THE CI/CD pipeline SHALL build, test, and deploy to production after manual approval
4. THE CI/CD pipeline SHALL run lint, type-check, unit tests, and property tests on every pull request before allowing merge
5. THE deployment process SHALL use rolling updates with health checks to achieve zero-downtime deployments
6. THE Blog_Platform SHALL store all secrets (database credentials, API keys) in AWS Secrets Manager, never in source code or environment files committed to Git
