import { TokenExpiredError, AuthenticationError } from '../errors/auth.js';
import {
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../errors/http.js';
import type { WhoopError } from '../errors/base.js';

export function mapHttpError(
  status: number,
  body: unknown,
  headers: Headers,
): WhoopError {
  const details = typeof body === 'object' && body !== null
    ? (body as Record<string, unknown>)
    : { body };
  const message = typeof body === 'object' && body !== null && 'message' in body
    ? String((body as Record<string, unknown>).message)
    : `HTTP ${status}`;

  switch (status) {
    case 400:
      return new ValidationError(message, details);
    case 401:
      return new TokenExpiredError(message, details);
    case 403:
      return new AuthenticationError(message, details);
    case 404:
      return new NotFoundError(message, details);
    case 429: {
      const retryAfterHeader = headers.get('retry-after');
      const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : null;
      return new RateLimitError(retryAfter, message, details);
    }
    default:
      if (status >= 500) {
        return new ServerError(status, message, details);
      }
      return new ServerError(status, message, details);
  }
}
