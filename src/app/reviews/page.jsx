import Link from "next/link";
import Reviews from "@/components/Reviews";

const ReviewsPage = () => {
    return (
        <div className="py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-hot-pink text-center">
                Reviews | Kira Sushi & Poke
            </h1>
            
            <p className="text-center text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
                5-star reviews from customers across Chester-le-Street and County Durham. See why locals love our fresh <Link href="/menu#sushi" className="text-hot-pink font-semibold hover:underline">sushi</Link>, <Link href="/menu#poke" className="text-hot-pink font-semibold hover:underline">poke bowls</Link>, and <Link href="/menu#hot" className="text-hot-pink font-semibold hover:underline">Japanese hot dishes</Link>.
            </p>

            {/* Reviews Section */}
            <Reviews />

            {/* SEO Content Section - After Reviews */}
            <div className="mt-12 max-w-4xl mx-auto">
                <div className="bg-white border-2 border-hot-pink rounded-lg p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-4 text-center">
                        Why Chester-le-Street loves Kira Sushi & Poke
                    </h2>
                    <div className="text-gray-700 leading-relaxed space-y-3">
                        <p>
                            Our 5-star customer reviews reflect our commitment to fresh ingredients, generous portions, and exceptional service. From signature <Link href="/menu#sushi" className="text-hot-pink font-semibold hover:underline">Kira Rolls</Link> to comforting <Link href="/menu#hot" className="text-hot-pink font-semibold hover:underline">chicken katsu curry</Link>, we serve authentic Japanese cuisine that keeps Chester-le-Street coming back.
                        </p>
                        <p className="text-center font-semibold">
                            <strong>148 Front Street, Chester-le-Street, DH3 3AY</strong><br />
                            Open 7 days | 11am - 7pm
                        </p>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center bg-hot-pink/10 border-2 border-hot-pink rounded-lg p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-3">
                    Leave us a review!
                </h2>
                <p className="text-gray-700 mb-6">
                    We'd love to hear about your experience. Share your thoughts on your favorite platform!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a
                        href="https://www.google.com/search?q=kira+sushi+and+poke"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-hot-pink hover:bg-hot-pink hover:text-white transition-colors"
                    >
                        <i className="fab fa-google"></i>
                        Google
                    </a>
                    <a
                        href="https://www.facebook.com/people/Kira-Sushi-Poke/61583413766423/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-hot-pink hover:bg-hot-pink hover:text-white transition-colors"
                    >
                        <i className="fab fa-facebook"></i>
                        Facebook
                    </a>
                    <a
                        href="https://www.tripadvisor.com/Restaurant_Review-g1156051-d34241645-Reviews-Kira_Sushi_and_Poke-Chester_le_Street_County_Durham_England.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-hot-pink hover:bg-hot-pink hover:text-white transition-colors"
                    >
                        TripAdvisor
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ReviewsPage;
