export interface HomeData {
  cycle_id: number;
  strain: number | null;
  recovery_score: number | null;
  sleep_performance_percentage: number | null;
}

export interface VoiceOfWhoop {
  cycle_id: number;
  message: string;
  generated_at: string;
}

export interface JournalImpact {
  factor: string;
  impact_score: number;
  occurrences: number;
  metric: string;
}

export interface SleepCoaching {
  target_sleep_100: number;
  target_sleep_85: number;
  target_sleep_70: number;
  recommended_bedtime: string;
  recommended_waketime: string;
}

export interface SleepEvent {
  during_sleep_id: number;
  type: string;
  timestamp: string;
}

export interface PerformanceReport {
  id: string;
  title: string;
  period_start: string;
  period_end: string;
  download_url: string;
}

export interface CyclesAggregate {
  cycle_id: number;
  strain: number | null;
  recovery_score: number | null;
  sleep: {
    performance_percentage: number | null;
    total_sleep_time_milli: number | null;
  } | null;
  heart_rate: {
    average: number | null;
    max: number | null;
  } | null;
}

export interface RollupStats {
  metric: string;
  value: number;
  period: string;
}

export interface HealthspanData {
  whoop_age: number | null;
  biological_age: number | null;
  chronological_age: number | null;
}

export interface CommunityLeaderboard {
  type: string;
  entries: CommunityEntry[];
}

export interface CommunityEntry {
  user_id: number;
  display_name: string;
  rank: number;
  value: number;
}

export interface DashboardDeepDive {
  metric: string;
  period: string;
  data_points: { date: string; value: number | null }[];
}
