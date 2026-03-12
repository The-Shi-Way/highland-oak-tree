/**
 * Auth module interfaces — contracts for authentication tokens and payloads.
 */

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ITokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
