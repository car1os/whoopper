import { RateLimitError, ServerError } from '../errors/http.js';
import type { WhoopError } from '../errors/base.js';

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 5,
  baseDelayMs: 1000,
  maxDelayMs: 60000,
};

function isRetryable(error: unknown): error is WhoopError {
  return error instanceof RateLimitError || error instanceof ServerError;
}

function getRetryDelay(error: unknown, attempt: number, options: RetryOptions): number {
  if (error instanceof RateLimitError && error.retryAfter !== null) {
    return error.retryAfter * 1000;
  }
  const exponential = options.baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * options.baseDelayMs;
  return Math.min(exponential + jitter, options.maxDelayMs);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts = { ...DEFAULT_RETRY, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === opts.maxAttempts - 1) {
        throw error;
      }
      const delay = getRetryDelay(error, attempt, opts);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
