import { describe, it, expect } from 'vitest';
import { Paginator } from '../../src/pagination/paginator.js';

describe('Paginator', () => {
  const makePages = () => {
    const pages = [
      { records: [1, 2, 3], next_token: 'page2' },
      { records: [4, 5, 6], next_token: 'page3' },
      { records: [7, 8], next_token: null },
    ];
    let callIndex = 0;
    return new Paginator<number>(() => {
      const page = pages[callIndex]!;
      callIndex++;
      return Promise.resolve(page);
    });
  };

  it('getPage returns a single page', async () => {
    const paginator = makePages();
    const page = await paginator.getPage();

    expect(page.records).toEqual([1, 2, 3]);
    expect(page.next_token).toBe('page2');
  });

  it('getAll collects all records across pages', async () => {
    const paginator = makePages();
    const all = await paginator.getAll();

    expect(all).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('iterate yields all records one by one', async () => {
    const paginator = makePages();
    const results: number[] = [];

    for await (const item of paginator.iterate()) {
      results.push(item);
    }

    expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('iteratePages yields each page', async () => {
    const paginator = makePages();
    const pageSizes: number[] = [];

    for await (const page of paginator.iteratePages()) {
      pageSizes.push(page.records.length);
    }

    expect(pageSizes).toEqual([3, 3, 2]);
  });

  it('handles empty first page', async () => {
    const paginator = new Paginator<number>(() =>
      Promise.resolve({ records: [], next_token: null }),
    );

    const all = await paginator.getAll();
    expect(all).toEqual([]);
  });
});
