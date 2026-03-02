import { describe, it, expect } from 'vitest';
import { kJToCalories, msToHours, msToMinutes } from '../../src/utils/conversions.js';

describe('conversions', () => {
  it('converts kilojoules to calories', () => {
    expect(kJToCalories(1000)).toBeCloseTo(239, 0);
    expect(kJToCalories(0)).toBe(0);
  });

  it('converts milliseconds to hours', () => {
    expect(msToHours(3_600_000)).toBe(1);
    expect(msToHours(7_200_000)).toBe(2);
    expect(msToHours(5_400_000)).toBe(1.5);
  });

  it('converts milliseconds to minutes', () => {
    expect(msToMinutes(60_000)).toBe(1);
    expect(msToMinutes(90_000)).toBe(1.5);
    expect(msToMinutes(0)).toBe(0);
  });
});
