/**
 * Time formatting utilities
 */

import { isToday, isTomorrow } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { UK_TZ } from './constants';

/**
 * Strip seconds from time string
 * @param {string} time - Time in format "HH:MM:SS" or "HH:MM"
 * @returns {string} Time in format "HH:MM"
 */
export function stripSeconds(time) {
  const parts = time.split(":");
  return `${parts[0]}:${parts[1]}`;
}

/**
 * Convert 24-hour time format to 12-hour format with AM/PM
 * @param {string} time24 - Time in 24h format (e.g., "11:00", "19:00", "11:00:00")
 * @returns {string} Time in 12h format (e.g., "11:00 AM", "7:00 PM")
 */
export function convertTo12Hour(time24) {
  const timeWithoutSeconds = stripSeconds(time24);
  const [hours, minutes] = timeWithoutSeconds.split(":");
  const h = parseInt(hours);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${minutes} ${period}`;
}

/**
 * Format next opening date in a user-friendly way
 * @param {Date|string|null} nextOpenDate - Next opening date
 * @returns {string|null} Formatted string like "Today at 11:00 AM", "Tomorrow at 11:00 AM", or "Monday 8 Apr"
 */
export function formatNextOpenDate(nextOpenDate) {
  if (!nextOpenDate) return null;
  
  const date = new Date(nextOpenDate);
  
  if (isToday(date)) {
    return `Today at ${formatInTimeZone(date, UK_TZ, 'h:mm a')}`;
  }
  
  if (isTomorrow(date)) {
    return `Tomorrow at ${formatInTimeZone(date, UK_TZ, 'h:mm a')}`;
  }
  
  return formatInTimeZone(date, UK_TZ, 'EEEE d MMM');
}
