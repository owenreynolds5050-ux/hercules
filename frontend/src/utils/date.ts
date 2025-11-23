/**
 * Date utilities
 * Provides helpers to work with device-local date/time values.
 */

/**
 * Returns the current date/time in the user's local timezone.
 * Relies on the device clock, respecting platform-specific timezone settings.
 */
export const getDeviceCurrentDate = (): Date => {
  // `new Date()` leverages the host environment's timezone configuration.
  // Wrapping it here ensures a single abstraction point for future adjustments.
  return new Date();
};

/**
 * Formats a date into an ISO YYYY-MM-DD string without converting to UTC.
 */
export const formatDateToLocalISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parses a YYYY-MM-DD string into a Date object using local timezone semantics.
 */
export const parseLocalISODate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

/**
 * Convenience helper for retrieving today's date formatted as local ISO.
 */
export const getTodayLocalISO = (): string => {
  return formatDateToLocalISO(getDeviceCurrentDate());
};
