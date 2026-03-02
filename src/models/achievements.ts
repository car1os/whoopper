export interface AchievementLevel {
  id: number;
  name: string;
  description: string;
  achieved_at: string | null;
}

export interface Streak {
  type: string;
  current_count: number;
  max_count: number;
  last_updated: string;
}
