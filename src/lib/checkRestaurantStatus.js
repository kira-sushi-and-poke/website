import { DAYS_OF_WEEK, CLOSING_SOON_THRESHOLD, UK_TZ } from "./constants";
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format, getHours, getMinutes, addDays, startOfDay, isBefore, setHours, setMinutes } from 'date-fns';

/**
 * Check if restaurant is currently open based on opening hours and optional mobile override
 * All times are calculated in UK timezone (Europe/London) to ensure consistency
 * regardless of server or user location.
 * @param {Object} openingHours - Opening hours object with day keys (Physical location)
 * @param {Object|null} mobileLocationData - Optional mobile location data for overrides { status, business_hours }
 * @param {boolean} isFallback - If true, forces closed status (API failure, show hours but disable ordering)
 * @returns {Object} { isOpen: boolean, closingSoon: boolean, todayHours: Object, nextOpenDate: Date|null, overrideActive: boolean, overridePeriods: Array }
 */
export function checkRestaurantStatus(openingHours, mobileLocationData = null, isFallback = false) {
  /**
   * Get current day of week in UK timezone
   */
  const getCurrentDay = () => {
    const nowUTC = new Date();
    const nowUK = toZonedTime(nowUTC, UK_TZ);
    return format(nowUK, 'EEEE'); // Returns "Monday", "Tuesday", etc.
  };
  
  /**
   * Handle API failure case - if fallback mode, show hours but force closed for ordering
   */
  if (isFallback) {
    console.warn("API fallback mode - displaying hours but disabling ordering");
    const todayHours = openingHours?.[getCurrentDay()] || null;
    return {
      isOpen: false, // Force closed to disable ordering
      closingSoon: false,
      todayHours, // Still show hours for display
      nextOpenDate: null,
      overrideActive: false,
      overridePeriods: [],
      isTodayOnly: false,
      mobileLocationName: null
    };
  }

  /**
   * Handle edge case - if no opening hours available at all
   */
  if (!openingHours || Object.keys(openingHours).length === 0) {
    console.warn("No opening hours available - treating as CLOSED");
    return {
      isOpen: false,
      closingSoon: false,
      todayHours: null,
      nextOpenDate: null,
      overrideActive: false,
      overridePeriods: [],
      isTodayOnly: false,
      mobileLocationName: null
    };
  }
  
  /**
   * Get current date in UK timezone
   */
  const getCurrentDateUK = () => {
    const nowUTC = new Date();
    return toZonedTime(nowUTC, UK_TZ);
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

  /**
   * Map Square day_of_week to full day name
   */
  const dayOfWeekMap = {
    'SUN': 'Sunday',
    'MON': 'Monday', 
    'TUE': 'Tuesday',
    'WED': 'Wednesday',
    'THU': 'Thursday',
    'FRI': 'Friday',
    'SAT': 'Saturday'
  };

  /**
   * Find next occurrence of a day_of_week from today onwards (including today)
   * @param {string} dayOfWeek - Square format (MON, TUE, etc.)
   * @returns {Date|null} - Next occurrence in UK timezone
   */
  const getNextDateForDay = (dayOfWeek) => {
    const targetDayName = dayOfWeekMap[dayOfWeek];
    if (!targetDayName) return null;

    const targetDayIndex = DAYS_OF_WEEK.indexOf(targetDayName);
    const nowUK = getCurrentDateUK();
    const todayIndex = nowUK.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate days until target (including today)
    let daysUntil = targetDayIndex - todayIndex;
    if (daysUntil < 0) {
      daysUntil += 7; // Next week
    }

    return addDays(startOfDay(nowUK), daysUntil);
  };

  /**
   * Find next occurrence of a day_of_week from tomorrow onwards (for next open date calculation)
   * @param {string} dayOfWeek - Square format (MON, TUE, etc.)
   * @param {string} openTime - Opening time in HH:MM format (optional)
   * @returns {Date|null} - Next occurrence in UK timezone from tomorrow
   */
  const getNextFutureDateForDay = (dayOfWeek, openTime = null) => {
    const targetDayName = dayOfWeekMap[dayOfWeek];
    if (!targetDayName) return null;

    const targetDayIndex = DAYS_OF_WEEK.indexOf(targetDayName);
    const nowUK = getCurrentDateUK();
    const todayIndex = nowUK.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate days until target (starting from tomorrow)  
    let daysUntil = targetDayIndex - todayIndex;
    if (daysUntil <= 0) {
      daysUntil += 7; // Next week
    }

    const nextDate = addDays(startOfDay(nowUK), daysUntil);
    
    // Set opening time if provided
    if (openTime) {
      const [hours, minutes] = openTime.split(':').map(Number);
      const dateWithTime = setHours(setMinutes(nextDate, minutes), hours);
      // Convert from UK time to proper UTC Date
      return fromZonedTime(dateWithTime, UK_TZ);
    }
    
    return nextDate;
  };

  /**
   * Calculate next open date from mobile periods or fall back to physical hours
   * @param {Array} mobilePeriods - Mobile location periods
   * @param {Object} physicalHours - Physical location hours
   * @param {Array} todayPeriods - Today's mobile periods (to check if opens later today)
   * @param {number} currentTime - Current time in minutes
   * @returns {Date|null} - Next open date or null for "closed until further notice"
   */
  const calculateNextOpenDate = (mobilePeriods, physicalHours, todayPeriods = [], currentTime = 0) => {
    if (!mobilePeriods || mobilePeriods.length === 0) {
      return null; // "Closed until further notice"
    }

    // First check if restaurant opens LATER TODAY
    if (todayPeriods && todayPeriods.length > 0) {
      const futurePeriodsToday = todayPeriods.filter(period => {
        const periodStartTime = timeToMinutes(period.start_local_time.substring(0, 5));
        return periodStartTime > currentTime;
      });

      if (futurePeriodsToday.length > 0) {
        // Find earliest period that starts after current time
        const earliestPeriod = futurePeriodsToday.reduce((earliest, current) => {
          const earliestTime = timeToMinutes(earliest.start_local_time.substring(0, 5));
          const currentTime = timeToMinutes(current.start_local_time.substring(0, 5));
          return currentTime < earliestTime ? current : earliest;
        });

        // Create date in UK timezone
        const nowUK = getCurrentDateUK();
        const openTime = earliestPeriod.start_local_time.substring(0, 5);
        const [hours, minutes] = openTime.split(':').map(Number);
        
        // Set the time and convert from UK time to proper UTC Date
        const dateWithTime = setHours(setMinutes(nowUK, minutes), hours);
        return fromZonedTime(dateWithTime, UK_TZ);
      }
    }

    // Map each period's day_of_week to its next occurrence from tomorrow with opening time
    const futureDates = mobilePeriods
      .map(period => {
        const openTime = period.start_local_time ? period.start_local_time.substring(0, 5) : null;
        return getNextFutureDateForDay(period.day_of_week, openTime);
      })
      .filter(date => date !== null);

    if (futureDates.length === 0) {
      // No future dates found, fall back to physical hours
      return calculateNextOpenFromPhysical(physicalHours);
    }

    // Return earliest date
    return futureDates.reduce((earliest, current) => 
      isBefore(current, earliest) ? current : earliest
    );
  };

  /**
   * Calculate next open date from physical hours (fallback)
   * @param {Object} physicalHours - Physical location hours
   * @param {number} currentTime - Current time in minutes (optional, to check if opens later today)
   * @returns {Date|null}
   */
  const calculateNextOpenFromPhysical = (physicalHours, currentTime = null) => {
    const nowUK = getCurrentDateUK();
    const todayName = getCurrentDay();
    
    // First check if restaurant opens LATER TODAY
    if (currentTime !== null && physicalHours[todayName]) {
      const todayOpenTime = timeToMinutes(physicalHours[todayName].open);
      if (todayOpenTime > currentTime) {
        const openTime = physicalHours[todayName].open;
        const [hours, minutes] = openTime.split(':').map(Number);
        const dateWithTime = setHours(setMinutes(nowUK, minutes), hours);
        return fromZonedTime(dateWithTime, UK_TZ);
      }
    }
    
    // Check tomorrow onwards for next open day
    for (let i = 1; i <= 7; i++) {
      const checkDate = addDays(nowUK, i);
      const dayName = format(checkDate, 'EEEE');
      if (physicalHours[dayName]) {
        const openTime = physicalHours[dayName].open;
        if (openTime) {
          const [hours, minutes] = openTime.split(':').map(Number);
          const dateWithTime = setHours(setMinutes(checkDate, minutes), hours);
          return fromZonedTime(dateWithTime, UK_TZ);
        }
        return startOfDay(checkDate);
      }
    }
    
    return null;
  };

  /**
   * Transform mobile periods to date-based display format
   * Shows from today through last special date, excluding trailing normal hours
   * @param {Array} periods - Mobile location periods
   * @param {Object} physicalHours - Physical location hours for comparison
   * @returns {Array} - Array of {date: Date, dayName: string, periods: Array|null}
   */
  const transformPeriodsToDateRange = (periods, physicalHours) => {
    if (!periods || periods.length === 0) return [];

    const nowUK = getCurrentDateUK();
    const periodsByDate = new Map();
    
    // Build map of dates to their periods (next 7 days)
    periods.forEach(period => {
      const nextDate = getNextDateForDay(period.day_of_week);
      if (nextDate && isBefore(nextDate, addDays(nowUK, 8))) {
        const dateKey = format(nextDate, 'yyyy-MM-dd');
        if (!periodsByDate.has(dateKey)) {
          periodsByDate.set(dateKey, []);
        }
        periodsByDate.get(dateKey).push(period);
      }
    });

    const sortedDates = Array.from(periodsByDate.keys()).sort();
    if (sortedDates.length === 0) return [];

    const result = [];
    let lastSpecialIndex = -1;
    const lastDate = startOfDay(new Date(sortedDates[sortedDates.length - 1] + 'T00:00:00'));
    const todayKey = format(nowUK, 'yyyy-MM-dd');
    let currentDate = startOfDay(nowUK);

    // Build result array and track last special date
    while (currentDate <= lastDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const dayName = format(currentDate, 'EEEE');
      const datePeriods = periodsByDate.get(dateKey);
      
      // Check if this date has normal hours (matches physical exactly)
      const isNormalHours = dateKey !== todayKey && 
        datePeriods?.length === 1 && 
        physicalHours[dayName] &&
        datePeriods[0].start_local_time.substring(0, 5) === physicalHours[dayName].open &&
        datePeriods[0].end_local_time.substring(0, 5) === physicalHours[dayName].close;
      
      result.push({
        date: new Date(currentDate),
        dayName: format(currentDate, 'EEE d MMM'),
        periods: datePeriods || null
      });
      
      // Track last date with special hours
      if (!isNormalHours) {
        lastSpecialIndex = result.length - 1;
      }
      
      currentDate = addDays(currentDate, 1);
    }

    // Return only up to last special date (trim trailing normal hours)
    return result.slice(0, lastSpecialIndex + 1);
  };

  /**
   * Check if all future days (tomorrow onwards) return to normal or don't have mobile periods
   * Used to determine if special hours are just for today
   * @param {Array} mobilePeriods - Mobile location periods
   * @param {Object} physicalHours - Physical location hours
   * @returns {boolean} - True if all future days are back to normal
   */
  const isTomorrowBackToNormal = (mobilePeriods, physicalHours) => {
    if (!mobilePeriods || mobilePeriods.length === 0) return false;

    const nowUK = getCurrentDateUK();
    
    // Check all days from tomorrow for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const checkDate = addDays(nowUK, i);
      const checkDayName = format(checkDate, 'EEEE');
      const checkSquareDay = Object.keys(dayOfWeekMap).find(
        key => dayOfWeekMap[key] === checkDayName
      );
      
      // Get mobile periods for this day
      const dayMobilePeriods = mobilePeriods.filter(
        p => p.day_of_week === checkSquareDay
      );
      
      // If no mobile periods for this day, skip it (it follows physical schedule)
      if (dayMobilePeriods.length === 0) {
        continue;
      }
      
      // Has mobile periods - check if they match physical hours
      const physicalDayHours = physicalHours[checkDayName];
      
      // If physical hours don't exist for this day, or multiple mobile periods, not matching
      if (!physicalDayHours || dayMobilePeriods.length !== 1) {
        return false;
      }
      
      // Check if the single mobile period matches physical hours
      const mobilePeriod = dayMobilePeriods[0];
      const mobileOpen = mobilePeriod.start_local_time.substring(0, 5);
      const mobileClose = mobilePeriod.end_local_time.substring(0, 5);
      
      // If doesn't match, there are special hours on a future day
      if (mobileOpen !== physicalDayHours.open || mobileClose !== physicalDayHours.close) {
        return false;
      }
    }
    
    // All future days either have no mobile periods or match physical hours
    return true;
  };

  // Check if mobile override is active
  const overrideActive = mobileLocationData?.status === 'ACTIVE';
  const mobilePeriods = mobileLocationData?.business_hours?.periods || [];
  const mobileLocationName = mobileLocationData?.name || 'Special Hours';

  // If mobile override is active, check for today's periods
  if (overrideActive) {
    const currentDay = getCurrentDay();
    const currentDaySquare = Object.keys(dayOfWeekMap).find(
      key => dayOfWeekMap[key] === currentDay
    );
    
    const todayMobilePeriods = mobilePeriods.filter(
      p => p.day_of_week === currentDaySquare
    );
    
    // Check if override is just for today
    const isTodayOnly = isTomorrowBackToNormal(mobilePeriods, openingHours);

    // No periods for today = CLOSED
    if (todayMobilePeriods.length === 0) {
      const todayHours = openingHours[currentDay];
      return {
        isOpen: false,
        closingSoon: false,
        todayHours, // Still show physical hours for display
        nextOpenDate: calculateNextOpenDate(mobilePeriods, openingHours),
        overrideActive: true,
        overridePeriods: transformPeriodsToDateRange(mobilePeriods, openingHours),
        isTodayOnly,
        mobileLocationName
      };
    }

    // Has periods for today - check if currently within those periods
    const currentTime = getCurrentTimeInMinutes();
    let isCurrentlyOpen = false;
    let closingSoonTime = null;

    for (const period of todayMobilePeriods) {
      const openTime = timeToMinutes(period.start_local_time.substring(0, 5));
      const closeTime = timeToMinutes(period.end_local_time.substring(0, 5));
      
      if (currentTime >= openTime && currentTime < closeTime) {
        isCurrentlyOpen = true;
        closingSoonTime = closeTime;
        break;
      }
    }

    if (isCurrentlyOpen) {
      const timeUntilClose = closingSoonTime - currentTime;
      const closingSoon = timeUntilClose > 0 && timeUntilClose <= CLOSING_SOON_THRESHOLD;
      
      // Find the current active period to get accurate hours
      const activePeriod = todayMobilePeriods.find(period => {
        const openTime = timeToMinutes(period.start_local_time.substring(0, 5));
        const closeTime = timeToMinutes(period.end_local_time.substring(0, 5));
        return currentTime >= openTime && currentTime < closeTime;
      });
      
      // Use mobile hours from active period, fall back to physical if not found
      const actualTodayHours = activePeriod ? {
        open: activePeriod.start_local_time.substring(0, 5),
        close: activePeriod.end_local_time.substring(0, 5)
      } : openingHours[currentDay];
      
      return {
        isOpen: true,
        closingSoon,
        todayHours: actualTodayHours, // Use actual mobile hours
        nextOpenDate: null, // Open today, no need for next open date
        overrideActive: true,
        overridePeriods: transformPeriodsToDateRange(mobilePeriods, openingHours),
        isTodayOnly,
        mobileLocationName
      };
    } else {
      // Has periods but not currently in any of them = closed right now
      const todayHours = openingHours[currentDay];
      return {
        isOpen: false,
        closingSoon: false,
        todayHours,
        nextOpenDate: calculateNextOpenDate(mobilePeriods, openingHours, todayMobilePeriods, currentTime),
        overrideActive: true,
        overridePeriods: transformPeriodsToDateRange(mobilePeriods, openingHours),
        isTodayOnly,
        mobileLocationName
      };
    }
  }

  // No mobile override - use physical hours (existing logic)
  const todayHours = openingHours[getCurrentDay()];
  const currentTime = getCurrentTimeInMinutes();
  const openTime = timeToMinutes(todayHours.open);
  const closeTime = timeToMinutes(todayHours.close);
  
  const isOpen = currentTime >= openTime && currentTime < closeTime;
  const closingSoon = isOpen && (closeTime - currentTime) > 0 && (closeTime - currentTime) <= CLOSING_SOON_THRESHOLD;

  return {
    isOpen,
    closingSoon,
    todayHours,
    nextOpenDate: isOpen ? null : calculateNextOpenFromPhysical(openingHours, currentTime),
    overrideActive: false,
    overridePeriods: [],
    isTodayOnly: false,
    mobileLocationName: null
  };
}
