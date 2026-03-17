import React from "react";
import restaurantInfo from "@/data/restaurant-info";

export const metadata = {
    title: "Contact Us | Get in Touch",
    description: "Get in touch with Kira Sushi and Poke. Find our location at 148 Front Street, Chester-le-Street, opening hours, and connect with us on social media.",
    openGraph: {
        title: "Contact Kira Sushi and Poke",
        description: "Visit us in Chester-le-Street or connect with us on social media",
    }
};

const ContactPage = () => {
    return (
        <div className="py-8 md:py-12 px-5 md:px-10 max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-hot-pink text-center">
                Contact Us
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Location & Hours */}
                <div className="bg-white border-2 border-hot-pink rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-hot-pink mb-4 flex items-center gap-2">
                        <i className="fas fa-map-marker-alt"></i>
                        Location
                    </h2>
                    <address className="not-italic text-gray-700 mb-6 space-y-1">
                        <p className="font-bold">Kira Sushi and Poke</p>
                        <p>148 Front Street</p>
                        <p>Chester-le-Street</p>
                        <p>DH3 3AY</p>
                        <p>United Kingdom</p>
                    </address>

                    <h3 className="text-xl font-bold text-hot-pink mb-3 mt-6 flex items-center gap-2">
                        <i className="fas fa-clock"></i>
                        Opening Hours
                    </h3>
                    <div className="text-gray-700 space-y-1">
                        <p>Monday - Sunday</p>
                        <p className="font-bold text-lg">11:00 AM - 7:00 PM</p>
                    </div>

                    {/* Google Map */}
                    <div className="mt-6 rounded-lg overflow-hidden border-2 border-hot-pink">
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
                </div>

                {/* Social Media & Contact Methods */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-hot-pink rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-hot-pink mb-4 flex items-center gap-2">
                            <i className="fas fa-comments"></i>
                            Get In Touch
                        </h2>
                        
                        <div className="bg-yellow/10 border-l-4 border-yellow p-4 mb-4">
                            <p className="font-semibold text-gray-800">
                                <i className="fas fa-star text-yellow mr-2"></i>
                                Social media is the fastest way to reach us!
                            </p>
                        </div>

                        <p className="text-gray-700 mb-4">
                            Connect with us on social media for quick responses, daily specials, and the latest updates.
                        </p>

                        <div className="space-y-3">
                            <a 
                                href="https://www.instagram.com/kira_sushi_and_poke" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 border-2 border-hot-pink rounded-lg hover:bg-hot-pink hover:text-white transition-all group"
                            >
                                <i className="fab fa-instagram text-3xl text-hot-pink group-hover:text-white"></i>
                                <div>
                                    <p className="font-bold">Instagram</p>
                                    <p className="text-sm opacity-75">@kira_sushi_and_poke</p>
                                </div>
                            </a>

                            <a 
                                href="https://www.facebook.com/people/Kira-Sushi-Poke/61583413766423/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 border-2 border-hot-pink rounded-lg hover:bg-hot-pink hover:text-white transition-all group"
                            >
                                <i className="fab fa-facebook text-3xl text-hot-pink group-hover:text-white"></i>
                                <div>
                                    <p className="font-bold">Facebook</p>
                                    <p className="text-sm opacity-75">Kira Sushi Poke</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Parking Info */}
                    <div className="bg-white border-2 border-hot-pink rounded-lg p-6">
                        <h3 className="text-xl font-bold text-hot-pink mb-3 flex items-center gap-2">
                            <i className="fas fa-parking"></i>
                            Parking Information
                        </h3>
                        <ul className="text-gray-700 space-y-2 list-disc pl-5">
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

export default ContactPage;
