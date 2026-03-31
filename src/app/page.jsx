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
            <div className="bg-white py-12 md:py-16 px-5 md:px-8 text-center border-b-8 border-hot-pink">
                <h1 className="text-3xl md:text-4xl font-bold text-hot-pink">
                    Welcome to Kira Sushi & Poke!
                </h1>
                <p className="text-xl mt-4 text-yellow">Experience the flavors that bring joy!</p>
            </div>

            {/* Why Choose Us Section */}
            <div className="py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-6 md:mb-8 text-center">
                    Why should you try us?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Master Craftsmanship */}
                    <div className="flex gap-4 items-start">
                        <div className="text-3xl md:text-4xl text-hot-pink shrink-0">
                            <i className="fas fa-utensils"></i>
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-hot-pink mb-1.5">Master craftsmanship</h3>
                            <p className="text-sm md:text-base text-gray-700">Over 10 years of sushi chef experience with traditional Japanese techniques</p>
                        </div>
                    </div>

                    {/* Premium Ingredients */}
                    <div className="flex gap-4 items-start">
                        <div className="text-3xl md:text-4xl text-hot-pink shrink-0">
                            <i className="fas fa-fish"></i>
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-hot-pink mb-1.5">Premium ingredients</h3>
                            <p className="text-sm md:text-base text-gray-700">Fresh, high-quality ingredients including bluefin tuna and daily-sourced fish</p>
                        </div>
                    </div>

                    {/* Dietary Options */}
                    <div className="flex gap-4 items-start">
                        <div className="text-3xl md:text-4xl text-hot-pink shrink-0">
                            <i className="fas fa-leaf"></i>
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-hot-pink mb-1.5">Dietary options</h3>
                            <p className="text-sm md:text-base text-gray-700">Gluten-free, vegan, and vegetarian options available</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section - Carousel */}
            <CarouselReviews />

            {/* Find Us & Contact Section */}
            <div className="py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Location & Hours */}
                    <section>
                        <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-4 md:mb-6 text-center">
                            <i className="fas fa-map-marker-alt"></i> Find us
                        </h2>
                        <LocationInfo openingHoursText={openingHoursText} restaurantStatus={restaurantStatus} />
                    </section>

                    {/* Contact Methods */}
                    <section>
                        <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-4 md:mb-6 text-center">
                            <i className="fas fa-comments"></i> Contact us
                        </h2>
                        <ContactUs />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
