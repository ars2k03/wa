import { USAGE_UTC_OFFSET_MS } from './usage.constants.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');

/** The day and month a moment falls in, in Bangladesh time, plus when each resets */
export interface UsagePeriods {
  /** e.g. "2026-10-15" */
  day: string;
  /** e.g. "2026-10-01" */
  month: string;
  /** Next midnight in Bangladesh time */
  dayResetsAt: Date;
  /** Midnight on the 1st of next month in Bangladesh time */
  monthResetsAt: Date;
}

export function getUsagePeriods(now: Date = new Date()): UsagePeriods {
  // Shift to Bangladesh wall-clock time and read it with the UTC getters
  const local = new Date(now.getTime() + USAGE_UTC_OFFSET_MS);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const d = local.getUTCDate();

  return {
    day: `${y}-${pad(m + 1)}-${pad(d)}`,
    month: `${y}-${pad(m + 1)}-01`,
    dayResetsAt: new Date(Date.UTC(y, m, d + 1) - USAGE_UTC_OFFSET_MS),
    monthResetsAt: new Date(Date.UTC(y, m + 1, 1) - USAGE_UTC_OFFSET_MS),
  };
}

/** The last `count` days ending today, oldest first, as "YYYY-MM-DD" in Bangladesh time */
export function lastDays(count: number, now: Date = new Date()): string[] {
  const { day } = getUsagePeriods(now);
  const [y, m, d] = day.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1, d - (count - 1 - i)));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  });
}

/** "Nov 1" for the month reset message */
export function formatMonthReset(resetsAt: Date): string {
  const local = new Date(resetsAt.getTime() + USAGE_UTC_OFFSET_MS);
  return `${MONTHS[local.getUTCMonth()]} ${local.getUTCDate()}`;
}
