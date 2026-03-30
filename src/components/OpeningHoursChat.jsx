"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { DAYS_OF_WEEK, CLOSING_SOON_THRESHOLD } from "@/lib/constants";
import { convertTo12Hour } from "@/lib/formatTime";
import { format } from 'date-fns';

const OpeningHoursChat = ({ openingHours, isFallback = false, restaurantStatus }) => {
    const [showModal, setShowModal] = useState(false);
    const [showSign, setShowSign] = useState(true);
    const pathname = usePathname();

    // Use restaurant status from props (calculated server-side with mobile override support)
    const { isOpen, closingSoon, nextOpenDate, overrideActive, overridePeriods, isTodayOnly, mobileLocationName } = restaurantStatus;
    const restaurantOpen = isOpen;

    // Hide on menu/order pages ONLY when restaurant is open
    const isOrderPage = pathname?.startsWith("/menu/order") || pathname === "/menu/order";
    const shouldHide = isOrderPage && restaurantOpen;
    
    if (shouldHide) {
        return null;
    }

    return (
        <>
            {/* Sticky Restaurant Sign */}
            {showSign && (
                <div className="fixed bottom-6 right-6 z-60">
                    <a
                        href={(restaurantOpen && !closingSoon) ? "/menu/order" : "#"}
                        onClick={(e) => {
                            if (!restaurantOpen || closingSoon) {
                                e.preventDefault();
                                setShowModal(true);
                            }
                        }}
                        className={`
                            relative px-6 py-4 rounded-lg font-bold text-center
                            transition-all duration-300 hover:scale-105
                            bg-white block cursor-pointer
                            ${restaurantOpen 
                                ? "shadow-[0_0_20px_rgba(236,72,153,0.6),0_0_40px_rgba(236,72,153,0.4),0_0_60px_rgba(236,72,153,0.2)] border-4 border-hot-pink" 
                                : "shadow-[0_0_20px_rgba(255,215,0,0.6),0_0_40px_rgba(255,215,0,0.4),0_0_60px_rgba(255,215,0,0.2)] border-4 border-yellow"
                            }
                        `}
                    >
                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowSign(false);
                            }}
                            className="absolute -top-3 -right-3 bg-yellow text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600 transition-colors text-xl font-bold"
                            aria-label="Close opening hours sign"
                        >
                            ×
                        </button>
                        
                        <div className="flex flex-col items-center">
                            <div className="text-xs tracking-widest uppercase opacity-90 text-hot-pink">We are</div>
                            <div className="text-3xl md:text-4xl font-black tracking-wider uppercase text-yellow">
                                {restaurantOpen ? "OPEN" : "CLOSED"}
                            </div>
                            {restaurantOpen && closingSoon && (
                                <div className="text-xs font-bold text-orange-600 mt-1 animate-pulse">
                                    Closing Soon
                                </div>
                            )}
                            <div className="text-xs opacity-75 mt-1 text-hot-pink underline">
                                {(restaurantOpen && !closingSoon) ? "Order here" : "View opening times"}
                            </div>
                        </div>
                    </a>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-hot-pink text-2xl font-bold"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-4 flex items-center gap-3">
                            Opening Hours
                        </h2>
                        
                        {/* Fallback warning */}
                        {isFallback && (
                            <div className="mb-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-800">
                                <i className="fas fa-exclamation-triangle text-yellow-600"></i>
                                <span>Displaying default hours. Please check on social media to confirm.</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 mb-6 p-3 bg-hot-pink/10 rounded">
                            <span className={`inline-block w-3 h-3 rounded-full ${restaurantOpen ? "bg-yellow" : "bg-hot-pink"} animate-pulse`}></span>
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-hot-pink">
                                    {restaurantOpen ? "We're Open Now!" : "Currently Closed"}
                                </span>
                                {restaurantOpen && closingSoon && (
                                    <span className="text-sm font-bold text-orange-600 animate-pulse">
                                        Closing Soon (within 30 minutes)
                                    </span>
                                )}
                                {!restaurantOpen && nextOpenDate && (
                                    <span className="text-sm text-gray-600">
                                        Next open: {format(new Date(nextOpenDate), 'EEEE d MMM')}
                                    </span>
                                )}
                                {!restaurantOpen && !nextOpenDate && overrideActive && (
                                    <span className="text-sm text-gray-600 font-medium">
                                        Closed until further notice
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Mobile Override Schedule - show when there are special changes worth highlighting */}
                        {overrideActive && overridePeriods && overridePeriods.length > 0 && 
                         !(isTodayOnly && overridePeriods.length === 1 && overridePeriods[0].periods && overridePeriods[0].periods.length > 0) && (
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-hot-pink mb-3 flex items-center gap-2">
                                    <i className="fas fa-calendar-alt"></i>
                                    {mobileLocationName || 'Special Hours'}
                                </h3>
                                <div className="bg-yellow/10 border border-yellow/30 rounded-lg p-3">
                                    {isTodayOnly && (
                                        <p className="text-sm text-gray-700 mb-2 font-medium">
                                            Normal hours resume tomorrow
                                        </p>
                                    )}
                                    <ul className="space-y-2">
                                        {overridePeriods.map((override, index) => (
                                            <li key={index} className="flex justify-between items-center">
                                                <span className="font-medium text-gray-700">{override.dayName}:</span>
                                                <span className="text-gray-600">
                                                    {override.periods && override.periods.length > 0 ? (
                                                        override.periods.map((period, pIndex) => (
                                                            <span key={pIndex}>
                                                                {convertTo12Hour(period.start_local_time.substring(0, 5))} - {convertTo12Hour(period.end_local_time.substring(0, 5))}
                                                                {pIndex < override.periods.length - 1 && ', '}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-hot-pink font-medium">Closed</span>
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        
                        {/* Regular Weekly Hours */}
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Regular Weekly Hours</h3>
                        <ul className="space-y-3 mb-6">
                            {Object.entries(openingHours).map(([day, hours]) => (
                                <li key={day} className="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <span className="font-semibold text-gray-700">{day}:</span>
                                    <span className="text-gray-600">{convertTo12Hour(hours.open)} - {convertTo12Hour(hours.close)}</span>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="mt-6 p-3 bg-yellow/10 rounded-lg border border-yellow/30">
                            <p className="text-sm text-gray-700 text-center">
                                <i className="fas fa-info-circle"></i> Hours subject to change. Check our social media for holiday schedules and updates.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OpeningHoursChat;
