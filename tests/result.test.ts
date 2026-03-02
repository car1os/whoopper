import { describe, it, expect } from 'vitest';
import { ok, err, tryCatch } from '../src/result/result.js';

describe('Result', () => {
  it('ok wraps a value', () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it('err wraps an error', () => {
    const result = err(new Error('fail'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('fail');
    }
  });

  it('tryCatch returns ok on success', async () => {
    const result = await tryCatch(() => Promise.resolve('success'));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('success');
    }
  });

  it('tryCatch returns err on failure', async () => {
    const result = await tryCatch(() => Promise.reject(new Error('boom')));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
    }
  });

  it('tryCatch maps error with custom mapper', async () => {
    const result = await tryCatch(
      () => Promise.reject(new Error('original')),
      () => 'mapped error',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('mapped error');
    }
  });
});
