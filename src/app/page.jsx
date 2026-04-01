import Reviews from "../components/Reviews";
import CarouselReviews from "../components/CarouselReviews";
import LocationInfo from "../components/LocationInfo";
import ContactUs from "../components/ContactUs";
import { getLocationData } from "../lib/getLocationData";
import { checkRestaurantStatus } from "../lib/checkRestaurantStatus";

export const metadata = {
    title: "Home | Fresh Japanese Sushi & Poke Bowls in Chester-le-Street",
    description: "Welcome to Kira Sushi and Poke in Chester-le-Street. Authentic Japanese sushi and poke bowls made fresh daily. Visit us at 148 Front Street for the best sushi experience.",
    openGraph: {
        title: "Kira Sushi and Poke | Fresh Japanese Sushi in Chester-le-Street",
        description: "Visit us for authentic Japanese sushi and poke bowls made fresh daily in Chester-le-Street",
    }
};

const HomePage = async () => {
    const { openingHoursText, openingHours, isFallback, mobileLocationData } = await getLocationData();
    const restaurantStatus = checkRestaurantStatus(openingHours, mobileLocationData, isFallback);

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-white to-hot-pink/5 py-8 md:py-12 px-4 md:px-8 text-center">
                <h1 className="font-heading text-hot-pink">
                    Welcome to Kira Sushi & Poke!
                </h1>
                <p className="text-lg md:text-xl mt-3 text-yellow font-medium">Experience the flavors that bring joy!</p>
            </div>

            {/* Why Choose Us Section */}
            <div className="bg-white py-10 md:py-14 px-4 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-heading text-hot-pink mb-6 md:mb-8 text-center">
                        Why should you try us?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
                        {/* Master Craftsmanship */}
                        <div className="bg-white rounded-lg p-4 md:p-6 shadow-md border border-gray-100 active:shadow-lg transition-shadow duration-300">
                            <div className="flex gap-4 items-start">
                                <div className="text-3xl md:text-4xl text-hot-pink shrink-0">
                                    <i className="fas fa-utensils"></i>
                                </div>
                                <div>
                                    <h3 className="font-heading text-hot-pink mb-2">Master craftsmanship</h3>
                                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">Over 10 years of sushi chef experience with traditional Japanese techniques</p>
                                </div>
                            </div>
                        </div>

                        {/* Premium Ingredients */}
                        <div className="bg-white rounded-lg p-4 md:p-6 shadow-md border border-gray-100 active:shadow-lg transition-shadow duration-300">
                            <div className="flex gap-4 items-start">
                                <div className="text-3xl md:text-4xl text-hot-pink shrink-0">
                                    <i className="fas fa-fish"></i>
                                </div>
                                <div>
                                    <h3 className="font-heading text-hot-pink mb-2">Premium ingredients</h3>
                                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">Fresh, high-quality ingredients including bluefin tuna and daily-sourced fish</p>
                                </div>
                            </div>
                        </div>

                        {/* Dietary Options */}
                        <div className="bg-white rounded-lg p-4 md:p-6 shadow-md border border-gray-100 active:shadow-lg transition-shadow duration-300">
                            <div className="flex gap-4 items-start">
                                <div className="text-3xl md:text-4xl text-hot-pink shrink-0">
                                    <i className="fas fa-leaf"></i>
                                </div>
                                <div>
                                    <h3 className="font-heading text-hot-pink mb-2">Dietary options</h3>
                                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">Gluten-free, vegan, and vegetarian options available</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section - Carousel */}
            <div className="bg-gray-50 py-10 md:py-14">
                <CarouselReviews />
            </div>

            {/* Find Us & Contact Section */}
            <div className="bg-white py-10 md:py-14 px-4 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Location & Hours */}
                    {/* Location & Hours */}
                    <section>
                        <h2 className="font-heading text-hot-pink mb-4 md:mb-6 text-center">
                            Find us
                        </h2>
                        <LocationInfo openingHoursText={openingHoursText} restaurantStatus={restaurantStatus} />
                    </section>

                    {/* Contact Methods */}
                    <section>
                        <h2 className="font-heading text-hot-pink mb-4 md:mb-6 text-center">
                            Contact us
                        </h2>
                        <ContactUs />
                    </section>
                </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
