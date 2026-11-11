import { describe, expect, it } from 'vitest';
import {
  DATE_ALL,
  DATE_DEFAULT,
  DATE_FILTER_LABELS,
  DATE_FILTER_VALUES,
  DATE_NEXT_WEEK,
  DATE_PAST_WEEK,
  DATE_CUSTOM,
  DATE_PREVIOUS_MONTH,
  DATE_PREVIOUS_YEAR,
  DATE_THIS_MONTH,
  DATE_THIS_WEEK,
  DATE_THIS_YEAR,
  DATE_TODAY,
  DATE_TOMORROW,
  DATE_YESTERDAY,
  getDateFilterLabel,
  normalizeApiDateFilters,
  normalizeStoredDateFilter
} from './dateFilter';

describe('dateFilter constants', () => {
  it('exports the dropdown options in the requested order', () => {
    expect(DATE_FILTER_VALUES).toEqual([
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
    ]);
  });

  it('uses the expected user-facing labels', () => {
    expect(DATE_FILTER_LABELS[DATE_THIS_WEEK]).toBe('Current Medicare Week');
    expect(DATE_FILTER_LABELS[DATE_NEXT_WEEK]).toBe('Next Medicare Week');
    expect(DATE_FILTER_LABELS[DATE_THIS_YEAR]).toBe('Current Year');
    expect(DATE_FILTER_LABELS[DATE_PAST_WEEK]).toBe('Previous Medicare Week');
    expect(DATE_FILTER_LABELS[DATE_TOMORROW]).toBe('Tomorrow');
    expect(DATE_FILTER_LABELS[DATE_PREVIOUS_MONTH]).toBe('Previous Month');
    expect(DATE_FILTER_LABELS[DATE_PREVIOUS_YEAR]).toBe('Previous Year');
    expect(DATE_FILTER_LABELS[DATE_CUSTOM]).toBe('Custom Range');
    expect(getDateFilterLabel(DATE_THIS_YEAR)).toBe('Current Year');
    expect(getDateFilterLabel(DATE_PREVIOUS_YEAR)).toBe('Previous Year');
  });

  it('reads both plain and JSON encoded stored date filters', () => {
    expect(normalizeStoredDateFilter('this_week')).toBe(DATE_THIS_WEEK);
    expect(normalizeStoredDateFilter(JSON.stringify('previous_month'))).toBe(DATE_PREVIOUS_MONTH);
    expect(normalizeStoredDateFilter(null)).toBe(DATE_DEFAULT);
  });

  it('normalizes blank API date filters to nulls', () => {
    expect(
      normalizeApiDateFilters({
        starting_date: '',
        ending_date: '   '
      })
    ).toEqual({
      starting_date: null,
      ending_date: null
    });
  });
});
