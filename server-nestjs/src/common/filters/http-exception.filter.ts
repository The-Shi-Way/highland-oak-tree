import { randomUUID } from 'node:crypto';

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import { DomainError } from '@shared/types';

interface IErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  field?: string;
  correlationId: string;
}

const DOMAIN_ERROR_STATUS_MAP: Record<DomainError['kind'], HttpStatus> = {
  not_found: HttpStatus.NOT_FOUND,
  validation: HttpStatus.BAD_REQUEST,
  unauthorized: HttpStatus.UNAUTHORIZED,
  conflict: HttpStatus.CONFLICT,
  external_service: HttpStatus.BAD_GATEWAY,
};

/**
 * Catches DomainError objects thrown (or passed) from controllers
 * and maps them to structured HTTP error responses.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const correlationId = randomUUID();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>)['message'] ?? exception.message;

      const body: IErrorResponse = {
        statusCode: status,
        error: HttpStatus[status] ?? 'Error',
        message: Array.isArray(message) ? message.join(', ') : String(message),
        correlationId,
      };

      this.logger.warn(`[${correlationId}] HTTP ${status}: ${body.message}`);
      response.status(status).json(body);
      return;
    }

    // Handle DomainError objects passed directly
    if (this.isDomainError(exception)) {
      const status = DOMAIN_ERROR_STATUS_MAP[exception.kind];
      const body: IErrorResponse = {
        statusCode: status,
        error: exception.kind,
        message: this.getDomainErrorMessage(exception),
        correlationId,
      };

      if (exception.kind === 'validation' && exception.field) {
        body.field = exception.field;
      }

      this.logger.warn(`[${correlationId}] Domain ${exception.kind}: ${body.message}`);
      response.status(status).json(body);
      return;
    }

    // Fallback for unexpected errors
    this.logger.error(`[${correlationId}] Unhandled exception`, exception);
    const body: IErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      correlationId,
    };
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }

  private isDomainError(error: unknown): error is DomainError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'kind' in error &&
      typeof (error as DomainError).kind === 'string' &&
      (error as DomainError).kind in DOMAIN_ERROR_STATUS_MAP
    );
  }

  private getDomainErrorMessage(error: DomainError): string {
    switch (error.kind) {
      case 'not_found':
        return `${error.entity} with id ${error.id} not found`;
      case 'validation':
        return error.message;
      case 'unauthorized':
        return error.message;
      case 'conflict':
        return error.message;
      case 'external_service':
        return `${error.service}: ${error.message}`;
    }
  }
}
