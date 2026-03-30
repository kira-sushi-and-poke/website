import React from "react";

const Reviews = () => {
    const reviews = {
        google: [],
        facebook: [
            {
                id: 4,
                name: "Rubee Mellon",
                rating: 5,
                comment: "They are lovely people. Their sushi menu is creative and not just what everyone else would offer. The food is fresh and incredibly tasty. I would definitely recommend that everyone pay them a visit :)",
                date: "Mar 2026",
                platform: "facebook"
            },
            {
                id: 8,
                name: "Craig Birkett",
                rating: 5,
                comment: "High quality sushi made to order. Their signature Kira Rolls were phenomenal and the Salmon Teriyaki bowl a generous portion. Super fresh ingredients and friendly staff. Makes the high street a better place! Hope it succeeds.",
                date: "Mar 2026",
                platform: "facebook"
            },
            {
                id: 9,
                name: "Caroline Jones",
                rating: 5,
                comment: "We had the chicken katsu and the chicken dumplings. It was totes delish and generous portions, 10/10!",
                date: "Mar 2026",
                platform: "facebook"
            },
            {
                id: 6,
                name: "Rosie Martin",
                rating: 5,
                comment: "Absolutely stunning sushi....I got Kira and best sushi I've ever tasted.....staff so welcoming and highly recommend to everyone x",
                date: "Jan 2026",
                platform: "facebook"
            },
            {
                id: 7,
                name: "Alana Chipchase",
                rating: 5,
                comment: "100% recommend the katsu chicken curry fresh ingredients super tasty 👌🏻 will be back again ! Xx",
                date: "Jan 2026",
                platform: "facebook"
            }
        ],
        tripadvisor: [
            {
                id: 10,
                name: "Matt T",
                comment: "Some of the best sushi I have ever had and I mean that with no exaggeration! The presentation was incredible. Would certainly recommend!",
                rating: 5,
                date: "27 Mar 2026",
                platform: "tripadvisor"
            },
            {
                id: 5,
                name: "StevefromWashington",
                rating: 5,
                comment: "Excellent fresh sushi and very tasty chicken katsu curry. Top quality food at sensible prices.",
                date: "28 Feb 2026",
                platform: "tripadvisor"
            }
        ]
    };
    const allReviews = [...reviews.google, ...reviews.facebook, ...reviews.tripadvisor];

    const getPlatformIcon = (platform) => {
        switch(platform) {
            case "google": return "fa-google";
            case "facebook": return "fa-facebook";
            case "tripadvisor": return "fa-kiwi-bird";
            default: return "fa-star";
        }
    };

    const getPlatformColor = (platform) => {
        switch(platform) {
            case "google": return "text-blue-600";
            case "facebook": return "text-blue-700";
            case "tripadvisor": return "text-green-600";
            default: return "text-hot-pink";
        }
    };

    return (
        <section className="reviews py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-hot-pink mb-6 md:mb-8 text-center">
                <i className="fas fa-star"></i> Customer Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {allReviews.map(review => (
                    <div key={review.id} className="bg-white border-2 border-hot-pink rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-hot-pink">{review.name}</h3>
                            {review.platform === "tripadvisor" ? (
                                <span className="text-sm font-semibold text-green-600">TripAdvisor</span>
                            ) : (
                                <i className={`fab ${getPlatformIcon(review.platform)} ${getPlatformColor(review.platform)} text-xl`} aria-label={review.platform}></i>
                            )}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex" role="img" aria-label={`${review.rating} out of 5 stars`}>
                                {[...Array(review.rating)].map((_, i) => (
                                    <i key={i} className="fas fa-star text-yellow text-lg"></i>
                                ))}
                                {[...Array(5 - review.rating)].map((_, i) => (
                                    <i key={i} className="fas fa-star text-gray-300 text-lg"></i>
                                ))}
                            </div>
                            <time className="text-xs text-gray-500" dateTime={review.date}>{review.date}</time>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Reviews;
