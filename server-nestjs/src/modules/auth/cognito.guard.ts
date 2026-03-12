import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { getErrorMessage } from '@shared/types';

/**
 * Route guard that validates JWT Bearer tokens on protected endpoints.
 * Requirement 1.4: Valid session grants access to content management endpoints.
 * Requirement 1.6: Unauthenticated requests receive 401.
 */
@Injectable()
export class CognitoGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    const result = this.authService.validateToken(token);

    if (!result.ok) {
      throw new UnauthorizedException(getErrorMessage(result.error));
    }

    // Attach user info to request for downstream use
    const req = request as unknown as Record<string, unknown>;
    req['user'] = result.value;
    return true;
  }
}
