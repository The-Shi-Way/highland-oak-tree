/**
 * Discriminated union for all domain errors.
 * Controllers map these to HTTP status codes via the global exception filter.
 */
export type DomainError =
  | { kind: 'not_found'; entity: string; id: string }
  | { kind: 'validation'; message: string; field?: string }
  | { kind: 'unauthorized'; message: string }
  | { kind: 'conflict'; message: string }
  | { kind: 'external_service'; service: string; message: string };

/** Extract a human-readable message from any DomainError variant. */
export function getErrorMessage(error: DomainError): string {
  if (error.kind === 'not_found') {
    return `${error.entity} with id ${error.id} not found`;
  }
  return error.message;
}
