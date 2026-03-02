export enum ScoreState {
  SCORED = 'SCORED',
  PENDING_SCORE = 'PENDING_SCORE',
  UNSCORABLE = 'UNSCORABLE',
}

export interface PaginatedResponse<T> {
  records: T[];
  next_token: string | null;
}

export interface DateRange {
  start?: string;
  end?: string;
  nextToken?: string;
  limit?: number;
}
