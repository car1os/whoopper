export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

export function toISODateTime(date: Date): string {
  return date.toISOString();
}

export function parseWhoopDate(dateStr: string): Date {
  return new Date(dateStr);
}

export function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODateTime(date);
}

export function formatTimezoneOffset(offset: string): string {
  // WHOOP returns offsets like "-05:00" or "+02:00"
  return offset.startsWith('+') || offset.startsWith('-') ? `UTC${offset}` : offset;
}
