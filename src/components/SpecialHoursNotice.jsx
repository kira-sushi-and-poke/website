"use client";
import React from "react";
import { convertTo12Hour } from "@/lib/formatTime";

/**
 * Display special hours notice when mobile location override is active
 * Shows date-based schedule with times or "Closed" for each day
 * Hidden when mobile override is not active
 */
const SpecialHoursNotice = ({ restaurantStatus }) => {
  const { overrideActive, overridePeriods, isTodayOnly, mobileLocationName } = restaurantStatus;
  
  // Don't show if override is not active or no periods
  if (!overrideActive || !overridePeriods || overridePeriods.length === 0) {
    return null;
  }
  
  // Only hide if tomorrow returns to normal AND today is open with normal hours
  // If today is closed or has different hours, always show the notice
  if (isTodayOnly && overridePeriods.length === 1) {
    const todayPeriods = overridePeriods[0].periods;
    // If today has periods (is open), don't show - it's just normal hours
    // If today is closed (no periods), show it - user needs to know
    if (todayPeriods && todayPeriods.length > 0) {
      return null;
    }
  }
  
  // Determine appropriate messaging based on context
  const isMultipleDays = overridePeriods.length > 1;
  const subtitle = isTodayOnly 
    ? "We have adjusted our hours for today only. Normal hours resume tomorrow."
    : "We have adjusted our hours for the upcoming days. Please note the special schedule below:";
  
  return (
    <div className="bg-gradient-to-r from-hot-pink/10 to-yellow/10 border-2 border-hot-pink/30 rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-center gap-3 mb-4">
        <i className="fas fa-calendar-alt text-hot-pink text-2xl"></i>
        <h3 className="text-2xl font-bold text-hot-pink">{mobileLocationName || 'Special Hours Notice'}</h3>
      </div>
      
      <p className="text-gray-700 text-center mb-4">
        {subtitle}
      </p>
      
      <div className="bg-white rounded-lg p-4 space-y-3">
        {overridePeriods.map((override, index) => (
          <div 
            key={index} 
            className={`flex justify-between items-center pb-3 ${
              index < overridePeriods.length - 1 ? 'border-b border-gray-200' : ''
            }`}
          >
            <span className="font-bold text-gray-800 text-lg">
              {override.dayName}
            </span>
            <span className={`text-lg ${override.periods ? 'text-gray-700' : 'text-hot-pink font-bold'}`}>
              {override.periods && override.periods.length > 0 ? (
                override.periods.map((period, pIndex) => (
                  <span key={pIndex}>
                    {convertTo12Hour(period.start_local_time.substring(0, 5))} - {convertTo12Hour(period.end_local_time.substring(0, 5))}
                    {pIndex < override.periods.length - 1 && ', '}
                  </span>
                ))
              ) : (
                'Closed'
              )}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          <i className="fas fa-info-circle mr-1"></i>
          {isTodayOnly 
            ? "Normal hours will resume tomorrow. Thank you for your understanding!"
            : "Regular hours will resume after this period. Thank you for your understanding!"
          }
        </p>
      </div>
    </div>
  );
};

export default SpecialHoursNotice;
