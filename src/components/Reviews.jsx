import React from "react";

const Reviews = () => {
    const reviews = [
        {
            id: 1,
            name: "Sarah M.",
            rating: 5,
            comment: "Absolutely amazing! The freshest sushi I've had outside of Japan. The Dragon Roll is a must-try!",
            date: "2 weeks ago"
        },
        {
            id: 2,
            name: "Michael T.",
            rating: 5,
            comment: "Perfect spot for family dinners. The sharing platters are generous and delicious. Staff is super friendly!",
            date: "1 month ago"
        },
        {
            id: 3,
            name: "Emily R.",
            rating: 5,
            comment: "The poke bowls are incredible! Fresh ingredients, great portions, and the atmosphere is lovely.",
            date: "3 weeks ago"
        },
        {
            id: 4,
            name: "David L.",
            rating: 4,
            comment: "Great food and quick service. The prices are reasonable for the quality. Will definitely be back!",
            date: "1 week ago"
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
