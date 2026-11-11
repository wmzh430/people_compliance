import { describe, expect, it } from 'vitest';
import {
  capitalizeFirstLetter,
  extractValueSections,
  formatExtractDate,
  getStatusColor
} from './Common';

describe('Common utils', () => {
  it('capitalizes the first letter', () => {
    expect(capitalizeFirstLetter('archer')).toBe('Archer');
  });

  it('maps status colors with fallback', () => {
    expect(getStatusColor('Ready to Schedule')).toBe('primary');
    expect(getStatusColor('Unknown')).toBe('dark');
  });

  it('formats extract date strings', () => {
    expect(formatExtractDate('2024-01-05')).toBe('Jan 5, 2024');
  });

  it('throws on invalid extract date format', () => {
    expect(() => formatExtractDate('2024-13')).toThrow('Invalid date format. Expected YYYY-MM-DD');
  });

  it('extracts labeled value sections', () => {
    expect(extractValueSections('A: 1 | B: 2')).toEqual([
      { label: 'A', value: '1' },
      { label: 'B', value: '2' }
    ]);
  });
});
