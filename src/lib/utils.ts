import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseDurationToSeconds(input: any) {
  if (input === null || input === undefined) return Number.NEGATIVE_INFINITY;
  const str = String(input).toLowerCase().trim();
  if (!str) return Number.NEGATIVE_INFINITY;
  if (str === 'n/a' || str === 'na') return Number.NEGATIVE_INFINITY;
  let total = 0;
  let matched = false;
  const regex = /(\d+)\s*(hour|hours|hr|hrs|minute|minutes|min|mins|second|seconds|sec|secs)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    matched = true;
    if (['hour', 'hours', 'hr', 'hrs'].includes(unit)) total += value * 3600;
    else if (['minute', 'minutes', 'min', 'mins'].includes(unit)) total += value * 60;
    else if (['second', 'seconds', 'sec', 'secs'].includes(unit)) total += value;
  }
  if (!matched) {
    const onlyNumber = str.match(/^(\d+)$/);
    if (onlyNumber) {
      total = parseInt(onlyNumber[1], 10) * 60;
      matched = true;
    }
  }
  return matched ? total : Number.NEGATIVE_INFINITY;
}
