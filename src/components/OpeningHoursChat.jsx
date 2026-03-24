"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

const OpeningHoursChat = () => {
    const [showModal, setShowModal] = useState(false);
    const [showSign, setShowSign] = useState(true);
    const pathname = usePathname();

    // Hide on menu/order pages
    const shouldHide = pathname?.startsWith('/menu/order') || pathname === '/menu/order';
    
    if (shouldHide) {
        return null;
    }

    // Opening hours data
    const openingHours = {
        Monday: { open: "11:00", close: "19:00" },
        Tuesday: { open: "11:00", close: "19:00" },
        Wednesday: { open: "11:00", close: "19:00" },
        Thursday: { open: "11:00", close: "19:00" },
        Friday: { open: "11:00", close: "19:00" },
        Saturday: { open: "11:00", close: "19:00" },
        Sunday: { open: "11:00", close: "19:00" }
    };

    // Constants
    const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const CLOSING_SOON_THRESHOLD = 30; // minutes

    // Helper functions
    const getCurrentDay = () => DAYS[new Date().getDay()];
    
    const getTodayHours = () => openingHours[getCurrentDay()];
    
    const timeToMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(":").map(Number);
        return hours * 60 + minutes;
    };
    
    const getCurrentTimeInMinutes = () => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    };

    // Check if currently open
    const isOpen = () => {
        const currentTime = getCurrentTimeInMinutes();
        const todayHours = getTodayHours();
        const openTime = timeToMinutes(todayHours.open);
        const closeTime = timeToMinutes(todayHours.close);
        
        return currentTime >= openTime && currentTime < closeTime;
    };

    // Check if closing soon (within CLOSING_SOON_THRESHOLD minutes of closing)
    const isClosingSoon = () => {
        const currentTime = getCurrentTimeInMinutes();
        const todayHours = getTodayHours();
        const closeTime = timeToMinutes(todayHours.close);
        const timeDifference = closeTime - currentTime;
        
        return timeDifference > 0 && timeDifference <= CLOSING_SOON_THRESHOLD;
    };

    const restaurantOpen = isOpen();
    const closingSoon = isClosingSoon();

    return (
        <>
            {/* Sticky Restaurant Sign */}
            {showSign && (
                <div className="fixed bottom-6 right-6 z-40">
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowModal(true);
                        }}
                        className={`
                            relative px-6 py-4 rounded-lg font-bold text-center
                            transition-all duration-300 hover:scale-105
                            bg-white block cursor-pointer
                            ${restaurantOpen 
                                ? 'shadow-[0_0_20px_rgba(236,72,153,0.6),0_0_40px_rgba(236,72,153,0.4),0_0_60px_rgba(236,72,153,0.2)] border-4 border-hot-pink' 
                                : 'shadow-[0_0_20px_rgba(255,215,0,0.6),0_0_40px_rgba(255,215,0,0.4),0_0_60px_rgba(255,215,0,0.2)] border-4 border-yellow'
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
                            <div className="text-xs opacity-75 mt-1 text-hot-pink">View opening hours</div>
                        </div>
                    </a>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full relative"
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
                        <div className="flex items-center gap-2 mb-6 p-3 bg-hot-pink/10 rounded">
                            <span className={`inline-block w-3 h-3 rounded-full ${restaurantOpen ? 'bg-yellow' : 'bg-hot-pink'} animate-pulse`}></span>
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-hot-pink">
                                    {restaurantOpen ? "We're Open Now!" : "Currently Closed"}
                                </span>
                                {restaurantOpen && closingSoon && (
                                    <span className="text-sm font-bold text-orange-600 animate-pulse">
                                        Closing Soon (within 30 minutes)
                                    </span>
                                )}
                            </div>
                        </div>
                        <ul className="space-y-3">
                            {Object.entries(openingHours).map(([day, hours]) => (
                                <li key={day} className="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <span className="font-semibold text-gray-700">{day}:</span>
                                    <span className="text-gray-600">{hours.open} - {hours.close}</span>
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
