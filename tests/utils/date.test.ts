import { describe, it, expect } from 'vitest';
import {
  toISODate,
  toISODateTime,
  parseWhoopDate,
  daysAgo,
  formatTimezoneOffset,
} from '../../src/utils/date.js';

describe('date utils', () => {
  it('formats Date to ISO date string', () => {
    const date = new Date('2024-03-15T10:30:00Z');
    expect(toISODate(date)).toBe('2024-03-15');
  });

  it('formats Date to ISO datetime string', () => {
    const date = new Date('2024-03-15T10:30:00.000Z');
    expect(toISODateTime(date)).toBe('2024-03-15T10:30:00.000Z');
  });

  it('parses WHOOP date string to Date', () => {
    const date = parseWhoopDate('2024-03-15T10:30:00.000Z');
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2024);
  });

  it('generates ISO datetime for N days ago', () => {
    const result = daysAgo(7);
    const date = new Date(result);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(7, 0);
  });

  it('formats timezone offset', () => {
    expect(formatTimezoneOffset('-05:00')).toBe('UTC-05:00');
    expect(formatTimezoneOffset('+02:00')).toBe('UTC+02:00');
    expect(formatTimezoneOffset('UTC')).toBe('UTC');
  });
});
