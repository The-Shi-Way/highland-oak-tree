# ADR-002: Railway-Oriented Error Handling

## Status
Accepted

## Date
2026-03-13

## Context
NestJS conventionally uses thrown exceptions for error handling. This makes control flow harder to trace, mixes error handling with business logic, and makes property-based testing more complex (catching exceptions vs checking return values).

## Decision
All domain services return `Result<T, DomainError>` instead of throwing exceptions. The `DomainError` type is a discriminated union with variants: `not_found`, `validation`, `unauthorized`, `conflict`, `external_service`. Controllers map these to HTTP status codes via a global exception filter.

## Consequences
- Domain logic is pure and testable without try/catch
- Error paths are explicit in type signatures
- Property tests can assert on Result values directly
- Controllers have a single mapping layer from DomainError to HTTP responses
- Slightly more verbose than throw/catch but significantly more predictable
