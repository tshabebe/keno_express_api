import { addSeconds as dfAddSeconds, addDays as dfAddDays, isAfter } from 'date-fns';

export function now(): Date {
  return new Date();
}

export function addSeconds(date: Date, seconds: number): Date {
  return dfAddSeconds(date, seconds);
}

export function addDays(date: Date, days: number): Date {
  return dfAddDays(date, days);
}

export function isSameOrAfter(a: Date, b: Date): boolean {
  return isAfter(a, b) || a.getTime() === b.getTime();
}