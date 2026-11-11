import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  isChronologicalDateRange,
  formatDateRange,
  getCurrentWeekRange,
  getTomorrowRange,
  normalizeDateInput
} from '@/utils/Date';

describe('normalizeDateInput', () => {
  it('accepts single-digit month and day with a 2-digit year', () => {
    expect(normalizeDateInput('4/1/26')).toBe('2026-04-01');
  });

  it('accepts mixed delimiter input with single-digit month and day', () => {
    expect(normalizeDateInput('4-1-2026')).toBe('2026-04-01');
  });

  it('preserves already normalized dates', () => {
    expect(normalizeDateInput('2026-04-01')).toBe('2026-04-01');
  });
});

describe('formatDateRange', () => {
  it('shows both years when the range crosses a year boundary', () => {
    expect(formatDateRange('2025-03-01 - 2026-01-01')).toBe('Mar 1, 2025 - Jan 1, 2026');
  });

  it('keeps the compact format when the range stays within one year', () => {
    expect(formatDateRange('2026-03-01 - 2026-04-01')).toBe('Mar 1 - Apr 1, 2026');
  });

  it('returns an empty label for invalid ranges', () => {
    expect(formatDateRange('abc - def')).toBe('');
  });
});

describe('getCurrentWeekRange', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses a Sunday through Saturday week', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-29T12:00:00Z'));

    expect(getCurrentWeekRange()).toEqual({
      startDate: '2026-04-26',
      endDate: '2026-05-02'
    });
  });
});

describe('getTomorrowRange', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the next calendar day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-26T12:00:00Z'));

    expect(getTomorrowRange()).toEqual({
      startDate: '2026-04-27',
      endDate: '2026-04-27'
    });
  });
});

describe('isChronologicalDateRange', () => {
  it('accepts ranges where the start is before or equal to the end', () => {
    expect(isChronologicalDateRange('2025-02-01', '2025-02-01')).toBe(true);
    expect(isChronologicalDateRange('2025-01-01', '2025-02-01')).toBe(true);
  });

  it('rejects ranges where the start is after the end', () => {
    expect(isChronologicalDateRange('2025-02-01', '2025-01-01')).toBe(false);
  });
});
