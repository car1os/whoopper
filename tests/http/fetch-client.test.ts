import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FetchClient } from '../../src/http/fetch-client.js';
import { NotFoundError, ValidationError } from '../../src/errors/http.js';

describe('FetchClient', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeClient() {
    return new FetchClient({
      baseUrl: 'https://api.example.com/v1',
      getAccessToken: () => Promise.resolve('test-token'),
      retry: { maxAttempts: 1 },
    });
  }

  it('makes GET request with auth header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 1 }),
    });

    const client = makeClient();
    const result = await client.get('/users/me');

    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledOnce();

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.example.com/v1/users/me');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer test-token');
  });

  it('appends query params', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    const client = makeClient();
    await client.get('/items', {
      params: { start: '2024-01-01', limit: 10, empty: undefined },
    });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('start=2024-01-01');
    expect(url).toContain('limit=10');
    expect(url).not.toContain('empty');
  });

  it('sends JSON body on POST', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true }),
    });

    const client = makeClient();
    await client.post('/items', { body: { name: 'test' } });

    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"name":"test"}');
  });

  it('handles 204 No Content', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
    });

    const client = makeClient();
    const result = await client.delete('/items/1');
    expect(result).toBeUndefined();
  });

  it('throws NotFoundError on 404', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers(),
      json: () => Promise.resolve({ message: 'not found' }),
    });

    const client = makeClient();
    await expect(client.get('/missing')).rejects.toThrow(NotFoundError);
  });

  it('throws ValidationError on 400', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers(),
      json: () => Promise.resolve({ message: 'invalid params' }),
    });

    const client = makeClient();
    await expect(client.get('/bad')).rejects.toThrow(ValidationError);
  });
});
