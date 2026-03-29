import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { addDays, addMinutes, setHours, setMinutes, format } from 'date-fns';

const UK_TZ = 'Europe/London';

/**
 * Generate pickup time options with 15-minute intervals
 * All times are displayed in UK timezone (Europe/London) to match restaurant's local time.
 * Users anywhere in the world will see UK times to avoid confusion.
 * @param {number} minLeadTimeMinutes - Minimum lead time from now (default: 45)
 * @param {number} startHour - Start of day hour (default: 11)
 * @param {number} endHour - End of day hour (default: 19)
 * @returns {Array<{label: string, value: string}>} Array of time options
 */
export function generatePickupTimes(
  minLeadTimeMinutes = 45,
  startHour = 11,
  endHour = 19
) {
  const times = [];
  
  // Get current time in UK timezone
  const nowUTC = new Date();
  const nowUK = toZonedTime(nowUTC, UK_TZ);
  const minPickupUK = addMinutes(nowUK, minLeadTimeMinutes);
  
  // Try today and tomorrow
  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
    const targetDay = addDays(nowUK, dayOffset);
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Create time in UK timezone
        let timeUK = setHours(setMinutes(targetDay, minute), hour);
        
        // Skip if before minimum pickup time
        if (timeUK < minPickupUK) continue;
        
        // Convert UK time to UTC for storage
        const timeUTC = fromZonedTime(timeUK, UK_TZ);
        
        // Format label
        const timeLabel = format(timeUK, 'HH:mm');
        const label = timeLabel + (dayOffset === 1 ? ' (Tomorrow)' : '');
        
        times.push({
          label: label,
          value: timeUTC.toISOString()
        });
      }
    }
    
    // If we have times for today, don't generate tomorrow
    if (times.length > 0) break;
  }
  
  return times;
}
