import { describe, it, expect } from 'vitest';
import { RequestThrottler } from '../../src/http/throttle.js';

describe('RequestThrottler', () => {
  it('executes functions and returns results', async () => {
    const throttler = new RequestThrottler();
    const result = await throttler.execute(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it('limits concurrency', async () => {
    const throttler = new RequestThrottler({ maxConcurrent: 2 });
    let concurrent = 0;
    let maxConcurrent = 0;

    const task = () =>
      throttler.execute(async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise((r) => setTimeout(r, 50));
        concurrent--;
        return 'done';
      });

    await Promise.all([task(), task(), task(), task()]);

    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });

  it('propagates errors', async () => {
    const throttler = new RequestThrottler();
    await expect(
      throttler.execute(() => Promise.reject(new Error('fail'))),
    ).rejects.toThrow('fail');
  });
});
