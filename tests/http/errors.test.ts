import { describe, it, expect } from 'vitest';
import { mapHttpError } from '../../src/http/errors.js';
import { TokenExpiredError, AuthenticationError } from '../../src/errors/auth.js';
import {
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../../src/errors/http.js';

function makeHeaders(entries: Record<string, string> = {}): Headers {
  return new Headers(entries);
}

describe('mapHttpError', () => {
  it('maps 400 to ValidationError', () => {
    const err = mapHttpError(400, { message: 'bad input' }, makeHeaders());
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.message).toBe('bad input');
  });

  it('maps 401 to TokenExpiredError', () => {
    const err = mapHttpError(401, {}, makeHeaders());
    expect(err).toBeInstanceOf(TokenExpiredError);
  });

  it('maps 403 to AuthenticationError', () => {
    const err = mapHttpError(403, {}, makeHeaders());
    expect(err).toBeInstanceOf(AuthenticationError);
  });

  it('maps 404 to NotFoundError', () => {
    const err = mapHttpError(404, {}, makeHeaders());
    expect(err).toBeInstanceOf(NotFoundError);
  });

  it('maps 429 to RateLimitError with retryAfter', () => {
    const err = mapHttpError(429, {}, makeHeaders({ 'retry-after': '30' }));
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).retryAfter).toBe(30);
  });

  it('maps 429 to RateLimitError without retryAfter', () => {
    const err = mapHttpError(429, {}, makeHeaders());
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).retryAfter).toBeNull();
  });

  it('maps 500+ to ServerError', () => {
    const err = mapHttpError(503, { message: 'unavailable' }, makeHeaders());
    expect(err).toBeInstanceOf(ServerError);
    expect((err as ServerError).statusCode).toBe(503);
  });

  it('handles non-object body', () => {
    const err = mapHttpError(400, 'raw text', makeHeaders());
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.message).toBe('HTTP 400');
  });
});
