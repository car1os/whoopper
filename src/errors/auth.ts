import { WhoopError } from './base.js';

export class AuthenticationError extends WhoopError {
  constructor(
    message = 'Authentication failed',
    details?: Record<string, unknown>,
  ) {
    super(message, details);
    this.name = 'AuthenticationError';
  }
}

export class TokenExpiredError extends WhoopError {
  constructor(
    message = 'Access token has expired',
    details?: Record<string, unknown>,
  ) {
    super(message, details);
    this.name = 'TokenExpiredError';
  }
}

export class RefreshTokenError extends WhoopError {
  constructor(
    message = 'Failed to refresh access token',
    details?: Record<string, unknown>,
  ) {
    super(message, details);
    this.name = 'RefreshTokenError';
  }
}
