import type { SleepScore } from '../models/sleep.js';
import type { ZoneDurations } from '../models/workout.js';

export function totalSleepTime(score: SleepScore): number {
  const s = score.stage_summary;
  return (
    s.total_light_sleep_time_milli +
    s.total_slow_wave_sleep_time_milli +
    s.total_rem_sleep_time_milli
  );
}

export function sleepEfficiency(score: SleepScore): number {
  const s = score.stage_summary;
  const totalInBed = s.total_in_bed_time_milli;
  if (totalInBed === 0) return 0;
  const actualSleep = totalSleepTime(score);
  return Math.round((actualSleep / totalInBed) * 10000) / 100;
}

export function totalSleepNeed(score: SleepScore): number {
  const n = score.sleep_needed;
  return (
    n.baseline_milli +
    n.need_from_sleep_debt_milli +
    n.need_from_recent_strain_milli +
    n.need_from_recent_nap_milli
  );
}

export function zoneDurationPercentages(zones: ZoneDurations): Record<string, number> {
  const total =
    zones.zone_zero_milli +
    zones.zone_one_milli +
    zones.zone_two_milli +
    zones.zone_three_milli +
    zones.zone_four_milli +
    zones.zone_five_milli;

  if (total === 0) {
    return {
      zone_zero: 0,
      zone_one: 0,
      zone_two: 0,
      zone_three: 0,
      zone_four: 0,
      zone_five: 0,
    };
  }

  const pct = (ms: number) => Math.round((ms / total) * 10000) / 100;
  return {
    zone_zero: pct(zones.zone_zero_milli),
    zone_one: pct(zones.zone_one_milli),
    zone_two: pct(zones.zone_two_milli),
    zone_three: pct(zones.zone_three_milli),
    zone_four: pct(zones.zone_four_milli),
    zone_five: pct(zones.zone_five_milli),
  };
}
