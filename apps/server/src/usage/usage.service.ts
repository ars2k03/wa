import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DAILY_LIMIT, MONTHLY_LIMIT, USAGE_HISTORY_DAYS, USAGE_TIMEZONE } from './usage.constants.js';
import { formatMonthReset, getUsagePeriods, lastDays, type UsagePeriods } from './usage.periods.js';

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Takes one slot from today's and this month's quota before an OTP is sent.
   * Each counter only goes up while it is below its limit, in a single statement, so concurrent
   * requests can never push a user past the limit. If either limit is full, nothing is counted
   * and a 429 is thrown. Returns the periods to pass to `release` if the send then fails.
   */
  async reserve(userId: string, now: Date = new Date()): Promise<UsagePeriods> {
    const periods = getUsagePeriods(now);

    await this.prisma.$transaction(async (tx) => {
      const daily = await tx.$queryRaw<{ count: number }[]>`
        INSERT INTO usage_counters (user_id, period, period_start, count, updated_at)
        VALUES (${userId}, 'day', ${periods.day}::date, 1, now())
        ON CONFLICT (user_id, period, period_start)
        DO UPDATE SET count = usage_counters.count + 1, updated_at = now()
        WHERE usage_counters.count < ${DAILY_LIMIT}
        RETURNING count`;
      if (daily.length === 0) {
        throw this.limitReached('daily', `Daily limit of ${DAILY_LIMIT} OTPs reached. Resets at 12:00 AM.`, periods.dayResetsAt);
      }

      const monthly = await tx.$queryRaw<{ count: number }[]>`
        INSERT INTO usage_counters (user_id, period, period_start, count, updated_at)
        VALUES (${userId}, 'month', ${periods.month}::date, 1, now())
        ON CONFLICT (user_id, period, period_start)
        DO UPDATE SET count = usage_counters.count + 1, updated_at = now()
        WHERE usage_counters.count < ${MONTHLY_LIMIT}
        RETURNING count`;
      if (monthly.length === 0) {
        // Throwing rolls back the daily increment above
        throw this.limitReached(
          'monthly',
          `Monthly limit of ${MONTHLY_LIMIT} OTPs reached. Resets on ${formatMonthReset(periods.monthResetsAt)}.`,
          periods.monthResetsAt,
        );
      }
    });

    return periods;
  }

  /**
   * Gives back a slot taken by `reserve` when the send failed, so only successful sends count
   */
  async release(userId: string, periods: UsagePeriods): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE usage_counters
      SET count = GREATEST(count - 1, 0), updated_at = now()
      WHERE user_id = ${userId}
        AND ((period = 'day' AND period_start = ${periods.day}::date)
          OR (period = 'month' AND period_start = ${periods.month}::date))`;
  }

  /**
   * Today's and this month's usage, plus a day-by-day history for the dashboard
   */
  async getUsage(userId: string, now: Date = new Date()) {
    const periods = getUsagePeriods(now);
    const days = lastDays(USAGE_HISTORY_DAYS, now);

    const rows = await this.prisma.usageCounter.findMany({
      where: {
        userId,
        OR: [
          { period: 'month', periodStart: new Date(periods.month) },
          { period: 'day', periodStart: { gte: new Date(days[0]) } },
        ],
      },
      select: { period: true, periodStart: true, count: true },
    });

    const dayCounts = new Map(
      rows.filter((r) => r.period === 'day').map((r) => [r.periodStart.toISOString().slice(0, 10), r.count]),
    );
    const monthRow = rows.find((r) => r.period === 'month');

    return {
      timezone: USAGE_TIMEZONE,
      daily: {
        used: dayCounts.get(periods.day) ?? 0,
        limit: DAILY_LIMIT,
        resetsAt: periods.dayResetsAt.toISOString(),
      },
      monthly: {
        used: monthRow?.count ?? 0,
        limit: MONTHLY_LIMIT,
        resetsAt: periods.monthResetsAt.toISOString(),
      },
      history: days.map((date) => ({ date, count: dayCounts.get(date) ?? 0 })),
    };
  }

  private limitReached(limit: 'daily' | 'monthly', message: string, resetsAt: Date) {
    return new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        message,
        limit,
        resetsAt: resetsAt.toISOString(),
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
