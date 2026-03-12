import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  AuthFlowType,
  NotAuthorizedException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';

import { Result, ok, err, DomainError } from '@shared/types';
import { IAuthTokens } from './interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId: string;
  private readonly clientId: string;

  constructor(private readonly config: ConfigService) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
    });
    this.userPoolId = this.config.get<string>('COGNITO_USER_POOL_ID', '');
    this.clientId = this.config.get<string>('COGNITO_CLIENT_ID', '');
  }

  async login(email: string, password: string): Promise<Result<IAuthTokens, DomainError>> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.cognitoClient.send(command);
      const result = response.AuthenticationResult;

      if (!result?.AccessToken || !result?.RefreshToken) {
        return err({
          kind: 'external_service',
          service: 'Cognito',
          message: 'Authentication succeeded but tokens were not returned',
        });
      }

      return ok({
        accessToken: result.AccessToken,
        refreshToken: result.RefreshToken,
        expiresIn: result.ExpiresIn ?? 3600,
      });
    } catch (error: unknown) {
      if (
        error instanceof NotAuthorizedException ||
        error instanceof UserNotFoundException
      ) {
        // Requirement 1.3: Do not reveal which field is incorrect
        return err({
          kind: 'unauthorized',
          message: 'Invalid email or password',
        });
      }

      this.logger.error('Cognito login failed', error);
      return err({
        kind: 'external_service',
        service: 'Cognito',
        message: 'Authentication service is temporarily unavailable',
      });
    }
  }

  async refresh(refreshToken: string): Promise<Result<IAuthTokens, DomainError>> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: this.clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });

      const response = await this.cognitoClient.send(command);
      const result = response.AuthenticationResult;

      if (!result?.AccessToken) {
        return err({
          kind: 'external_service',
          service: 'Cognito',
          message: 'Token refresh succeeded but access token was not returned',
        });
      }

      return ok({
        accessToken: result.AccessToken,
        // Cognito refresh flow may not return a new refresh token
        refreshToken: result.RefreshToken ?? refreshToken,
        expiresIn: result.ExpiresIn ?? 3600,
      });
    } catch (error: unknown) {
      if (error instanceof NotAuthorizedException) {
        return err({
          kind: 'unauthorized',
          message: 'Session expired. Please log in again.',
        });
      }

      this.logger.error('Cognito token refresh failed', error);
      return err({
        kind: 'external_service',
        service: 'Cognito',
        message: 'Authentication service is temporarily unavailable',
      });
    }
  }

  async logout(accessToken: string): Promise<Result<void, DomainError>> {
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });

      await this.cognitoClient.send(command);
      return ok(undefined);
    } catch (error: unknown) {
      this.logger.error('Cognito logout failed', error);
      return err({
        kind: 'external_service',
        service: 'Cognito',
        message: 'Logout failed. Session may still be active.',
      });
    }
  }

  /**
   * Validates a JWT access token by decoding and checking expiry.
   * In production, also verify signature against Cognito JWKS.
   */
  validateToken(token: string): Result<{ sub: string; email: string }, DomainError> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return err({ kind: 'unauthorized', message: 'Malformed token' });
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8'),
      ) as Record<string, unknown>;

      const exp = payload['exp'];
      if (typeof exp === 'number' && exp * 1000 < Date.now()) {
        return err({ kind: 'unauthorized', message: 'Token has expired' });
      }

      const sub = payload['sub'];
      const email = payload['email'] ?? payload['cognito:username'];

      if (typeof sub !== 'string' || typeof email !== 'string') {
        return err({ kind: 'unauthorized', message: 'Invalid token payload' });
      }

      return ok({ sub, email });
    } catch {
      return err({ kind: 'unauthorized', message: 'Invalid token' });
    }
  }
}
