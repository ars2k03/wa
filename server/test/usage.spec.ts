import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpException } from '@nestjs/common';
import { UsageService } from '../src/usage/usage.service.js';
import { formatMonthReset, getUsagePeriods, lastDays } from '../src/usage/usage.periods.js';

describe('usage periods (Bangladesh time, UTC+6)', () => {
  it('uses the Bangladesh date, not the UTC date', () => {
    // 2026-10-15 19:30 UTC is 2026-10-16 01:30 in Dhaka
    const p = getUsagePeriods(new Date('2026-10-15T19:30:00Z'));
    expect(p.day).toBe('2026-10-16');
    expect(p.month).toBe('2026-10-01');
  });

  it('resets the day at Dhaka midnight', () => {
    const p = getUsagePeriods(new Date('2026-10-15T10:00:00Z')); // 16:00 in Dhaka
    expect(p.dayResetsAt.toISOString()).toBe('2026-10-15T18:00:00.000Z'); // 00:00 Oct 16 Dhaka
  });

  it('resets the month on the 1st at Dhaka midnight, across years', () => {
    const p = getUsagePeriods(new Date('2026-12-31T17:00:00Z')); // 23:00 Dec 31 Dhaka
    expect(p.month).toBe('2026-12-01');
    expect(p.monthResetsAt.toISOString()).toBe('2026-12-31T18:00:00.000Z'); // 00:00 Jan 1 Dhaka
    expect(formatMonthReset(p.monthResetsAt)).toBe('Jan 1');
  });

  it('lists the last days oldest first, across a month boundary', () => {
    expect(lastDays(3, new Date('2026-11-01T06:00:00Z'))).toEqual(['2026-10-30', '2026-10-31', '2026-11-01']);
  });
});

describe('UsageService.reserve', () => {
  let service: UsageService;
  let tx: { $queryRaw: ReturnType<typeof vi.fn> };
  let prismaMock: any;

  beforeEach(() => {
    tx = { $queryRaw: vi.fn() };
    prismaMock = {
      $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
      $executeRaw: vi.fn(),
    };
    service = new UsageService(prismaMock);
  });

  const now = new Date('2026-10-15T10:00:00Z');

  it('counts the send when both limits have room', async () => {
    tx.$queryRaw.mockResolvedValueOnce([{ count: 5 }]).mockResolvedValueOnce([{ count: 40 }]);
    const periods = await service.reserve('user-1', now);
    expect(periods.day).toBe('2026-10-15');
    expect(tx.$queryRaw).toHaveBeenCalledTimes(2);
  });

  it('throws a daily 429 without touching the monthly counter', async () => {
    tx.$queryRaw.mockResolvedValueOnce([]);
    const err = await service.reserve('user-1', now).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(429);
    expect((err as HttpException).getResponse()).toMatchObject({
      message: 'Daily limit of 100 OTPs reached. Resets at 12:00 AM.',
      limit: 'daily',
    });
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('throws a monthly 429 with the reset date', async () => {
    tx.$queryRaw.mockResolvedValueOnce([{ count: 3 }]).mockResolvedValueOnce([]);
    const err = (await service.reserve('user-1', now).catch((e: unknown) => e)) as HttpException;
    expect(err.getStatus()).toBe(429);
    expect(err.getResponse()).toMatchObject({
      message: 'Monthly limit of 3000 OTPs reached. Resets on Nov 1.',
      limit: 'monthly',
    });
  });
});
