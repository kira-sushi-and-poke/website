/**
 * Generate pickup time options with 15-minute intervals
 * @param {number} minLeadTimeMinutes - Minimum lead time from now (default: 30)
 * @param {number} startHour - Start of day hour (default: 11)
 * @param {number} endHour - End of day hour (default: 19)
 * @returns {Array<{label: string, value: string}>} Array of time options
 */
export function generatePickupTimes(
  minLeadTimeMinutes = 30,
  startHour = 11,
  endHour = 19
) {
  const times = [];
  const now = new Date();
  const minTime = new Date(now.getTime() + minLeadTimeMinutes * 60000);
  
  // Start from today at startHour
  const startOfDay = new Date(now);
  startOfDay.setHours(startHour, 0, 0, 0);
  
  // End at endHour
  const endOfDay = new Date(now);
  endOfDay.setHours(endHour, 0, 0, 0);
  
  // If current time is past startHour, start from minTime instead
  let currentTime = minTime > startOfDay ? minTime : startOfDay;
  
  // Round up to next 15-min interval
  const minutes = currentTime.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  currentTime.setMinutes(roundedMinutes, 0, 0);
  
  // Generate time slots
  while (currentTime <= endOfDay) {
    const timeString = currentTime.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    });
    const isoString = currentTime.toISOString();
    times.push({ label: timeString, value: isoString });
    currentTime = new Date(currentTime.getTime() + 15 * 60000); // Add 15 minutes
  }
  
  // If no times today, add times for tomorrow
  if (times.length === 0) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(startHour, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(endHour, 0, 0, 0);
    
    let time = tomorrow;
    while (time <= tomorrowEnd) {
      const timeString = time.toLocaleTimeString("en-GB", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: false 
      }) + " (Tomorrow)";
      const isoString = time.toISOString();
      times.push({ label: timeString, value: isoString });
      time = new Date(time.getTime() + 15 * 60000);
    }
  }
  
  return times;
}
