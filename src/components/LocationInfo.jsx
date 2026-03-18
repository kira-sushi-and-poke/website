import React from "react";

const LocationInfo = () => {
    return (
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
                        <i className="fas fa-clock"></i> Opening Hours
                    </h3>
                    <div className="text-gray-700">
                        <p>Monday - Sunday</p>
                        <p className="font-bold text-lg">11:00 AM - 7:00 PM</p>
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
    );
};

export default LocationInfo;
