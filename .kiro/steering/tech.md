# Enterprise Modular Architecture & Secure AI Standards (v3.0)

## 1. Modular System Architecture
To support large-scale growth and developer hand-off, all 10 applications must follow these structural mandates:

- **Monorepo / Workspace Strategy**: 
  - Use **pnpm workspaces** (Node) or **Poetry Workspaces** (Python).
  - Architecture: `apps/` (User-facing), `packages/` (Shared logic: UI-kit, Auth-lib, Database-models).
- **Clean Architecture Pattern**:
  - **Domain Layer**: Entities and Business Logic (Framework agnostic).
  - **Application Layer**: Use Cases and Services.
  - **Infrastructure Layer**: TypeORM/SQLAlchemy configs, External API clients (AWS SDK/Bedrock).
  - **Presentation Layer**: NestJS Controllers / FastAPI Routes / React-Vue Components.
- **Inter-Module Communication**:
  - Internal: Use **NestJS Modules** or **Python Packages** with strict explicit exports.
  - External: Real-time events via **Socket.IO**; async tasks via **Bull/Celery**.

## 2. Framework & Language Specifications
- **Node.js 22+ (LTS)**: Strict TypeScript (v5.4+). Avoid `any`; use `unknown` or interfaces.
- **Python 3.12+**: Mandatory **Type Hints** and **Pydantic v2** for all data structures.
- **Frontend**: 
  - **React 19+ / Vue 3**: Functional components only. 
  - **State**: Centralized Store (Pinia/Zustand) + Server State (TanStack Query) to manage caching.

## 3. Secure AI Integration (Claude 4.6 & Bedrock)
- **Model Hierarchy**: 
  - **Lead Architect**: `claude-opus-4-6-20260205` (Architectural decisions, code reviews).
  - **Implementation Subagents**: `claude-sonnet-4-6` (Feature execution).
- **Agentic Logic**: 
  - Mandatory use of **Bedrock AgentCore** for stateful multi-step development.
  - **Guardrails**: All AI-generated code must pass through a `Bedrock Guardrail` check for PII and security vulnerabilities before local ingestion.
- **Code Interpreter**: Use Bedrock's sandbox for testing complex algorithms before committing to the repo.

## 4. Development Operations & Local DX (Ubuntu/Pop!_OS)
- **Containerization**: 
  - **Podman Desktop**: Local runtime. No `sudo` requirements.
  - **Environment Isolation**: Use `direnv` or `.env.local` to prevent cross-app port/variable collisions.
- **Identity**: Authenticate via `aws-vault` to prevent plaintext keys in `.env` files.


| Role | Tooling | Target |
| :--- | :--- | :--- |
| **Auth** | Amazon Cognito | RBAC / MFA |
| **Database** | PostgreSQL 16 | ACID / Relational |
| **Caching** | Redis 7 | Pub/Sub / Queue |
| **IaC** | Terraform / OpenTofu | AWS Modular Components |

## 5. Testing & Quality Assurance (The "Triple Check")
1.  **Static Analysis**: ESLint/Prettier (Node) or Ruff (Python) must run on every save.
2.  **Logic Verification**: 
    - **Property Testing**: `fast-check` (Node) or `Hypothesis` (Python) for edge cases.
    - **E2E**: Playwright for cross-browser/framework testing.
3.  **AI Audit**: Every PR must be reviewed by the **Opus 4.6 Lead Architect** agent against this `tech.md`.

## 6. Project Visibility (Notion + MCP)
- **Real-time Sync**: Kiro agents update the **Notion Master Roadmap** via MCP.
- **Documentation**: 
  - `docs/ADR/`: Architectural Decision Records (Why we chose X).
  - `docs/API/`: Auto-generated OpenAPI/Swagger specs.
- **Status Reporting**: 10% progress increments logged to Notion automatically.

---
**Last Updated**: February 23, 2026 | **Status**: Certified for Multi-Dev / Multi-App Scale
