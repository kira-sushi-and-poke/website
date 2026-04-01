import React from "react";
import Link from "next/link";
import CarouselReviews from "@/components/CarouselReviews";

// Generate metadata for SEO
export const metadata = {
    title: "Menu | Kira Sushi & Poke",
    description: "Explore our menu of fresh sushi rolls, poke bowls, and Japanese dishes. Made daily with premium ingredients for dine-in or takeaway.",
};

export default function MenuPage() {
    return (
        <div className="py-8 md:py-12 px-4 md:px-10 max-w-7xl mx-auto overflow-visible">
            <h1 className="font-heading text-hot-pink mb-4 md:mb-6">Menu | Kira Sushi & Poke</h1>

            {/* Menu Choice Section */}
            <div className="mb-6 md:mb-8 p-5 md:p-6 bg-gray-50 rounded-lg shadow-soft">
                <p className="text-gray-700 text-base md:text-base mb-5">
                    What brings you here today?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-4">
                    <Link 
                        href="/menu/view" 
                        className="p-5 bg-white rounded-lg shadow-soft active:shadow-md md:hover:shadow-soft-lg transition-all min-h-[100px] flex flex-col justify-center"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <i className="fas fa-book-open text-hot-pink text-2xl"></i>
                            <h3 className="font-heading text-hot-pink text-lg">Just browsing?</h3>
                        </div>
                        <p className="text-gray-600 text-sm md:text-base">View our menu here</p>
                    </Link>
                    <Link 
                        href="/menu/order" 
                        className="p-5 bg-hot-pink text-white rounded-lg shadow-soft-lg active:shadow-md md:hover:shadow-soft-lg transition-all min-h-[100px] flex flex-col justify-center"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <i className="fas fa-shopping-cart text-white text-2xl"></i>
                            <h3 className="font-heading text-white text-lg">Ready to order?</h3>
                        </div>
                        <p className="text-white/95 text-sm md:text-base">Start your order for pickup</p>
                    </Link>
                </div>
            </div>

            {/* Reviews Carousel */}
            <CarouselReviews />
        </div>
    );
}
