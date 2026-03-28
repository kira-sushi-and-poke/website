import React from "react";
import LocationInfo from "@/components/LocationInfo";
import ContactUs from "@/components/ContactUs";
import { getLocationData } from "@/lib/getLocationData";

export const metadata = {
    title: "Contact | Kira Sushi & Poke | Chester-le-Street",
    description: "Get in touch with Kira Sushi and Poke. Find our location at 148 Front Street, Chester-le-Street, opening hours, and connect with us on social media.",
    openGraph: {
        title: "Contact Kira Sushi and Poke",
        description: "Visit us in Chester-le-Street or connect with us on social media",
    }
};

const ContactPage = async () => {
    const { openingHoursText } = await getLocationData();

    return (
        <div className="py-8 md:py-12 px-5 md:px-10 max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-hot-pink text-center">
                Contact | Kira Sushi & Poke
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Location & Hours */}
                <div>
                    <h2 className="text-2xl font-bold text-hot-pink mb-4">
                        <i className="fas fa-map-marker-alt"></i> Location & Hours
                    </h2>
                    <LocationInfo openingHoursText={openingHoursText} />
                </div>

                {/* Contact Methods */}
                <div>
                    <h2 className="text-2xl font-bold text-hot-pink mb-4">
                        <i className="fas fa-comments"></i> Get In Touch
                    </h2>
                    <ContactUs />
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
