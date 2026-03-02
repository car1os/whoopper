import type { ScoreState } from './common.js';

export interface CycleScore {
  strain: number;
  kilojoule: number;
  average_heart_rate: number;
  max_heart_rate: number;
}

export interface Cycle {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string | null;
  timezone_offset: string;
  score_state: ScoreState;
  score: CycleScore | null;
}
