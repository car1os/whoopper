export type TrendKey =
  | 'recovery_score'
  | 'resting_heart_rate'
  | 'hrv_rmssd_milli'
  | 'sleep_performance_percentage'
  | 'total_sleep_time_milli'
  | 'sleep_efficiency_percentage'
  | 'strain'
  | 'kilojoule'
  | 'average_heart_rate';

export interface TrendDataPoint {
  date: string;
  value: number | null;
}

export interface TrendData {
  key: TrendKey;
  data: TrendDataPoint[];
}
