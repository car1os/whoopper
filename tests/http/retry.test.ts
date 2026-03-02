import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../src/http/retry.js';
import { RateLimitError, ServerError } from '../../src/errors/http.js';

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const result = await withRetry(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('retries on ServerError and succeeds', async () => {
    let calls = 0;
    const result = await withRetry(
      () => {
        calls++;
        if (calls < 3) throw new ServerError(500);
        return Promise.resolve('recovered');
      },
      { baseDelayMs: 1, maxDelayMs: 10 },
    );

    expect(result).toBe('recovered');
    expect(calls).toBe(3);
  });

  it('retries on RateLimitError and respects retryAfter', async () => {
    let calls = 0;
    const start = Date.now();
    await withRetry(
      () => {
        calls++;
        if (calls < 2) throw new RateLimitError(0.01); // 10ms
        return Promise.resolve('ok');
      },
      { baseDelayMs: 1, maxDelayMs: 100 },
    );

    expect(calls).toBe(2);
    expect(Date.now() - start).toBeGreaterThanOrEqual(5);
  });

  it('throws non-retryable errors immediately', async () => {
    const error = new Error('not retryable');
    let calls = 0;

    await expect(
      withRetry(() => {
        calls++;
        throw error;
      }),
    ).rejects.toThrow('not retryable');

    expect(calls).toBe(1);
  });

  it('throws after max attempts exhausted', async () => {
    let calls = 0;

    await expect(
      withRetry(
        () => {
          calls++;
          throw new ServerError(503);
        },
        { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 },
      ),
    ).rejects.toThrow(ServerError);

    expect(calls).toBe(3);
  });
});
