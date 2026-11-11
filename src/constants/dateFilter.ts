import { capitalizeFirstLetter } from '@/utils';
import {
  getThisMonthRange,
  getThisYearRange,
  getTodayRange,
  getYesterdayRange,
  getTomorrowRange,
  getPreviousMonthRange,
  getPreviousYearRange,
  MEDICARE_WEEK_STARTS_ON
} from '@/utils/Date';
import { formatDateChange, getPacificNow } from '@/utils/Date';
import { startOfWeek, endOfWeek } from 'date-fns';

export const DATE_ALL = 'all_time' as const;
export const DATE_TODAY = 'today' as const;
export const DATE_YESTERDAY = 'yesterday' as const;
export const DATE_TOMORROW = 'tomorrow' as const;
export const DATE_THIS_WEEK = 'this_week' as const;
export const DATE_THIS_MONTH = 'this_month' as const;
export const DATE_PAST_WEEK = 'past_week' as const;
export const DATE_PREVIOUS_MONTH = 'previous_month' as const;
export const DATE_THIS_YEAR = 'this_year' as const;
export const DATE_PREVIOUS_YEAR = 'previous_year' as const;
export const DATE_NEXT_WEEK = 'next_week' as const;
export const DATE_CUSTOM = 'custom_range' as const;
export const DATE_DEFAULT = DATE_THIS_WEEK;

export const DATE_FILTER_VALUES = [
  DATE_ALL,
  DATE_YESTERDAY,
  DATE_TODAY,
  DATE_TOMORROW,
  DATE_PAST_WEEK,
  DATE_THIS_WEEK,
  DATE_NEXT_WEEK,
  DATE_PREVIOUS_MONTH,
  DATE_THIS_MONTH,
  DATE_PREVIOUS_YEAR,
  DATE_THIS_YEAR
] as const;

export const DATE_FILTER_LABELS: Record<string, string> = {
  [DATE_ALL]: 'All',
  [DATE_TODAY]: 'Today',
  [DATE_YESTERDAY]: 'Yesterday',
  [DATE_TOMORROW]: 'Tomorrow',
  [DATE_THIS_WEEK]: 'Current Medicare Week',
  [DATE_THIS_MONTH]: 'Current Month',
  [DATE_THIS_YEAR]: 'Current Year',
  [DATE_PAST_WEEK]: 'Previous Medicare Week',
  [DATE_PREVIOUS_MONTH]: 'Previous Month',
  [DATE_PREVIOUS_YEAR]: 'Previous Year',
  [DATE_NEXT_WEEK]: 'Next Medicare Week',
  [DATE_CUSTOM]: 'Custom Range'
};

export const getDateFilterLabel = (value: string): string => {
  if (!value) return '';

  return DATE_FILTER_LABELS[value] || capitalizeFirstLetter(value.replace('_', ' '));
};

export const normalizeStoredDateFilter = (
  stored: string | null,
  fallback: string = DATE_DEFAULT
): string => {
  if (!stored) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(stored);
    if (typeof parsed === 'string' && parsed.trim()) {
      return parsed;
    }
  } catch {
    if (stored.trim()) {
      return stored.trim();
    }
  }

  return fallback;
};

export const persistStoredDateFilter = (storageKey: string, value: string): void => {
  localStorage.setItem(storageKey, value);
};

export const splitDateRange = (
  dateRange: string
): { starting_date: string | null; ending_date: string | null } => {
  const [starting_date, ending_date] = dateRange ? dateRange.split(' - ') : [null, null];
  return {
    starting_date: starting_date || null,
    ending_date: ending_date || null
  };
};

export const getDateFiltersForPreset = (
  preset: string
): { starting_date: string | null; ending_date: string | null } => {
  return splitDateRange(rangeOf(preset));
};

export const normalizeApiDateFilters = (
  dateFilters?: {
    starting_date?: string | null;
    ending_date?: string | null;
  } | null
) => {
  const starting_date = dateFilters?.starting_date?.trim() || null;
  const ending_date = dateFilters?.ending_date?.trim() || null;

  return {
    starting_date,
    ending_date
  };
};

export const rangeOf = (kind: string): string => {
  if (kind === DATE_CUSTOM) {
    return '';
  }

  if (kind === DATE_TODAY) {
    const { startDate, endDate } = getTodayRange();
    return `${startDate} - ${endDate}`;
  }

  if (kind === DATE_YESTERDAY) {
    const { startDate, endDate } = getYesterdayRange();
    return `${startDate} - ${endDate}`;
  }

  if (kind === DATE_TOMORROW) {
    const { startDate, endDate } = getTomorrowRange();
    return `${startDate} - ${endDate}`;
  }

  if (kind === DATE_THIS_MONTH) {
    const { startDate, endDate } = getThisMonthRange();
    return `${startDate} - ${endDate}`;
  }

  if (kind === DATE_PREVIOUS_MONTH) {
    const { startDate, endDate } = getPreviousMonthRange();
    return `${startDate} - ${endDate}`;
  }

  if (kind === DATE_THIS_YEAR) {
    const { startDate, endDate } = getThisYearRange();
    return `${startDate} - ${endDate}`;
  }

  if (kind === DATE_PREVIOUS_YEAR) {
    const { startDate, endDate } = getPreviousYearRange();
    return `${startDate} - ${endDate}`;
  }

  if (kind === DATE_ALL) {
    return '';
  }

  const today = getPacificNow();
  const start = startOfWeek(today, { weekStartsOn: MEDICARE_WEEK_STARTS_ON });

  if (kind === DATE_PAST_WEEK) {
    start.setDate(start.getDate() - 7);
  } else if (kind === DATE_NEXT_WEEK) {
    start.setDate(start.getDate() + 7);
  }

  const end = endOfWeek(start, { weekStartsOn: MEDICARE_WEEK_STARTS_ON });
  return `${formatDateChange(start)} - ${formatDateChange(end)}`;
};
