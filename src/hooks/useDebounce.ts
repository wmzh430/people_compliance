import { useEffect, useState, useRef } from 'react';
// @ts-ignore
import { debounce } from 'lodash';

/**
 * useDebounce - A generic debounce hook for any value or function.
 *
 * @param value - The value to debounce (string, number, object, etc.)
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @param options - Additional options:
 *   - `immediate`: If `true`, executes immediately on first call.
 * @returns The debounced value.
 */
export function useDebounce<T>(
  value: T,
  delay: number = 300,
  options?: { immediate?: boolean }
): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const firstRender = useRef(true);

  useEffect(() => {
    if (options?.immediate && firstRender.current) {
      setDebouncedValue(value);
      firstRender.current = false;
      return;
    }

    const handler = debounce(() => {
      setDebouncedValue(value);
    }, delay);

    handler();

    return () => {
      handler.cancel();
    };
  }, [value, delay, options?.immediate]);

  return debouncedValue;
}
