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
    // Dev-mode bypass: skip Cognito when running locally
    if (this.config.get<string>('NODE_ENV') === 'development') {
      return this.devLogin(email, password);
    }

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
    // Dev-mode bypass
    if (this.config.get<string>('NODE_ENV') === 'development' && refreshToken === 'dev-refresh-token') {
      const devEmail = this.config.get<string>('DEV_ADMIN_EMAIL', 'admin@highland.dev');
      return ok({
        accessToken: this.createDevToken(devEmail),
        refreshToken: 'dev-refresh-token',
        expiresIn: 86400,
      });
    }

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
    // Dev-mode: skip Cognito GlobalSignOut
    if (this.config.get<string>('NODE_ENV') === 'development' && accessToken.endsWith('.dev-signature')) {
      return ok(undefined);
    }

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
   * Dev-mode login: accepts credentials from DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD env vars.
   * Returns a self-signed mock JWT that CognitoGuard can decode.
   * NEVER runs in production — guarded by NODE_ENV check in login().
   */
  private devLogin(email: string, password: string): Result<IAuthTokens, DomainError> {
    const devEmail = this.config.get<string>('DEV_ADMIN_EMAIL', 'admin@highland.dev');
    const devPassword = this.config.get<string>('DEV_ADMIN_PASSWORD', 'Admin123!');

    if (email !== devEmail || password !== devPassword) {
      return err({ kind: 'unauthorized', message: 'Invalid email or password' });
    }

    this.logger.warn('Dev-mode login bypass active — do NOT use in production');

    const accessToken = this.createDevToken(devEmail);
    return ok({
      accessToken,
      refreshToken: 'dev-refresh-token',
      expiresIn: 86400, // 24 hours
    });
  }

  /** Build a base64url-encoded mock JWT for local dev. */
  private createDevToken(email: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'dev-admin-001',
        email,
        exp: Math.floor(Date.now() / 1000) + 86400,
        iss: 'highland-dev',
      }),
    ).toString('base64url');
    return `${header}.${payload}.dev-signature`;
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
