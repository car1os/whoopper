export interface ThrottleOptions {
  maxConcurrent: number;
  minDelayMs: number;
}

const DEFAULT_THROTTLE: ThrottleOptions = {
  maxConcurrent: 10,
  minDelayMs: 0,
};

export class RequestThrottler {
  private active = 0;
  private queue: Array<() => void> = [];
  private lastRequestTime = 0;
  private readonly options: ThrottleOptions;

  constructor(options: Partial<ThrottleOptions> = {}) {
    this.options = { ...DEFAULT_THROTTLE, ...options };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.active < this.options.maxConcurrent) {
      this.active++;
      return this.waitForMinDelay();
    }

    return new Promise(resolve => {
      this.queue.push(() => {
        this.active++;
        this.waitForMinDelay().then(resolve);
      });
    });
  }

  private async waitForMinDelay(): Promise<void> {
    if (this.options.minDelayMs <= 0) return;

    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.options.minDelayMs) {
      await new Promise(resolve =>
        setTimeout(resolve, this.options.minDelayMs - elapsed),
      );
    }
    this.lastRequestTime = Date.now();
  }

  private release(): void {
    this.active--;
    const next = this.queue.shift();
    if (next) next();
  }
}
