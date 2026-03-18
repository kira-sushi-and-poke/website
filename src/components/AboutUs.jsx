import React from "react";

const AboutUs = () => {
    return (
        <div className="about-us py-8 md:py-12 px-5 md:px-10 max-w-screen-xl mx-auto">
            {/* Main About Section */}
            <section className="mb-8 md:mb-12">
                <h1 className="text-hot-pink text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 font-bold">About | Kira Sushi & Poke</h1>
                <p className="text-lg md:text-xl leading-relaxed mb-4">Welcome to Kira Sushi and Poke in Chester-le-Street. Every piece is crafted by Chef Radori, a master sushi chef with over 10 years of experience. We believe sushi should be an experience you feel as much as you taste.</p>
                <p className="text-lg md:text-xl leading-relaxed">Join us at our counter for fresh sashimi, premium bluefin tuna, and authentic poke bowls prepared right before your eyes. Quality over quantity, every single time.</p>
            </section>

            {/* Values & Expertise Section */}
            <section className="grid md:grid-cols-3 gap-6 mb-8 md:mb-12">
                <div className="bg-yellow/10 border-2 border-yellow rounded-lg p-6">
                    <div className="text-4xl mb-3 text-hot-pink"><i className="fas fa-utensils"></i></div>
                    <h3 className="text-xl font-bold text-hot-pink mb-2">Master Craftsmanship</h3>
                    <p className="text-gray-700">Over 10 years of sushi chef experience ensuring every roll, nigiri, and sashimi is crafted to perfection using traditional Japanese techniques.</p>
                </div>
                <div className="bg-yellow/10 border-2 border-yellow rounded-lg p-6">
                    <div className="text-4xl mb-3 text-hot-pink"><i className="fas fa-fish"></i></div>
                    <h3 className="text-xl font-bold text-hot-pink mb-2">Premium Ingredients</h3>
                    <p className="text-gray-700">Fresh, high-quality ingredients including bluefin tuna and daily-sourced fish. We never compromise on quality for our Chester-le-Street community.</p>
                </div>
                <div className="bg-yellow/10 border-2 border-yellow rounded-lg p-6">
                    <div className="text-4xl mb-3 text-hot-pink"><i className="fas fa-leaf"></i></div>
                    <h3 className="text-xl font-bold text-hot-pink mb-2">Dietary Options</h3>
                    <p className="text-gray-700">Accommodating all dietary needs with gluten-free sashimi, vegan poke bowls, and vegetarian options. Everyone deserves great Japanese food.</p>
                </div>
            </section>

            {/* History Section */}
            <section className="bg-white border-2 border-hot-pink rounded-lg p-4 md:p-6 lg:p-8 mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-hot-pink mb-4 md:mb-6">
                    <i className="fas fa-book-open"></i> Chef Radori's Story
                </h2>
                <div className="space-y-4 md:space-y-5 text-gray-700 leading-relaxed">
                    <p className="text-base md:text-lg">
                        Hi, I'm Chef Radori. After more than a decade behind the sushi bar, I've come to believe sushi should be an experience you feel as much as you taste. Every piece is crafted slowly and thoughtfully—never rushed and never compromised.
                    </p>
                    <p className="text-base md:text-lg">
                        Manchester has always been home. Years ago, I was working in London when my father was diagnosed with terminal cancer, so I moved back to be with him. He passed a year later. Through it all, my wife (she's from Chester-le-Street) and I held on to our dream of opening a restaurant here. We thought it would happen four or five years ago. Life slowed us down, but it never stopped the dream.
                    </p>
                    <p className="text-base md:text-lg">
                        During that time I met investors and explored partnerships in Manchester, Newcastle, and Durham. Each one fell through. The vision never changed: Kira Sushi & Poke would be about real craft and real ingredients. Quality over quantity, so every bite is clean, balanced, and memorable.
                    </p>
                    <p className="text-base md:text-lg">
                        The turning point came when I made sushi for my daughter's book-reading at school. On the way back, I dropped off a few extra pieces at Willow's in Chester-le-Street. The team tasted them and said, "Our town needs this." That simple encouragement turned a long-held plan into a path forward.
                    </p>
                    <p className="text-base md:text-lg">
                        Today, Kira Sushi & Poke is open and thriving. We serve fresh, feel-good bowls and rolls; premium ingredients (yes, including bluefin tuna) prepared to order; and offer a seat at the counter where you can chat with me while your sushi is made right before your eyes. We don't chase volume. We chase clarity of flavor, precision, and warmth.
                    </p>
                    <p className="text-base md:text-lg font-semibold">
                        Thank you, Chester-le-Street, for the encouragement and support. If you believe food tastes better when you know the hands that made it, come visit us. I look forward to serving you, one perfect piece at a time.
                    </p>
                    <p className="text-base md:text-lg italic text-hot-pink">
                        — Chef Radori, Kira Sushi & Poke
                    </p>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
