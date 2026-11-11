import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subYears
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export const PACIFIC_TIME_ZONE = 'America/Los_Angeles';
export const MEDICARE_WEEK_STARTS_ON = 0;

export const getPacificNow = () => toZonedTime(new Date(), PACIFIC_TIME_ZONE);

const parseIsoDate = (isoDate: string) =>
  isoDate.length === 10 ? new Date(`${isoDate}T12:00:00Z`) : new Date(isoDate);

export const formatIsoDate = (isoDate: string) => {
  return formatInTimeZone(parseIsoDate(isoDate), PACIFIC_TIME_ZONE, 'd MMM, yyyy');
};

/**
 * Returns the default start and end date of the current medicare week.
 * Medicare weeks run Sunday through Saturday.
 */
export const getCurrentWeekRange = () => {
  const today = getPacificNow();
  const weekStart = startOfWeek(today, { weekStartsOn: MEDICARE_WEEK_STARTS_ON });
  const weekEnd = endOfWeek(today, { weekStartsOn: MEDICARE_WEEK_STARTS_ON });

  return {
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd')
  };
};

export const getDayRange = (daysAgo = 0) => {
  const today = getPacificNow();
  const day = new Date(today);
  day.setDate(day.getDate() - daysAgo);

  const value = format(day, 'yyyy-MM-dd');
  return {
    startDate: value,
    endDate: value
  };
};

export const getTodayRange = () => getDayRange(0);
export const getYesterdayRange = () => getDayRange(1);
export const getTomorrowRange = () => getDayRange(-1);

export const getThisMonthRange = () => {
  const today = getPacificNow();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  return {
    startDate: format(monthStart, 'yyyy-MM-dd'),
    endDate: format(monthEnd, 'yyyy-MM-dd')
  };
};

export const getPreviousMonthRange = () => {
  const today = getPacificNow();
  const previousMonth = subMonths(today, 1);
  const monthStart = startOfMonth(previousMonth);
  const monthEnd = endOfMonth(previousMonth);

  return {
    startDate: format(monthStart, 'yyyy-MM-dd'),
    endDate: format(monthEnd, 'yyyy-MM-dd')
  };
};

export const getThisYearRange = () => {
  const today = getPacificNow();
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);

  return {
    startDate: format(yearStart, 'yyyy-MM-dd'),
    endDate: format(yearEnd, 'yyyy-MM-dd')
  };
};

export const getPreviousYearRange = () => {
  const today = getPacificNow();
  const previousYear = subYears(today, 1);
  const yearStart = startOfYear(previousYear);
  const yearEnd = endOfYear(previousYear);

  return {
    startDate: format(yearStart, 'yyyy-MM-dd'),
    endDate: format(yearEnd, 'yyyy-MM-dd')
  };
};

/**
 * Formats a date string into 'MMM d' format (e.g., 'Jan 1') in the 'America/Los_Angeles' timezone.
 * @param date - The date string in 'yyyy-MM-dd' format.
 * @returns The formatted date string.
 */
export const formatDateInPST = (date: string): string => {
  return formatInTimeZone(new Date(`${date}T12:00:00Z`), PACIFIC_TIME_ZONE, 'MMM d');
};

/**
 * Formats a date range string (e.g., '2024-02-01 - 2024-02-07') into a readable format.
 * @param range - A string in the format 'yyyy-MM-dd - yyyy-MM-dd'.
 * @returns The formatted date range string (e.g., 'Feb 1 - Feb 7, 2024').
 */
export const formatDateRange = (range: string): string => {
  if (!range) return '';

  const [start, end] = range.split(' - ');
  const startDate = new Date(`${start}T12:00:00Z`);
  const endDate = new Date(`${end}T12:00:00Z`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return '';
  }
  const startYear = formatInTimeZone(startDate, PACIFIC_TIME_ZONE, 'yyyy');
  const endYear = formatInTimeZone(endDate, PACIFIC_TIME_ZONE, 'yyyy');

  if (startYear === endYear) {
    return `${formatDateInPST(start)} - ${formatDateInPST(end)}, ${endYear}`;
  }

  return `${formatDateInPST(start)}, ${startYear} - ${formatDateInPST(end)}, ${endYear}`;
};

/**
 * Adds 12 hours to the given date.
 *
 * @param {Date} date - The date to which 12 hours will be added.
 * @returns {Date} - A new Date object with 12 hours added.
 */
export const add12Hours = (date: Date): Date => {
  const newDate = new Date(date);
  const currentHour = newDate.getHours();

  if (currentHour <= 12) {
    newDate.setHours(currentHour + 12);
  }

  return newDate;
};

/**
 * Formats a given date into `YYYY-MM-DD` format.
 *
 * @param {Date | null} date - The date to format.
 * @returns {string} - The formatted date as a string or an empty string if no date is provided.
 */
export const formatDateChange = (date: Date | null): string => {
  if (!date) return '';

  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);

  return `${year}-${month}-${day}`;
};

/**
 * Normalizes a simple date input to `yyyy-MM-dd`.
 * Supports either `mm/dd/yy` style inputs or already normalized dates.
 * If parsing fails, the trimmed input is returned unchanged.
 */
export const normalizeDateInput = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const parts = trimmed.split(/[^\d]+/).filter(Boolean);
  if (parts.length !== 3) {
    return trimmed;
  }

  const [first, second, third] = parts;

  let yearPart = third;
  let monthPart = first;
  let dayPart = second;

  if (first.length === 4) {
    yearPart = first;
    monthPart = second;
    dayPart = third;
  } else if (third.length === 4) {
    yearPart = third;
  } else if (third.length === 2) {
    const yearNumber = Number(third);
    yearPart = yearNumber >= 70 ? `19${third}` : `20${third}`;
  }

  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  if (!year || !month || !day) {
    return trimmed;
  }

  return `${yearPart}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const isChronologicalDateRange = (startDate: string, endDate: string): boolean => {
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);

  if (!start || !end) {
    return false;
  }

  return start.getTime() <= end.getTime();
};

/**
 * Parses a date string in the format 'yyyy-mm-dd' and returns a JavaScript Date object.
 *
 * @param {string} [dateString] - The date string to be parsed (optional).
 * @returns {Date | null} - A Date object representing the parsed date, or null if the date string is invalid or not provided.
 */
const parseDateString = (dateString?: string): Date | undefined => {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split('-');

  if (!year || !month || !day) return undefined;

  const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  if (isNaN(parsedDate.getTime())) return undefined;

  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() + 1 !== Number(month) ||
    parsedDate.getDate() !== Number(day)
  ) {
    return undefined;
  }

  return parsedDate;
};

export { parseDateString };
