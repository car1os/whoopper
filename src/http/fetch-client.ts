import { mapHttpError } from './errors.js';
import { withRetry, type RetryOptions } from './retry.js';
import { RequestThrottler, type ThrottleOptions } from './throttle.js';

export interface FetchClientOptions {
  baseUrl: string;
  getAccessToken: () => Promise<string>;
  retry?: Partial<RetryOptions>;
  throttle?: Partial<ThrottleOptions>;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

export class FetchClient {
  private readonly baseUrl: string;
  private readonly getAccessToken: () => Promise<string>;
  private readonly retryOptions: Partial<RetryOptions>;
  private readonly throttler: RequestThrottler;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: FetchClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getAccessToken = options.getAccessToken;
    this.retryOptions = options.retry ?? {};
    this.throttler = new RequestThrottler(options.throttle);
    this.defaultHeaders = options.headers ?? {};
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  async post<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, options);
  }

  async put<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  private async request<T>(
    method: string,
    path: string,
    options?: RequestOptions,
  ): Promise<T> {
    return withRetry(
      () => this.throttler.execute(() => this.doRequest<T>(method, path, options)),
      this.retryOptions,
    );
  }

  private async doRequest<T>(
    method: string,
    path: string,
    options?: RequestOptions,
  ): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    };

    if (options?.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options?.signal,
    });

    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = await response.text().catch(() => null);
      }
      throw mapHttpError(response.status, body, response.headers);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }
}
