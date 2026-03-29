import { DAYS_OF_WEEK, CLOSING_SOON_THRESHOLD } from "./constants";
import { toZonedTime } from 'date-fns-tz';
import { format, getHours, getMinutes } from 'date-fns';

const UK_TZ = 'Europe/London';

/**
 * Check if restaurant is currently open based on opening hours
 * All times are calculated in UK timezone (Europe/London) to ensure consistency
 * regardless of server or user location.
 * @param {Object} openingHours - Opening hours object with day keys
 * @returns {Object} { isOpen: boolean, closingSoon: boolean, todayHours: Object }
 */
export function checkRestaurantStatus(openingHours) {
  /**
   * Get current day of week in UK timezone
   */
  const getCurrentDay = () => {
    const nowUTC = new Date();
    const nowUK = toZonedTime(nowUTC, UK_TZ);
    return format(nowUK, 'EEEE'); // Returns "Monday", "Tuesday", etc.
  };
  
  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };
  
  /**
   * Get current time in UK timezone as minutes since midnight
   */
  const getCurrentTimeInMinutes = () => {
    const nowUTC = new Date();
    const nowUK = toZonedTime(nowUTC, UK_TZ);
    return getHours(nowUK) * 60 + getMinutes(nowUK);
  };

  const todayHours = openingHours[getCurrentDay()];
  const currentTime = getCurrentTimeInMinutes();
  const openTime = timeToMinutes(todayHours.open);
  const closeTime = timeToMinutes(todayHours.close);
  
  const isOpen = currentTime >= openTime && currentTime < closeTime;
  const closingSoon = isOpen && (closeTime - currentTime) > 0 && (closeTime - currentTime) <= CLOSING_SOON_THRESHOLD;

  return {
    isOpen,
    closingSoon,
    todayHours
  };
}
