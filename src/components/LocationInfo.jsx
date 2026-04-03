import React from "react";
import { DEFAULT_OPENING_HOURS_TEXT, UK_TZ } from "@/lib/constants";
import SpecialHoursNotice from "./SpecialHoursNotice";
import { isToday, isTomorrow } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const LocationInfo = ({ openingHoursText, restaurantStatus }) => {
    // Use provided text or fallback to centralized default
    const hoursText = openingHoursText || DEFAULT_OPENING_HOURS_TEXT;
    
    const { isOpen, closingSoon, nextOpenDate, overrideActive } = restaurantStatus || {};

    return (
        <div className="space-y-6">
            {/* Special Hours Notice */}
            {restaurantStatus && (
                <SpecialHoursNotice restaurantStatus={restaurantStatus} />
            )}
            
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-md border border-gray-100">
            <div className="space-y-5 md:space-y-6">
                <div>
                    <h3 className="font-heading text-hot-pink mb-3">Address</h3>
                    <address className="not-italic text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                        Kira Sushi and Poke<br />
                        148 Front Street<br />
                        Chester-le-Street<br />
                        DH3 3AY<br />
                        United Kingdom
                    </address>
                    <a 
                        href="https://www.google.com/maps/dir/?api=1&destination=148+Front+Street,Chester-le-Street,DH3+3AY,UK"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-hot-pink text-white px-5 py-3 rounded-full font-semibold shadow-md active:scale-95 md:hover:bg-hot-pink/90 transition-all min-h-[44px]"
                    >
                        <i className="fas fa-directions"></i>
                        Get Directions
                    </a>
                </div>

                <div>
                    <h3 className="font-heading text-hot-pink mb-3">
                        <i className="fas fa-clock"></i> {overrideActive && restaurantStatus.mobileLocationName ? restaurantStatus.mobileLocationName : 'Opening hours'}
                    </h3>
                    
                    {/* Current Status */}
                    {restaurantStatus && (
                        <div className="mb-3 p-3 md:p-4 bg-hot-pink/10 rounded-lg flex items-center gap-3">
                            <span className={`inline-block w-3 h-3 rounded-full ${isOpen ? "bg-yellow" : "bg-hot-pink"} animate-pulse shrink-0`}></span>
                            <div className="flex flex-col">
                                <span className="text-base md:text-lg font-semibold text-hot-pink">
                                    {isOpen ? "We're Open Now!" : "Currently Closed"}
                                </span>
                                {isOpen && closingSoon && (
                                    <span className="text-sm md:text-base font-bold text-orange-600">
                                        Closing Soon (within 30 minutes)
                                    </span>
                                )}
                                {!isOpen && nextOpenDate && (
                                    <span className="text-sm md:text-base text-gray-600">
                                        Next open: {isToday(new Date(nextOpenDate)) 
                                            ? `Today at ${formatInTimeZone(new Date(nextOpenDate), UK_TZ, 'h:mm a')}` 
                                            : isTomorrow(new Date(nextOpenDate))
                                            ? `Tomorrow at ${formatInTimeZone(new Date(nextOpenDate), UK_TZ, 'h:mm a')}`
                                            : formatInTimeZone(new Date(nextOpenDate), UK_TZ, 'EEEE d MMM')}
                                    </span>
                                )}
                                {!isOpen && !nextOpenDate && overrideActive && (
                                    <span className="text-sm md:text-base text-gray-600 font-medium">
                                        Closed until further notice
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="text-gray-700 leading-relaxed">
                        <p className="text-base md:text-lg">{hoursText.days}</p>
                        <p className="font-bold text-lg md:text-xl">{hoursText.times}</p>
                    </div>
                </div>
                
                {/* Google Map */}
                <div className="rounded-lg overflow-hidden shadow-soft">
                    <iframe 
                        src="https://www.google.com/maps?q=148+Front+Street,+Chester-le-Street,+DH3+3AY,+UK&output=embed"
                        width="100%" 
                        height="300" 
                        style={{ border: 0 }}
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Kira Sushi and Poke Location"
                    ></iframe>
                </div>

                <div>
                    <h3 className="font-heading text-hot-pink mb-3">
                        <i className="fas fa-parking"></i> Parking
                    </h3>
                    <ul className="text-gray-700 space-y-2 list-disc pl-5 leading-relaxed text-base md:text-base">
                        <li>Market Hall Car Park - Front St, Chester-le-Street DH3 3AY</li>
                        <li><span className="font-semibold">LOADING only</span> - Right in front of the restaurant</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-3 italic">
                        * Parking at these locations is at your own risk and responsibility.
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
};

export default LocationInfo;
