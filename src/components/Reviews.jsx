import React from "react";
import { allReviews, getPlatformIcon, getPlatformColor } from "@/data/reviews";

const Reviews = () => {

    return (
        <section className="reviews py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-6 md:mb-8 text-center">
                <i className="fas fa-star"></i> Customer reviews
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
