import React from "react";

const AboutUs = () => {
    return (
        <div className="about-us py-8 md:py-12 px-5 md:px-10 max-w-screen-xl mx-auto">
            {/* Main About Section */}
            <section className="mb-8 md:mb-12">
                <h1 className="text-hot-pink text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6 font-bold">About Us</h1>
                <p className="text-lg leading-relaxed mb-4">Welcome to Kira Sushi and Poke! We pride ourselves on serving the freshest ingredients and providing a memorable dining experience. Our chefs are dedicated to crafting delicious dishes that reflect our passion for food.</p>
                <p className="text-lg leading-relaxed">Join us for a meal and discover the flavors that make our restaurant a favorite among locals and visitors alike.</p>
            </section>

            {/* History Section */}
            <section className="bg-white border-2 border-hot-pink rounded-lg p-4 md:p-6 lg:p-8 mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-hot-pink mb-4 md:mb-6">
                    <i className="fas fa-book-open"></i> Our Story
                </h2>
                <div className="space-y-3 md:space-y-4 text-gray-700 leading-relaxed">
                    <p className="text-lg">
                        Kira Sushi and Poke was founded in 2018 with a simple mission: to bring authentic, 
                        fresh Japanese cuisine to our community. What started as a small dream has grown into 
                        a beloved local establishment.
                    </p>
                    <p className="text-lg">
                        Our founder, Chef Kira Tanaka, trained in Tokyo for over a decade before bringing her 
                        expertise and passion to our city. She believed that everyone deserves access to 
                        high-quality, fresh sushi and poke bowls at prices that don't break the bank.
                    </p>
                    <p className="text-lg">
                        Today, we continue to honor traditional Japanese culinary techniques while embracing 
                        local flavors and ingredients. Every dish is prepared with care, using sustainably 
                        sourced fish and the freshest produce available.
                    </p>
                    <p className="text-lg font-semibold text-hot-pink">
                        From our family to yours, thank you for making us part of your dining experience!
                    </p>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
