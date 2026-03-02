import type { FetchClient } from '../http/fetch-client.js';
import type { PaginatedResponse, DateRange } from '../models/common.js';
import { Paginator } from '../pagination/paginator.js';

export class BaseResource {
  constructor(protected readonly client: FetchClient) {}
}

export class CollectionResource<T> extends BaseResource {
  constructor(
    client: FetchClient,
    protected readonly basePath: string,
  ) {
    super(client);
  }

  async list(params?: DateRange): Promise<PaginatedResponse<T>> {
    return this.client.get<PaginatedResponse<T>>(this.basePath, {
      params: {
        start: params?.start,
        end: params?.end,
        nextToken: params?.nextToken,
        limit: params?.limit,
      },
    });
  }

  async getById(id: number): Promise<T> {
    return this.client.get<T>(`${this.basePath}/${id}`);
  }

  paginator(params?: Omit<DateRange, 'nextToken'>): Paginator<T> {
    return new Paginator<T>((nextToken) =>
      this.list({ ...params, nextToken }),
    );
  }

  async getAll(params?: Omit<DateRange, 'nextToken'>): Promise<T[]> {
    return this.paginator(params).getAll();
  }

  async *iterate(
    params?: Omit<DateRange, 'nextToken'>,
  ): AsyncGenerator<T, void, unknown> {
    yield* this.paginator(params).iterate();
  }
}
