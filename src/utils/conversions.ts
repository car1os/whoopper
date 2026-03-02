export function kJToCalories(kj: number): number {
  return Math.round(kj * 0.239006 * 10) / 10;
}

export function msToHours(ms: number): number {
  return Math.round((ms / 3_600_000) * 100) / 100;
}

export function msToMinutes(ms: number): number {
  return Math.round((ms / 60_000) * 100) / 100;
}
