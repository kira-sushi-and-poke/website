import Reviews from "../components/Reviews";

const HomePage = () => {
    return (
        <div>
            {/* Work in Progress Notice */}
            <div className="bg-yellow py-3 px-8 text-center border-b-4 border-hot-pink">
                <p className="text-lg font-semibold text-white">
                    <i className="fas fa-tools text-xl"></i> Website Under Construction - Work in Progress <i className="fas fa-tools text-xl"></i>
                </p>
            </div>
            
            <div className="bg-white py-12 md:py-16 px-5 md:px-8 text-center border-b-8 border-hot-pink">
                <h1 className="text-4xl md:text-5xl font-bold text-hot-pink">
                    Welcome to Kira - Sushi & Poke!
                </h1>
                <p className="text-xl mt-4 text-yellow">Experience the flavors that bring joy!</p>
            </div>

            {/* How to Find Us & Contact Us - Side by Side on Desktop */}
            <div className="py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* How to Find Us Section */}
                    <section>
                        <h2 className="text-3xl md:text-4xl font-bold text-hot-pink mb-4 md:mb-6 text-center">
                            <i className="fas fa-map-marker-alt"></i> Find Us
                        </h2>
                        <div className="bg-white border-2 border-hot-pink rounded-lg p-4 md:p-6">
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-hot-pink mb-2">Address</h3>
                                    <p className="text-gray-700 text-lg">
                                        Kira Sushi and Poke<br />
                                        148 Front Street<br />
                                        Chester-le-Street<br />
                                        United Kingdom, DH3 3AY
                                    </p>
                                </div>
                                
                                {/* Google Map */}
                                <div className="rounded-lg overflow-hidden border-2 border-hot-pink">
                                    <iframe 
                                        src="https://www.google.com/maps?q=148+Front+Street,+Chester-le-Street,+DH3+3AY,+UK&output=embed"
                                        width="100%" 
                                        height="250" 
                                        style={{ border: 0 }}
                                        allowFullScreen="" 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Kira Sushi and Poke Location"
                                    ></iframe>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-hot-pink mb-2">Car parks</h3>
                                    <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                        <li>Market Hall Car Park - Front St, Chester-le-Street DH3 3AY</li>
                                        <li><span className="font-semibold">LOADING only</span> - Right in front of the restaurant</li>
                                        <li>
                                            <span className="font-semibold">NOTE:</span> Parking at these locations is at your own risk and responsibility. Please ensure you comply with all parking restrictions.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How to Contact Us Section */}
                    <section>
                        <h2 className="text-3xl md:text-4xl font-bold text-hot-pink mb-4 md:mb-6 text-center">
                            <i className="fas fa-comments"></i> Contact Us
                        </h2>
                        <div className="bg-white border-2 border-hot-pink rounded-lg p-4 md:p-6">
                            <div className="space-y-4 md:space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-hot-pink mb-3">Phone</h3>
                                    <p className="text-gray-700 mb-2">
                                        <a href="tel:+1234567890" className="text-yellow hover:text-hot-pink transition-colors text-lg font-semibold">
                                            (123) 456-7890
                                        </a>
                                    </p>
                                    <p className="text-sm text-gray-600">Call us for reservations or inquiries</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-hot-pink mb-3">Email</h3>
                                    <p className="text-gray-700 mb-2">
                                        <a href="mailto:info@kirasushi.com" className="text-yellow hover:text-hot-pink transition-colors text-lg font-semibold">
                                            info@kirasushi.com
                                        </a>
                                    </p>
                                    <p className="text-sm text-gray-600">We'll respond within 24 hours</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-hot-pink mb-3">Reservations</h3>
                                    <p className="text-gray-700 mb-2">
                                        <span className="text-lg font-semibold">Walk-ins welcome!</span>
                                    </p>
                                    <p className="text-sm text-gray-600">Or call ahead for groups of 6+</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-hot-pink mb-3">Social Media</h3>
                                    <p className="text-gray-700 mb-3">
                                        Follow us for daily specials and updates!
                                    </p>
                                    <div className="flex gap-4">
                                        <a 
                                            href="https://www.instagram.com/kirasushiandpoke" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-yellow hover:text-hot-pink transition-colors font-semibold"
                                        >
                                            <i className="fab fa-instagram text-2xl"></i>
                                            Instagram
                                        </a>
                                        <a 
                                            href="https://www.facebook.com/kirasushiandpoke" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-yellow hover:text-hot-pink transition-colors font-semibold"
                                        >
                                            <i className="fab fa-facebook text-2xl"></i>
                                            Facebook
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Reviews Section */}
            <Reviews />
        </div>
    );
};

export default HomePage;
