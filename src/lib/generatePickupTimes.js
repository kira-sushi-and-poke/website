import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { addDays, addMinutes, setHours, setMinutes, format, startOfDay } from 'date-fns';
import { PICKUP_LEAD_TIME_MINUTES, UK_TZ } from './constants';

/**
 * Generate pickup time options with 15-minute intervals based on actual opening hours
 * All times are displayed in UK timezone (Europe/London) to match restaurant's local time.
 * Users anywhere in the world will see UK times to avoid confusion.
 * @param {Object} openingHours - Physical opening hours by day {Monday: {open: "11:00", close: "19:00"}, ...}
 * @param {Array} overridePeriods - Optional mobile override periods from checkRestaurantStatus [{date, dayName, periods}, ...]
 * @param {number} minLeadTimeMinutes - Minimum lead time from now (default: from constants)
 * @returns {Array<{label: string, value: string}>} Array of time options
 */
export function generatePickupTimes(
  openingHours,
  overridePeriods = [],
  minLeadTimeMinutes = PICKUP_LEAD_TIME_MINUTES
) {
  const times = [];
  
  // Get current time in UK timezone
  const nowUTC = new Date();
  const nowUK = toZonedTime(nowUTC, UK_TZ);
  const minPickupUK = addMinutes(nowUK, minLeadTimeMinutes);
  
  // Try up to 7 days ahead to find available pickup times
  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const targetDay = addDays(nowUK, dayOffset);
    const targetDayStart = startOfDay(targetDay);
    const dayName = format(targetDay, 'EEEE'); // "Monday", "Tuesday", etc.
    
    // Check if mobile override has hours for this date
    const overridePeriod = overridePeriods.find(period => {
      const periodStart = startOfDay(period.date);
      return periodStart.getTime() === targetDayStart.getTime();
    });
    
    // If override exists and date is closed (no periods), skip this day
    if (overridePeriod && (!overridePeriod.periods || overridePeriod.periods.length === 0)) {
      continue; // Closed via mobile override
    }
    
    // Get opening hours - use override if available, otherwise physical hours
    let hoursToUse;
    if (overridePeriod && overridePeriod.periods && overridePeriod.periods.length > 0) {
      // Use first period from mobile override (assuming single period per day for now)
      // TODO: Handle multiple periods per day if needed
      const firstPeriod = overridePeriod.periods[0];
      hoursToUse = {
        open: firstPeriod.start_local_time.substring(0, 5),
        close: firstPeriod.end_local_time.substring(0, 5)
      };
    } else {
      // Use physical hours
      hoursToUse = openingHours[dayName];
    }
    
    if (!hoursToUse || !hoursToUse.open || !hoursToUse.close) {
      continue; // No hours for this day
    }
    
    // Parse opening hours
    const [openHour, openMinute] = hoursToUse.open.split(':').map(Number);
    const [closeHour, closeMinute] = hoursToUse.close.split(':').map(Number);
    
    // Generate times in 15-minute intervals
    let currentHour = openHour;
    let currentMinute = openMinute;
    
    // Calculate minimum time for this day
    const minTimeForDay = dayOffset === 0 
      ? minPickupUK  // Today: now + lead time
      : addMinutes(setHours(setMinutes(targetDay, openMinute), openHour), minLeadTimeMinutes); // Tomorrow: opening + lead time
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      // Create time in UK timezone
      let timeUK = setHours(setMinutes(targetDay, currentMinute), currentHour);
      
      // Skip if before minimum pickup time for this day
      if (timeUK >= minTimeForDay) {
        // Convert UK time to UTC for storage
        const timeUTC = fromZonedTime(timeUK, UK_TZ);
        
        // Format label with day name
        const timeLabel = format(timeUK, 'HH:mm');
        let label = timeLabel;
        
        if (dayOffset === 0) {
          // Today - no suffix
          label = timeLabel;
        } else if (dayOffset === 1) {
          // Tomorrow
          label = timeLabel + ' (Tomorrow)';
        } else {
          // Future days - show day name
          const dayNameShort = format(targetDay, 'EEEE'); // "Monday", "Tuesday", etc.
          label = `${timeLabel} (${dayNameShort})`;
        }
        
        times.push({
          label: label,
          value: timeUTC.toISOString()
        });
      }
      
      // Increment by 15 minutes
      currentMinute += 15;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }
    
    // If we have times for this day, stop searching (we found available pickup times)
    if (times.length > 0) break;
  }
  
  return times;
}
