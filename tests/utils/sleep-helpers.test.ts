import { describe, it, expect } from 'vitest';
import {
  totalSleepTime,
  sleepEfficiency,
  totalSleepNeed,
  zoneDurationPercentages,
} from '../../src/utils/sleep-helpers.js';
import type { SleepScore } from '../../src/models/sleep.js';
import type { ZoneDurations } from '../../src/models/workout.js';

const mockSleepScore: SleepScore = {
  stage_summary: {
    total_in_bed_time_milli: 28_800_000, // 8 hours
    total_awake_time_milli: 1_800_000, // 30 min
    total_no_data_time_milli: 0,
    total_light_sleep_time_milli: 10_800_000, // 3 hours
    total_slow_wave_sleep_time_milli: 7_200_000, // 2 hours
    total_rem_sleep_time_milli: 9_000_000, // 2.5 hours
    sleep_cycle_count: 5,
    disturbance_count: 2,
  },
  sleep_needed: {
    baseline_milli: 27_000_000,
    need_from_sleep_debt_milli: 1_800_000,
    need_from_recent_strain_milli: 900_000,
    need_from_recent_nap_milli: -600_000,
  },
  respiratory_rate: 15.5,
  sleep_performance_percentage: 95,
  sleep_consistency_percentage: 88,
  sleep_efficiency_percentage: 93.75,
};

describe('sleep helpers', () => {
  it('calculates total sleep time', () => {
    const total = totalSleepTime(mockSleepScore);
    // 3h + 2h + 2.5h = 7.5h = 27_000_000ms
    expect(total).toBe(27_000_000);
  });

  it('calculates sleep efficiency', () => {
    const efficiency = sleepEfficiency(mockSleepScore);
    // 27_000_000 / 28_800_000 = 0.9375 = 93.75%
    expect(efficiency).toBeCloseTo(93.75);
  });

  it('handles zero in-bed time', () => {
    const zeroScore: SleepScore = {
      ...mockSleepScore,
      stage_summary: {
        ...mockSleepScore.stage_summary,
        total_in_bed_time_milli: 0,
      },
    };
    expect(sleepEfficiency(zeroScore)).toBe(0);
  });

  it('calculates total sleep need', () => {
    const need = totalSleepNeed(mockSleepScore);
    expect(need).toBe(29_100_000);
  });
});

describe('zoneDurationPercentages', () => {
  it('calculates zone percentages', () => {
    const zones: ZoneDurations = {
      zone_zero_milli: 1000,
      zone_one_milli: 2000,
      zone_two_milli: 3000,
      zone_three_milli: 2000,
      zone_four_milli: 1500,
      zone_five_milli: 500,
    };

    const pct = zoneDurationPercentages(zones);
    expect(pct.zone_zero).toBe(10);
    expect(pct.zone_one).toBe(20);
    expect(pct.zone_two).toBe(30);
    expect(pct.zone_three).toBe(20);
    expect(pct.zone_four).toBe(15);
    expect(pct.zone_five).toBe(5);
  });

  it('handles all-zero zones', () => {
    const zones: ZoneDurations = {
      zone_zero_milli: 0,
      zone_one_milli: 0,
      zone_two_milli: 0,
      zone_three_milli: 0,
      zone_four_milli: 0,
      zone_five_milli: 0,
    };

    const pct = zoneDurationPercentages(zones);
    expect(Object.values(pct).every((v) => v === 0)).toBe(true);
  });
});
