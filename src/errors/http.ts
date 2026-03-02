import { WhoopError } from './base.js';

export class HttpError extends WhoopError {
  constructor(
    message: string,
    public readonly statusCode: number,
    details?: Record<string, unknown>,
  ) {
    super(message, details);
    this.name = 'HttpError';
  }
}

export class ValidationError extends HttpError {
  constructor(message = 'Validation failed', details?: Record<string, unknown>) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found', details?: Record<string, unknown>) {
    super(message, 404, details);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends HttpError {
  constructor(
    public readonly retryAfter: number | null,
    message = 'Rate limit exceeded',
    details?: Record<string, unknown>,
  ) {
    super(message, 429, details);
    this.name = 'RateLimitError';
  }
}

export class ServerError extends HttpError {
  constructor(
    statusCode: number,
    message = 'Server error',
    details?: Record<string, unknown>,
  ) {
    super(message, statusCode, details);
    this.name = 'ServerError';
  }
}
