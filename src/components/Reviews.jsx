import React from "react";

const Reviews = () => {
    const reviews = [
        {
            id: 1,
            name: "Craig Birkett",
            rating: 5,
            comment: "High quality sushi made to order. Their signature Kira Rolls were phenomenal and the Salmon Teriyaki bowl a generous portion. Super fresh ingredients and friendly staff. Makes the high street a better place! Hope it succeeds.",
            date: "Mar 2026"
        },
        {
            id: 2,
            name: "Caroline Jones",
            rating: 5,
            comment: "We had the chicken katsu and the chicken dumplings. It was totes delish and generous portions, 10/10!",
            date: "Mar 2026"
        },
        {
            id: 3,
            name: "StevefromWashington",
            rating: 5,
            comment: "Excellent fresh sushi and very tasty chicken katsu curry. Top quality food at sensible prices.",
            date: "Feb 2026"
        },
        {
            id: 4,
            name: "Rosie Martin",
            rating: 5,
            comment: "Absolutely stunning sushi....I got Kira and best sushi I've ever tasted.....staff so welcoming and highly recommend to everyone x",
            date: "Jan 2026"
        }
    ];

    return (
        <section className="reviews py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-hot-pink mb-6 md:mb-8 text-center">
                <i className="fas fa-star"></i> Customer Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {reviews.map(review => (
                    <div key={review.id} className="bg-white border-2 border-hot-pink rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-hot-pink">{review.name}</h3>
                            <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex mb-3">
                            {[...Array(review.rating)].map((_, i) => (
                                <i key={i} className="fas fa-star text-yellow text-xl"></i>
                            ))}
                            {[...Array(5 - review.rating)].map((_, i) => (
                                <i key={i} className="fas fa-star text-gray-300 text-xl"></i>
                            ))}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Reviews;
