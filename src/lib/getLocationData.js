"use server";

import { fetchSquare } from "./squareApi";
import { DEFAULT_OPENING_HOURS, DEFAULT_OPENING_HOURS_SCHEMA, DEFAULT_OPENING_HOURS_TEXT } from "./constants";
import { stripSeconds, convertTo12Hour } from "./formatTime";

const LOCATION_ID = process.env.LOCATION_ID;
const MOBILE_LOCATION_ID = process.env.MOBILE_LOCATION_ID;

/**
 * Transform Square's day format to app format
 */
const SQUARE_DAY_MAP = {
  SUN: "Sunday",
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday"
};

/**
 * Transform Square's abbreviated day to Schema.org format
 */
const SQUARE_DAY_TO_SCHEMA = {
  SUN: "Su",
  MON: "Mo",
  TUE: "Tu",
  WED: "We",
  THU: "Th",
  FRI: "Fr",
  SAT: "Sa"
};

/**
 * Format opening hours as human-readable text in multiple formats
 * @param {object} openingHours - Opening hours object with day keys
 * @returns {object} Object containing various text formats
 */
function formatOpeningHoursText(openingHours) {
  const allDays = Object.values(openingHours);
  const allSame = allDays.every(day => 
    day.open === allDays[0].open && day.close === allDays[0].close
  );
  
  if (allSame) {
    // All days have same hours (most common case)
    const open = convertTo12Hour(allDays[0].open);   // "11:00 AM"
    const close = convertTo12Hour(allDays[0].close); // "7:00 PM"
    
    return {
      short: `Mon-Sun ${open} - ${close}`,
      days: "Monday - Sunday",
      times: `${open} - ${close}`,
      sentence: `Monday through Sunday from ${open} to ${close}`
    };
  }
  
  // Different hours for different days - return generic format
  // In the future, this could be enhanced to detect weekday/weekend patterns
  return {
    short: "Hours vary by day",
    days: "Hours vary",
    times: "See details",
    sentence: "hours vary by day - please check our opening hours for details"
  };
}

/**
 * Fetch mobile location data (optional override signal)
 * @returns {Promise<{status: string, business_hours: object, name: string} | null>}
 */
async function getMobileLocationData() {
  if (!MOBILE_LOCATION_ID) {
    return null;
  }

  try {
    const data = await fetchSquare(`/v2/locations/${MOBILE_LOCATION_ID}`, {
      method: "GET",
      next: { revalidate: 300 } // Revalidate every 5 minutes for time-sensitive overrides
    });

    return {
      status: data.location?.status || 'INACTIVE',
      business_hours: data.location?.business_hours || null,
      name: data.location?.name || 'Special Hours'
    };
  } catch (error) {
    return null;
  }
}

/**
 * Fetch location data from Square Locations API
 * Returns both physical location hours (transformed) and mobile location data (raw)
 * @returns {Promise<{openingHours: object, openingHoursSchema: string[], openingHoursText: object, isFallback: boolean, mobileLocationData: object|null}>}
 */
export async function getLocationData() {
  try {
    // Fetch both Physical and Mobile locations in parallel
    const [physicalData, mobileLocationData] = await Promise.all([
      fetchSquare(`/v2/locations/${LOCATION_ID}`, {
        method: "GET",
        next: { revalidate: 300 }
      }),
      getMobileLocationData()
    ]);

    const periods = physicalData.location?.business_hours?.periods;
    
    if (!periods || periods.length === 0) {
      console.warn("No business hours found in Square location data - showing default hours but disabling ordering");
      return {
        openingHours: DEFAULT_OPENING_HOURS, // Show default hours for display
        openingHoursSchema: DEFAULT_OPENING_HOURS_SCHEMA,
        openingHoursText: DEFAULT_OPENING_HOURS_TEXT,
        isFallback: true, // Flag to disable ordering
        mobileLocationData: null
      };
    }

    // Transform to app format
    const openingHours = {};
    const openingHoursSchema = [];

    periods.forEach(period => {
      const day = SQUARE_DAY_MAP[period.day_of_week];
      if (day) {
        openingHours[day] = {
          open: stripSeconds(period.start_local_time),
          close: stripSeconds(period.end_local_time)
        };

        // Create Schema.org format
        const schemaDay = SQUARE_DAY_TO_SCHEMA[period.day_of_week];
        const startTime = stripSeconds(period.start_local_time);
        const endTime = stripSeconds(period.end_local_time);
        openingHoursSchema.push(`${schemaDay} ${startTime}-${endTime}`);
      }
    });

    return {
      openingHours,
      openingHoursSchema,
      openingHoursText: formatOpeningHoursText(openingHours),
      isFallback: false,
      mobileLocationData
    };

  } catch (error) {
    return {
      openingHours: DEFAULT_OPENING_HOURS, // Show default hours for display
      openingHoursSchema: DEFAULT_OPENING_HOURS_SCHEMA,
      openingHoursText: DEFAULT_OPENING_HOURS_TEXT,
      isFallback: true, // Flag to disable ordering
      mobileLocationData: null
    };
  }
}
