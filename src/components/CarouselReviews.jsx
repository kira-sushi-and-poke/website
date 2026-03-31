"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { allReviews, getPlatformIcon, getPlatformColor } from "@/data/reviews";

const CarouselReviews = () => {
    const reviews = allReviews.slice(0, 6);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reviewsPerView, setReviewsPerView] = useState(1);

    const totalSlides = Math.ceil(reviews.length / reviewsPerView);

    // Handle responsive reviews per view
    useEffect(() => {
        const updateReviewsPerView = () => {
            const width = window.innerWidth;
            setReviewsPerView(width >= 1024 ? 3 : width >= 768 ? 2 : 1);
        };
        
        updateReviewsPerView();
        window.addEventListener('resize', updateReviewsPerView);
        return () => window.removeEventListener('resize', updateReviewsPerView);
    }, []);

    const goToNext = () => setCurrentIndex((prev) => (prev + 1) % totalSlides);
    const goToPrevious = () => setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    const goToSlide = (index) => setCurrentIndex(index);

    const renderStars = (rating) => (
        <div className="flex" role="img" aria-label={`${rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
                <i key={i} className={`fas fa-star text-lg ${i < rating ? 'text-yellow' : 'text-gray-300'}`} />
            ))}
        </div>
    );

    const renderPlatformBadge = (platform) => (
        platform === "tripadvisor" ? (
            <span className="text-sm font-semibold text-green-600">TripAdvisor</span>
        ) : (
            <i className={`fab ${getPlatformIcon(platform)} ${getPlatformColor(platform)} text-xl`} aria-label={platform} />
        )
    );

    const renderReview = (review) => (
        <div key={review.id} className="bg-white border-2 border-hot-pink rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow flex-1">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-hot-pink">{review.name}</h3>
                {renderPlatformBadge(review.platform)}
            </div>
            <div className="flex items-center justify-between mb-3">
                {renderStars(review.rating)}
                <time className="text-xs text-gray-500" dateTime={review.date}>{review.date}</time>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
        </div>
    );

    const arrowButtonClass = "flex absolute top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-hot-pink text-white items-center justify-center hover:bg-hot-pink/90 transition-all md:opacity-0 md:group-hover:opacity-100 hover:opacity-100 shadow-lg z-10";

    return (
        <section className="reviews-carousel py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-6 md:mb-8 text-center">
                <i className="fas fa-star"></i> Customer reviews
            </h2>

            <div className="relative group">
                <div className="overflow-hidden">
                    <div 
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                            <div key={slideIndex} className="min-w-full flex gap-4 md:gap-6">
                                {reviews.slice(slideIndex * reviewsPerView, (slideIndex + 1) * reviewsPerView).map(renderReview)}
                            </div>
                        ))}
                    </div>
                </div>

                {totalSlides > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className={`${arrowButtonClass} left-0 -translate-x-4 md:-translate-x-6 lg:-translate-x-8`}
                            aria-label="Previous reviews"
                        >
                            <i className="fas fa-chevron-left text-sm md:text-base" />
                        </button>
                        <button
                            onClick={goToNext}
                            className={`${arrowButtonClass} right-0 translate-x-4 md:translate-x-6 lg:translate-x-8`}
                            aria-label="Next reviews"
                        >
                            <i className="fas fa-chevron-right text-sm md:text-base" />
                        </button>
                    </>
                )}

                {totalSlides > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: totalSlides }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all ${
                                    index === currentIndex ? "bg-hot-pink w-8 md:w-10" : "bg-gray-300 hover:bg-hot-pink/50"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                                aria-current={index === currentIndex ? "true" : "false"}
                            />
                        ))}
                    </div>
                )}

                <div className="text-center mt-6">
                    <Link href="/reviews" className="inline-flex items-center gap-2 text-hot-pink font-semibold hover:underline transition-all">
                        View All Reviews
                        <i className="fas fa-arrow-right text-sm" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CarouselReviews;
