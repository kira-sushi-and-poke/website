import React from "react";
import { DEFAULT_OPENING_HOURS_TEXT } from "@/lib/constants";
import SpecialHoursNotice from "./SpecialHoursNotice";
import { format, isToday, isTomorrow } from 'date-fns';

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
            
            <div className="bg-white border-2 border-hot-pink rounded-lg p-4 md:p-6">
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-hot-pink mb-2">Address</h3>
                    <address className="not-italic text-gray-700 text-lg">
                        Kira Sushi and Poke<br />
                        148 Front Street<br />
                        Chester-le-Street<br />
                        DH3 3AY<br />
                        United Kingdom
                    </address>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-hot-pink mb-2">
                        <i className="fas fa-clock"></i> {overrideActive && restaurantStatus.mobileLocationName ? restaurantStatus.mobileLocationName : 'Opening hours'}
                    </h3>
                    
                    {/* Current Status */}
                    {restaurantStatus && (
                        <div className="mb-3 p-3 bg-hot-pink/10 rounded-lg flex items-center gap-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${isOpen ? "bg-yellow" : "bg-hot-pink"} animate-pulse`}></span>
                            <div className="flex flex-col">
                                <span className="text-base font-semibold text-hot-pink">
                                    {isOpen ? "We're Open Now!" : "Currently Closed"}
                                </span>
                                {isOpen && closingSoon && (
                                    <span className="text-sm font-bold text-orange-600">
                                        Closing Soon (within 30 minutes)
                                    </span>
                                )}
                                {!isOpen && nextOpenDate && (
                                    <span className="text-sm text-gray-600">
                                        Next open: {isToday(new Date(nextOpenDate)) 
                                            ? `Today at ${format(new Date(nextOpenDate), 'h:mm a')}` 
                                            : isTomorrow(new Date(nextOpenDate))
                                            ? `Tomorrow at ${format(new Date(nextOpenDate), 'h:mm a')}`
                                            : format(new Date(nextOpenDate), 'EEEE d MMM')}
                                    </span>
                                )}
                                {!isOpen && !nextOpenDate && overrideActive && (
                                    <span className="text-sm text-gray-600 font-medium">
                                        Closed until further notice
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="text-gray-700">
                        <p>{hoursText.days}</p>
                        <p className="font-bold text-lg">{hoursText.times}</p>
                    </div>
                </div>
                
                {/* Google Map */}
                <div className="rounded-lg overflow-hidden border-2 border-hot-pink">
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
                    <h3 className="text-xl font-bold text-hot-pink mb-2">
                        <i className="fas fa-parking"></i> Parking
                    </h3>
                    <ul className="text-gray-700 space-y-2 list-disc pl-5">
                        <li>Market Hall Car Park - Front St, Chester-le-Street DH3 3AY</li>
                        <li><span className="font-semibold">LOADING only</span> - Right in front of the restaurant</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2 italic">
                        * Parking at these locations is at your own risk and responsibility.
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
};

export default LocationInfo;
