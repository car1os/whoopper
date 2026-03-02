import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FetchClient } from '../../src/http/fetch-client.js';
import { CollectionResource } from '../../src/resources/base.js';

describe('CollectionResource', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeResource() {
    const client = new FetchClient({
      baseUrl: 'https://api.example.com',
      getAccessToken: () => Promise.resolve('tok'),
      retry: { maxAttempts: 1 },
    });
    return new CollectionResource<{ id: number }>(client, '/v1/items');
  }

  it('list fetches paginated data', async () => {
    const data = { records: [{ id: 1 }], next_token: null };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    });

    const resource = makeResource();
    const result = await resource.list({ start: '2024-01-01' });

    expect(result.records).toHaveLength(1);
    expect(result.records[0].id).toBe(1);
  });

  it('getById fetches single record', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 42 }),
    });

    const resource = makeResource();
    const result = await resource.getById(42);

    expect(result.id).toBe(42);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/v1/items/42');
  });

  it('getAll paginates through all pages', async () => {
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              records: [{ id: 1 }, { id: 2 }],
              next_token: 'page2',
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            records: [{ id: 3 }],
            next_token: null,
          }),
      });
    });

    const resource = makeResource();
    const all = await resource.getAll();

    expect(all).toHaveLength(3);
    expect(all.map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it('iterate yields individual records', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          records: [{ id: 1 }, { id: 2 }],
          next_token: null,
        }),
    });

    const resource = makeResource();
    const results: { id: number }[] = [];
    for await (const item of resource.iterate()) {
      results.push(item);
    }

    expect(results).toHaveLength(2);
  });
});
