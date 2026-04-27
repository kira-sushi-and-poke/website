import LocationInfo from "@/components/LocationInfo";
import ContactUs from "@/components/ContactUs";
import { getLocationData } from "@/lib/getLocationData";
import { checkRestaurantStatus } from "@/lib/checkRestaurantStatus";

// Revalidate every 3 minutes to keep opening hours fresh
export const revalidate = 180;

export const metadata = {
    title: "Contact | Kira Sushi & Poke | Chester-le-Street",
    description: "Get in touch with Kira Sushi and Poke. Find our location at 148 Front Street, Chester-le-Street, opening hours, and connect with us on social media.",
    openGraph: {
        title: "Contact Kira Sushi and Poke",
        description: "Visit us in Chester-le-Street or connect with us on social media",
    }
};

const ContactPage = async () => {
    const { openingHoursText, openingHours, isFallback, mobileLocationData } = await getLocationData();
    const restaurantStatus = checkRestaurantStatus(openingHours, mobileLocationData, isFallback);

    return (
        <div className="py-8 md:py-12 px-4 md:px-10 max-w-6xl mx-auto">
            <h1 className="font-heading text-hot-pink mb-6 md:mb-8 text-center">
                Contact | Kira Sushi & Poke
            </h1>

            <p className="text-center text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto">
                We'd love to hear from you! Whether you have questions about our menu, want to make a reservation, or just want to say hello, feel free to reach out.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Location & Hours */}
                <div>
                    <h2 className="font-heading text-hot-pink mb-4">
                        Location and hours
                    </h2>
                    <LocationInfo openingHoursText={openingHoursText} openingHours={openingHours} restaurantStatus={restaurantStatus} />
                </div>

                {/* Contact Methods */}
                <div>
                    <h2 className="font-heading text-hot-pink mb-4">
                        Get in touch
                    </h2>
                    <ContactUs />
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
