// Per-user OTP limits. They count successful sends across all of a user's API keys.
export const DAILY_LIMIT = 100;
export const MONTHLY_LIMIT = 3000;

// Days and months are counted in Bangladesh time (UTC+6, no daylight saving).
export const USAGE_TIMEZONE = 'Asia/Dhaka';
export const USAGE_UTC_OFFSET_MS = 6 * 60 * 60 * 1000;

// How many days of history the dashboard chart shows
export const USAGE_HISTORY_DAYS = 30;
