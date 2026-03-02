import type { PaginatedResponse } from '../models/common.js';

export type PageFetcher<T> = (nextToken?: string) => Promise<PaginatedResponse<T>>;

export class Paginator<T> {
  constructor(private readonly fetcher: PageFetcher<T>) {}

  async getPage(nextToken?: string): Promise<PaginatedResponse<T>> {
    return this.fetcher(nextToken);
  }

  async getAll(): Promise<T[]> {
    const results: T[] = [];
    let nextToken: string | undefined;
    do {
      const page = await this.fetcher(nextToken);
      results.push(...page.records);
      nextToken = page.next_token ?? undefined;
    } while (nextToken);
    return results;
  }

  async *iterate(): AsyncGenerator<T, void, unknown> {
    let nextToken: string | undefined;
    do {
      const page = await this.fetcher(nextToken);
      for (const record of page.records) {
        yield record;
      }
      nextToken = page.next_token ?? undefined;
    } while (nextToken);
  }

  async *iteratePages(): AsyncGenerator<PaginatedResponse<T>, void, unknown> {
    let nextToken: string | undefined;
    do {
      const page = await this.fetcher(nextToken);
      yield page;
      nextToken = page.next_token ?? undefined;
    } while (nextToken);
  }
}
